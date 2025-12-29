import { NextRequest, NextResponse } from "next/server"
import { fetchFromBackendServer } from "@/lib/api-server"

// GET /api/campaigns - Fetch all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()
    const data = await fetchFromBackendServer(
      request,
      query ? `/campaign?${query}` : "/campaign"
    )

    return NextResponse.json({
      success: true,
      data: data?.data || data || [],
      count: data?.total || (Array.isArray(data) ? data.length : 0),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch campaigns",
      },
      { status: 500 },
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await fetchFromBackendServer(request, "/campaign", {
      method: "POST",
      body: JSON.stringify(body),
    })

    return NextResponse.json({
      success: true,
      data,
      message: "Campaign created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create campaign",
      },
      { status: 500 },
    )
  }
}
