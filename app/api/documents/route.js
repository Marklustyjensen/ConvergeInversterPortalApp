import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const documentType = searchParams.get("documentType");

    // First try to find user by ID, if not found, find by username
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: session.user.username },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's properties
    const userProperties = await prisma.userProperty.findMany({
      where: {
        userId: user.id,
      },
      select: {
        propertyId: true,
      },
    });

    const userPropertyIds = userProperties.map((up) => up.propertyId);

    if (userPropertyIds.length === 0) {
      return NextResponse.json([]);
    }

    // Build where clause for filtering documents
    const whereClause = {
      propertyId: {
        in: userPropertyIds,
      },
    };

    // Add additional filters if provided
    if (propertyId && userPropertyIds.includes(propertyId)) {
      whereClause.propertyId = propertyId;
    }
    if (year) whereClause.year = parseInt(year);
    if (month) whereClause.month = parseInt(month);
    if (documentType) whereClause.documentType = documentType;

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { uploadDate: "desc" }],
    });

    // Return only safe fields (exclude sensitive info like blobKey, uploadedBy, etc.)
    const safeDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.originalName,
      type: doc.type,
      size: doc.size,
      url: doc.url,
      property: doc.property,
      documentType: doc.documentType,
      year: doc.year,
      month: doc.month,
      uploadDate: doc.uploadDate,
    }));

    return NextResponse.json(safeDocuments);
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
