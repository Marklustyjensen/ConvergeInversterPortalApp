import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import {
  sendDocumentUploadNotifications,
  validateEmailConfig,
} from "@/lib/emailService";
import { prisma } from "@/lib/prisma";

/**
 * Test endpoint for email service
 * POST /api/admin/test-email
 */
export async function POST(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId } = body;

    // Validate email configuration
    const isConfigured = validateEmailConfig();

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error:
          "Email service not properly configured. Check RESEND_API_KEY and RESEND_FROM_EMAIL environment variables.",
      });
    }

    // If no propertyId provided, just check configuration
    if (!propertyId) {
      return NextResponse.json({
        success: true,
        message: "Email service is properly configured",
        configured: true,
      });
    }

    // Verify property exists and has users
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        name: true,
        userProperties: {
          select: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({
        success: false,
        error: "Property not found",
      });
    }

    const users = property.userProperties.map((up) => up.user);

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No users assigned to property "${property.name}". Assign users to the property first.`,
      });
    }

    // Send test email
    const result = await sendDocumentUploadNotifications({
      propertyId,
      documentCount: 1,
      documentType: "financial",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent for property "${property.name}"`,
      emailResult: result,
      recipients: users.map((u) => ({ email: u.email, name: u.name })),
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Check email service status
 * GET /api/admin/test-email
 */
export async function GET(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isConfigured = validateEmailConfig();

    return NextResponse.json({
      configured: isConfigured,
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
      message: isConfigured
        ? "Email service is properly configured"
        : "Email service needs configuration. Check RESEND_API_KEY and RESEND_FROM_EMAIL environment variables.",
    });
  } catch (error) {
    console.error("Email status check error:", error);
    return NextResponse.json({
      configured: false,
      error: "Error checking email service status",
    });
  }
}
