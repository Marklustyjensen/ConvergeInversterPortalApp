import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { sendDocumentUploadNotifications } from "@/lib/emailService";

export async function POST(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const propertyId = formData.get("propertyId");
    const year = parseInt(formData.get("year"));
    const month = parseInt(formData.get("month"));
    const documentType = formData.get("documentType");

    // Validate required fields
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!propertyId || !year || !month || !documentType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: propertyId, year, month, or documentType",
        },
        { status: 400 }
      );
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Validate document type
    if (!["financial", "star_report"].includes(documentType)) {
      return NextResponse.json(
        {
          error: "Invalid document type. Must be 'financial' or 'star_report'",
        },
        { status: 400 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      try {
        // Create a structured filename for blob storage
        // Format: property-uuid/year/month/document-type/original-filename
        const fileExtension = file.name.split(".").pop();
        const timestamp = Date.now();
        const blobPath = `${property.id}/${year}/${month.toString().padStart(2, "0")}/${documentType}/${timestamp}-${file.name}`;

        // Upload to Vercel Blob (if configured)
        let blobUrl = null;
        let blobKey = null;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
          try {
            const blob = await put(blobPath, file, {
              access: "public",
            });
            blobUrl = blob.url;
            blobKey = blob.pathname;
          } catch (blobError) {
            console.error("Blob upload error:", blobError);
            // Fall back to local handling if blob upload fails
          }
        }

        // If no blob storage configured, create a placeholder URL
        if (!blobUrl) {
          blobUrl = `/api/admin/documents/download/${timestamp}-${file.name}`;
          console.log(
            "Warning: Vercel Blob storage not configured. Using placeholder URL."
          );
        }

        // Save document record to database
        const document = await prisma.document.create({
          data: {
            name: `${timestamp}-${file.name}`,
            originalName: file.name,
            type: file.type,
            size: file.size,
            url: blobUrl,
            blobKey: blobKey,
            propertyId: propertyId,
            documentType: documentType,
            year: year,
            month: month,
            uploadedBy: session.user.id,
          },
          include: {
            property: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        });

        uploadResults.push({
          id: document.id,
          name: document.originalName,
          size: document.size,
          type: document.type,
          property: document.property,
          documentType: document.documentType,
          year: document.year,
          month: document.month,
          uploaded: true,
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json(
          { error: `Error processing file ${file.name}: ${fileError.message}` },
          { status: 500 }
        );
      }
    }

    // Send email notifications to property owners
    try {
      console.log(
        `📧 Attempting to send email notifications for property: ${propertyId}`
      );
      console.log(
        `📄 Document details: ${uploadResults.length} ${documentType} documents for ${year}/${month}`
      );

      const emailResult = await sendDocumentUploadNotifications({
        propertyId,
        documentCount: uploadResults.length,
        documentType,
        year,
        month,
      });

      console.log("📧 Email notification result:", emailResult);
      console.log("📧 Email notification message:", emailResult.message);

      return NextResponse.json({
        message: `Successfully uploaded ${uploadResults.length} file(s)`,
        files: uploadResults,
        emailNotification: emailResult,
      });
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);

      // Don't fail the upload if emails fail - just log it
      return NextResponse.json({
        message: `Successfully uploaded ${uploadResults.length} file(s)`,
        files: uploadResults,
        emailNotification: {
          success: false,
          error: "Failed to send email notifications",
        },
      });
    }
  } catch (error) {
    console.error("Admin documents upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
