import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Check if the assignment already exists
    const existingAssignment = await prisma.userProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "User is already assigned to this property" },
        { status: 400 }
      );
    }

    // Create the assignment
    const assignment = await prisma.userProperty.create({
      data: {
        userId: userId,
        propertyId: propertyId,
      },
      include: {
        property: true,
      },
    });

    return NextResponse.json({
      message: "Property assigned successfully",
      assignment,
    });
  } catch (error) {
    console.error("Assign property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Delete the assignment
    await prisma.userProperty.delete({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: propertyId,
        },
      },
    });

    return NextResponse.json({
      message: "Property unassigned successfully",
    });
  } catch (error) {
    console.error("Unassign property error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
