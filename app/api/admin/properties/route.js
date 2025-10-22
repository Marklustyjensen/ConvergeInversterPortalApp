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

    const properties = await prisma.property.findMany({
      include: {
        userProperties: {
          include: {
            user: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Admin properties GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, address, city, state, zip, code } = await request.json();

    // Validate required fields
    if (!name || !address || !city || !state || !zip || !code) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if property code already exists
    const existingProperty = await prisma.property.findUnique({
      where: { code },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: "Property code already exists" },
        { status: 400 }
      );
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        name,
        address,
        city,
        state,
        zip,
        code: code.toUpperCase(),
        images: [],
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Admin properties POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
