import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackendServer } from "@/lib/api-server";

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

    const queryString = query.toString();
    const report = await fetchFromBackendServer(
      request,
      queryString
        ? `/landlords/${id}/report?${queryString}`
        : `/landlords/${id}/report`
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching landlord report:", error);
    const status = (error as any)?.status || 500;
    const message =
      (error as any)?.body?.message ||
      (error as any)?.message ||
      "Failed to fetch report";
    return NextResponse.json(
      { error: message },
      { status }
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
    const response = await fetchFromBackendServer(
      request,
      `/landlords/${id}/report/send`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error sending landlord report:", error);
    const status = (error as any)?.status || 500;
    const message =
      (error as any)?.body?.message ||
      (error as any)?.message ||
      "Failed to send report";
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
