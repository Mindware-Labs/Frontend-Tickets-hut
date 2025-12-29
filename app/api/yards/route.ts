import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackendServer } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  try {
    const yards = await fetchFromBackendServer(request, "/yards");
    return NextResponse.json(yards);
  } catch (error) {
    console.error("Error fetching yards:", error);
    return NextResponse.json(
      { error: "Failed to fetch yards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const yard = await fetchFromBackendServer(request, "/yards", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(yard);
  } catch (error) {
    console.error("Error creating yard:", error);
    return NextResponse.json(
      { error: "Failed to create yard" },
      { status: 500 }
    );
  }
}
