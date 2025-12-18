import { NextResponse } from "next/server"
import { mockTickets } from "@/lib/mock-data"

// GET /api/tickets - Fetch all tickets
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaign = searchParams.get("campaign")
  const status = searchParams.get("status")
  const type = searchParams.get("type")

  let filteredTickets = [...mockTickets]

  if (campaign) {
    filteredTickets = filteredTickets.filter((t) => t.campaign === campaign)
  }
  if (status) {
    filteredTickets = filteredTickets.filter((t) => t.status === status)
  }
  if (type) {
    filteredTickets = filteredTickets.filter((t) => t.type === type)
  }

  return NextResponse.json({
    success: true,
    data: filteredTickets,
    count: filteredTickets.length,
  })
}

// POST /api/tickets - Create a new ticket
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In production, this would interact with your NestJS backend
    const newTicket = {
      id: `TKT-${String(mockTickets.length + 1).padStart(3, "0")}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: "Open" as const,
    }

    return NextResponse.json({
      success: true,
      data: newTicket,
      message: "Ticket created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create ticket",
      },
      { status: 500 },
    )
  }
}
