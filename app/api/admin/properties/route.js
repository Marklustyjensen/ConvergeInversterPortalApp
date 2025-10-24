import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";
import { uploadToBlob } from "@/lib/blobUtils";

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

    const formData = await request.formData();

    // Extract form fields
    const name = formData.get("name");
    const address = formData.get("address");
    const city = formData.get("city");
    const state = formData.get("state");
    const zip = formData.get("zip");
    const code = formData.get("code");
    const imageFile = formData.get("image");

    // Validate required fields
    if (!name || !address || !city || !state || !zip || !code) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if property code already exists
    const existingProperty = await prisma.property.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: "Property code already exists" },
        { status: 400 }
      );
    }

    let imageUrl = null;
    let images = [];

    // Handle image upload if provided
    if (imageFile && imageFile instanceof File) {
      try {
        // Generate a unique filename
        const filename = `${code.toUpperCase()}-${Date.now()}-${imageFile.name}`;
        imageUrl = await uploadToBlob(imageFile, filename);
        images = [imageUrl];
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
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
        images: images,
        primaryImage: imageUrl,
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
