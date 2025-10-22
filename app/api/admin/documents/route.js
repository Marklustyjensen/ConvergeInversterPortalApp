import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return mock data since we don't have document storage set up
    // In production, this would query your document storage system
    const mockDocuments = [
      {
        id: "1",
        name: "Q3 Financial Report.pdf",
        type: "application/pdf",
        size: 2048576, // 2MB in bytes
        uploadDate: "2024-10-01T10:00:00Z",
        url: "/documents/q3-financial-report.pdf",
      },
      {
        id: "2",
        name: "Property Investment Overview.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1536000, // 1.5MB in bytes
        uploadDate: "2024-09-28T14:30:00Z",
        url: "/documents/property-investment-overview.docx",
      },
      {
        id: "3",
        name: "Market Analysis.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 1024000, // 1MB in bytes
        uploadDate: "2024-09-25T09:15:00Z",
        url: "/documents/market-analysis.xlsx",
      },
    ];

    return NextResponse.json(mockDocuments);
  } catch (error) {
    console.error("Admin documents GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
