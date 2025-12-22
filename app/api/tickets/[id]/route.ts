import { NextResponse } from "next/server"
import { fetchFromBackend } from "@/lib/api-client"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/tickets/[id] - Fetch single ticket
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const data = await fetchFromBackend(`/ticket/${id}`)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch ticket",
      },
      { status: 500 },
    )
  }
}

// PATCH /api/tickets/[id] - Update ticket
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const data = await fetchFromBackend(`/ticket/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })

    return NextResponse.json({
      success: true,
      data,
      message: "Ticket updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update ticket",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    await fetchFromBackend(`/ticket/${id}`, {
      method: "DELETE",
    })

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete ticket",
      },
      { status: 500 },
    )
  }
}
