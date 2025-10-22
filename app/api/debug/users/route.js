import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(options);

    const users = await prisma.user.findMany({
      include: {
        userProperties: {
          include: {
            property: true,
          },
        },
      },
    });

    return NextResponse.json({
      session: session,
      userCount: users.length,
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        admin: user.admin,
        propertyCount: user.userProperties.length,
      })),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
