import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const landlord = await fetchFromBackend(`/landlords/${params.id}`);
    return NextResponse.json(landlord);
  } catch (error) {
    console.error("Error fetching landlord:", error);
    return NextResponse.json(
      { error: "Failed to fetch landlord" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const landlord = await fetchFromBackend(`/landlords/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(landlord);
  } catch (error) {
    console.error("Error updating landlord:", error);
    return NextResponse.json(
      { error: "Failed to update landlord" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await fetchFromBackend(`/landlords/${params.id}`, {
      method: "DELETE",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landlord:", error);
    return NextResponse.json(
      { error: "Failed to delete landlord" },
      { status: 500 }
    );
  }
}
