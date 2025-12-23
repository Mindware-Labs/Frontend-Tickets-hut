import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";
import * as fs from "fs";
import * as path from "path";

const LOG_FILE = path.join(process.cwd(), "debug_api.log");

function log(msg: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

// GET /api/tickets - Fetch all tickets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    log(`GET /api/tickets page=${page} limit=${limit}`);

    const data = await fetchFromBackend(`/tickets?page=${page}&limit=${limit}`);

    log(`Backend responded: ${JSON.stringify(data).substring(0, 100)}...`);

    return NextResponse.json({
      success: true,
      data: data?.data || data || [],
      count: data?.total || (Array.isArray(data) ? data.length : 0),
    });
  } catch (error: any) {
    log(`ERROR in GET /api/tickets: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch tickets",
      },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await fetchFromBackend("/tickets", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      data,
      message: "Ticket created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create ticket",
      },
      { status: 500 }
    );
  }
}
