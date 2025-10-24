import { Resend } from "resend";
import { render } from "@react-email/render";
import DocumentUploadEmail from "@/emails/DocumentUploadEmail";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface DocumentUploadNotification {
  propertyId: string;
  documentCount: number;
  documentType: string;
  year: number;
  month: number;
  portalUrl?: string;
}

/**
 * Sends email notifications to all users who have access to a property
 * when new documents are uploaded
 */
export async function sendDocumentUploadNotifications({
  propertyId,
  documentCount,
  documentType,
  year,
  month,
  portalUrl = process.env.NEXTAUTH_URL || "https://your-portal-domain.com",
}: DocumentUploadNotification) {
  try {
    // Get the property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        name: true,
        userProperties: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      console.error(`Property with ID ${propertyId} not found`);
      return { success: false, error: "Property not found" };
    }

    // Get all users who have access to this property
    const users = property.userProperties.map((up) => up.user);

    if (users.length === 0) {
      console.warn(`No users found for property ${property.name}`);
      return { success: true, message: "No users to notify" };
    }

    const emailResults = [];

    // Send email to each user
    for (const user of users) {
      try {
        const emailHtml = await render(
          DocumentUploadEmail({
            userName: user.name || user.email,
            propertyName: property.name,
            documentCount,
            documentType,
            year,
            month,
            portalUrl,
          })
        );

        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@yourcompany.com",
          to: [user.email],
          subject: `New Document${documentCount > 1 ? "s" : ""} Available - ${property.name}`,
          html: emailHtml,
        });

        emailResults.push({
          userId: user.id,
          email: user.email,
          success: true,
          emailId: result.data?.id,
        });

        console.log(
          `Email sent to ${user.email} for property ${property.name}`
        );
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        emailResults.push({
          userId: user.id,
          email: user.email,
          success: false,
          error:
            emailError instanceof Error ? emailError.message : "Unknown error",
        });
      }
    }

    const successCount = emailResults.filter((r) => r.success).length;
    const failCount = emailResults.filter((r) => !r.success).length;

    return {
      success: true,
      message: `Sent ${successCount} email${successCount !== 1 ? "s" : ""} successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
      results: emailResults,
    };
  } catch (error) {
    console.error("Error sending document upload notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generic email sending function
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    if (!validateEmailConfig()) {
      throw new Error("Email service not properly configured");
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

    const emailData: any = {
      from: fromEmail,
      to: [to],
      subject: subject,
    };

    if (html) {
      emailData.html = html;
    }
    if (text) {
      emailData.text = text;
    } else if (!html) {
      // If neither html nor text is provided, use subject as text
      emailData.text = subject;
    }

    const result = await resend.emails.send(emailData);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validates that email service is properly configured
 */
export function validateEmailConfig() {
  const requiredEnvVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  };

  const missing = [];
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `Email service not fully configured. Missing: ${missing.join(", ")}`
    );
    return false;
  }

  return true;
}
