import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const { admin } = await request.json();

    // Prevent removing admin from the current session user
    if (userId === session.user.id && admin === false) {
      return NextResponse.json(
        { error: "Cannot remove admin privileges from yourself" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { admin },
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Admin user PATCH error:", error);
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

    const { userId } = params;

    // Prevent deleting the current session user
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProperties: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user (cascade should handle UserProperty records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin user DELETE error:", error);

    // Provide more detailed error information
    let errorMessage = "Internal server error";
    if (error.code === "P2003") {
      errorMessage = "Cannot delete user due to related records";
    } else if (error.code === "P2025") {
      errorMessage = "User not found";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
