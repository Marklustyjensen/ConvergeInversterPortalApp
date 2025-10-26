import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all properties for admin
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        images: true,
        primaryImage: true,
        createdAt: true,
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
