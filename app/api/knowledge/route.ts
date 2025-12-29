import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getBackendUrl(path: string) {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_API_URL}${cleaned}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const response = await fetch(
      getBackendUrl(`/knowledge?page=${page}&limit=${limit}`),
      { cache: "no-store" }
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to fetch knowledge",
        },
        { status: response.status }
      );
    }

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const upstream = new FormData();
    for (const [key, value] of formData.entries()) {
      upstream.append(key, value);
    }

    const response = await fetch(getBackendUrl("/knowledge/with-file"), {
      method: "POST",
      body: upstream,
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to create knowledge",
        },
        { status: response.status }
      );
    }

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
