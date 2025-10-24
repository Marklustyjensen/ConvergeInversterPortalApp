import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    let whereClause = {
      recipientId: session.user.id,
    };

    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        sentDate: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, isRead } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Verify the message belongs to the current user
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        recipientId: session.user.id,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: isRead,
        readDate: isRead ? new Date() : null,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
