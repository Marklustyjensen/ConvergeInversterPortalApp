import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = params;
    const body = await request.json();
    const { name, address, city, state, zip, code } = body;

    // Validate required fields
    if (!name || !address || !city || !state || !zip || !code) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if code is unique (excluding current property)
    const existingProperty = await prisma.property.findFirst({
      where: {
        code,
        NOT: { id: propertyId },
      },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: "Property code must be unique" },
        { status: 400 }
      );
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name,
        address,
        city,
        state,
        zip,
        code: code.toUpperCase(),
      },
      include: {
        userProperties: {
          include: {
            user: {
              select: { name: true, username: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("Admin property PUT error:", error);
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

    const { propertyId } = params;

    await prisma.property.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Admin property DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
