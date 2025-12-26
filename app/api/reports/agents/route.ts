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
    const query = searchParams.toString();
    const response = await fetch(
      getBackendUrl(`/reports/agents${query ? `?${query}` : ""}`)
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to fetch agent report",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch agent report",
      },
      { status: 500 }
    );
  }
}
