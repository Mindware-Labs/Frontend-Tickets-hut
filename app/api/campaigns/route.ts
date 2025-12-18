import { NextResponse } from "next/server"
import { mockCampaigns } from "@/lib/mock-data"

// GET /api/campaigns - Fetch all campaigns
export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockCampaigns,
    count: mockCampaigns.length,
  })
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In production, this would interact with your NestJS backend
    const newCampaign = {
      id: `CMP-${String(mockCampaigns.length + 1).padStart(3, "0")}`,
      ...body,
      ticketCount: 0,
      startDate: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newCampaign,
      message: "Campaign created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create campaign",
      },
      { status: 500 },
    )
  }
}
