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

    // Get recent activity from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = [];

    try {
      // Get recent user registrations
      const recentUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          email: true,
          name: true,
          admin: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      // Get recent properties
      const recentProperties = await prisma.property.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          name: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      // Get recent document uploads
      const recentDocuments = await prisma.document.findMany({
        where: {
          uploadDate: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          originalName: true,
          uploadDate: true,
          uploadedByUser: {
            select: {
              name: true,
              email: true,
            },
          },
          property: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          uploadDate: "desc",
        },
        take: 5,
      });

      // Get recent user-property assignments
      const recentAssignments = await prisma.userProperty.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          property: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      // Combine all activities and sort by date
      const allActivities = [];

      recentUsers.forEach((user) => {
        const userType = user.admin ? "admin" : "investor";
        const displayName = user.name || user.email;
        allActivities.push({
          type: "user_registration",
          message: `New ${userType} registered: ${displayName}`,
          date: user.createdAt,
        });
      });

      recentProperties.forEach((property) => {
        allActivities.push({
          type: "property_created",
          message: `Property '${property.name}' was created`,
          date: property.createdAt,
        });
      });

      recentDocuments.forEach((doc) => {
        const uploaderName =
          doc.uploadedByUser.name || doc.uploadedByUser.email;
        allActivities.push({
          type: "document_uploaded",
          message: `Document '${doc.originalName}' was uploaded by ${uploaderName} for ${doc.property.name}`,
          date: doc.uploadDate,
        });
      });

      recentAssignments.forEach((assignment) => {
        const userName = assignment.user.name || assignment.user.email;
        allActivities.push({
          type: "user_assigned",
          message: `User '${userName}' was assigned to property '${assignment.property.name}'`,
          date: assignment.createdAt,
        });
      });

      // Sort all activities by date (most recent first) and take top 10
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      const recentActivityMessages = allActivities
        .slice(0, 10)
        .map((activity) => activity.message);

      recentActivity.push(...recentActivityMessages);
    } catch (activityError) {
      console.error("Error fetching recent activity:", activityError);
      // If activity fetching fails, still return the counts
      recentActivity.push("Error loading recent activity");
    }

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
