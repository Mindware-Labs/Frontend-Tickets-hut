import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";

// GET /api/agents - Fetch all agents
export async function GET() {
  try {
    const data = await fetchFromBackend("/agents");
    return NextResponse.json({
      success: true,
      data: data.data || data,
      count: data.total || (Array.isArray(data) ? data.length : 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch agents",
      },
      { status: 500 }
    );
  }
}
