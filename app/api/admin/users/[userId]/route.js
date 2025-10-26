import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options.js";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const body = await request.json();
    const { name, username, email, password, admin } = body;

    // Check if another user already has this username or email (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [{ username: username }, { email: email }],
          },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Prevent removing admin from the current session user
    if (userId === session.user.id && admin === false) {
      return NextResponse.json(
        { error: "Cannot remove admin privileges from yourself" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      name: name || null,
      username,
      email,
      admin,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Admin user PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
