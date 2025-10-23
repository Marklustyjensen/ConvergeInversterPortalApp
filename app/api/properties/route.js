import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { options } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Use the actual database user ID for the properties lookup
    const actualUserId = user.id;

    // Fetch properties for the authenticated user
    const userProperties = await prisma.userProperty.findMany({
      where: {
        userId: actualUserId,
      },
      include: {
        property: true,
      },
    });

    // Extract just the property data
    const properties = userProperties.map((up) => up.property);

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties", details: error.message },
      { status: 500 }
    );
  }
}
