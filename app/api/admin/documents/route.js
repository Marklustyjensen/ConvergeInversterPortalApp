import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const documentType = searchParams.get("documentType");

    // Build where clause for filtering
    const whereClause = {};
    if (propertyId) whereClause.propertyId = propertyId;
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
        uploadedByUser: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { uploadDate: "desc" }],
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Admin documents GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
