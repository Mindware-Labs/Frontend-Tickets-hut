import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const yard = await fetchFromBackend(`/yards/${params.id}`);
    return NextResponse.json(yard);
  } catch (error) {
    console.error("Error fetching yard:", error);
    return NextResponse.json(
      { error: "Failed to fetch yard" },
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
    const yard = await fetchFromBackend(`/yards/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(yard);
  } catch (error) {
    console.error("Error updating yard:", error);
    return NextResponse.json(
      { error: "Failed to update yard" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await fetchFromBackend(`/yards/${params.id}`, {
      method: "DELETE",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting yard:", error);
    return NextResponse.json(
      { error: "Failed to delete yard" },
      { status: 500 }
    );
  }
}
