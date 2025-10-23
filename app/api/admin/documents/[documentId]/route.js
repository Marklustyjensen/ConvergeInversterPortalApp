import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = params;

    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete from blob storage if configured and blobKey exists
    if (process.env.BLOB_READ_WRITE_TOKEN && document.blobKey) {
      try {
        await del(document.blobKey);
      } catch (blobError) {
        console.error("Error deleting from blob storage:", blobError);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({
      message: "Document deleted successfully",
      deletedDocument: {
        id: document.id,
        name: document.originalName,
      },
    });
  } catch (error) {
    console.error("Admin document DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
