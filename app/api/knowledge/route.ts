import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackendServer } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const data = await fetchFromBackendServer(
      request,
      `/knowledge?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );

    return NextResponse.json({
      success: true,
      data: data?.data || data || [],
      total: data?.total || (Array.isArray(data) ? data.length : 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch knowledge",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const upstream = new FormData();
    for (const [key, value] of formData.entries()) {
      upstream.append(key, value);
    }

    const data = await fetchFromBackendServer(request, "/knowledge/with-file", {
      method: "POST",
      body: upstream,
    });

    return NextResponse.json({
      success: true,
      data,
      message: "Knowledge created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create knowledge",
      },
      { status: 500 }
    );
  }
}
