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

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total properties
    const totalProperties = await prisma.property.count();

    // Get total investors (non-admin users)
    const totalInvestors = await prisma.user.count({
      where: {
        admin: false,
      },
    });

    // Get recent activity (placeholder - you can customize this)
    const recentActivity = [
      "New user registration: john.doe@example.com",
      "Property 'Downtown Hotel' was created",
      "Document 'Q3 Report.pdf' was uploaded",
      "User 'jane.smith' was assigned to property 'Seaside Resort'",
    ];

    return NextResponse.json({
      totalUsers,
      totalProperties,
      totalInvestors,
      recentActivity,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
