import { NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/mock-data"

// GET /api/dashboard/stats - Fetch dashboard statistics
export async function GET() {
  try {
    const stats = getDashboardStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard stats",
      },
      { status: 500 },
    )
  }
}
