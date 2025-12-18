import { NextResponse } from "next/server"
import { mockUsers } from "@/lib/mock-data"

// GET /api/users - Fetch all users
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")
  const status = searchParams.get("status")

  let filteredUsers = [...mockUsers]

  if (role) {
    filteredUsers = filteredUsers.filter((u) => u.role === role)
  }
  if (status) {
    filteredUsers = filteredUsers.filter((u) => u.status === status)
  }

  return NextResponse.json({
    success: true,
    data: filteredUsers,
    count: filteredUsers.length,
  })
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In production, this would interact with your NestJS backend
    const newUser = {
      id: `USR-${String(mockUsers.length + 1).padStart(3, "0")}`,
      ...body,
      ticketsAssigned: 0,
      status: "Active" as const,
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 },
    )
  }
}
