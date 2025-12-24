import { NextRequest, NextResponse } from "next/server"
import { fetchFromBackend } from "@/lib/api-client"

// GET /api/campaigns/[id] - Fetch single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await fetchFromBackend(`/campaign/${params.id}`)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch campaign",
      },
      { status: 500 },
    )
  }
}

// PATCH /api/campaigns/[id] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const data = await fetchFromBackend(`/campaign/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update campaign",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await fetchFromBackend(`/campaign/${params.id}`, {
      method: "DELETE",
    })

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete campaign",
      },
      { status: 500 },
    )
  }
}
