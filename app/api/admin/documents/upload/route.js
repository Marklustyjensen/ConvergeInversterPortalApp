import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // For now, simulate file upload since online server is not set up
    // In production, you would upload to your cloud storage service
    const uploadResults = [];

    for (const file of files) {
      // Simulate processing
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      // Simulate successful upload
      uploadResults.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded: true,
      });
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadResults.length} file(s)`,
      files: uploadResults,
    });
  } catch (error) {
    console.error("Admin documents upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
