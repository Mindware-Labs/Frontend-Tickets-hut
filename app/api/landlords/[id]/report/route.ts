import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const yardId = searchParams.get("yardId");

    const query = new URLSearchParams();
    if (startDate) query.set("startDate", startDate);
    if (endDate) query.set("endDate", endDate);
    if (yardId) query.set("yardId", yardId);

    const report = await fetchFromBackend(
      `/landlords/${id}/report?${query.toString()}`
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching landlord report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const response = await fetchFromBackend(`/landlords/${id}/report/send`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error sending landlord report:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}
