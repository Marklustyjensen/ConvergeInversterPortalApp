import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { options } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(options);

    console.log("=== DEBUG SESSION ===");
    console.log("Full session object:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      console.log("No session or user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user:", session.user);
    console.log("User ID from session:", session.user.id);
    console.log("User ID type:", typeof session.user.id);

    // First try to find user by ID, if not found, find by username
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.log(
        "User not found by ID, trying username:",
        session.user.username
      );
      user = await prisma.user.findUnique({
        where: { username: session.user.username },
      });
    }

    console.log("User lookup result:", user);

    if (!user) {
      console.log("User not found by ID or username");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use the actual database user ID for the properties lookup
    const actualUserId = user.id;
    console.log("Using actual user ID for properties lookup:", actualUserId);

    // Fetch properties for the authenticated user
    const userProperties = await prisma.userProperty.findMany({
      where: {
        userId: actualUserId,
      },
      include: {
        property: true,
      },
    });

    console.log("Found user properties:", userProperties.length);

    // Extract just the property data
    const properties = userProperties.map((up) => up.property);

    console.log("Returning properties:", properties);
    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
