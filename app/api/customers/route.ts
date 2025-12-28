import { NextResponse } from "next/server"
import { fetchFromBackend } from "@/lib/api-client"

// GET /api/customers - Fetch all customers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "50"

    const data = await fetchFromBackend(`/customers?page=${page}&limit=${limit}`)

    return NextResponse.json({
      success: true,
      data: data.data || data,
      count: data.total || (Array.isArray(data) ? data.length : 0),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch customers",
      },
      { status: 500 },
    )
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await fetchFromBackend("/customers", {
      method: "POST",
      body: JSON.stringify(body),
    })

    return NextResponse.json({
      success: true,
      data,
      message: "Customer created successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create customer",
      },
      { status: 500 },
    )
  }
}
