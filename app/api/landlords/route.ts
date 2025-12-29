import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackendServer } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  try {
    const landlords = await fetchFromBackendServer(
      request,
      "/landlords?page=1&limit=500"
    );
    return NextResponse.json(landlords);
  } catch (error) {
    console.error("Error fetching landlords:", error);
    return NextResponse.json(
      { error: "Failed to fetch landlords" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const landlord = await fetchFromBackendServer(request, "/landlords", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(landlord);
  } catch (error) {
    console.error("Error creating landlord:", error);
    return NextResponse.json(
      { error: "Failed to create landlord" },
      { status: 500 }
    );
  }
}
