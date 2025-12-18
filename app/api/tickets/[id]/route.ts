import { NextResponse } from "next/server"
import { mockTickets } from "@/lib/mock-data"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/tickets/[id] - Fetch single ticket
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const ticket = mockTickets.find((t) => t.id === id)

  if (!ticket) {
    return NextResponse.json(
      {
        success: false,
        message: "Ticket not found",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    data: ticket,
  })
}

// PATCH /api/tickets/[id] - Update ticket
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // In production, this would interact with your NestJS backend
    const ticket = mockTickets.find((t) => t.id === id)

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket not found",
        },
        { status: 404 },
      )
    }

    const updatedTicket = {
      ...ticket,
      ...body,
    }

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: "Ticket updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update ticket",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // In production, this would interact with your NestJS backend
    const ticket = mockTickets.find((t) => t.id === id)

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete ticket",
      },
      { status: 500 },
    )
  }
}
