import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";
import { cookies } from "next/headers";

// GET /api/tickets - Fetch all tickets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    // 👇 CAMBIO: Agregamos 'await' porque en Next.js 15 cookies() es asíncrono
    const cookieStore = await cookies(); 
    const token = cookieStore.get("auth-token")?.value;

    console.log(`[NextAPI] GET /api/tickets page=${page} limit=${limit} - Token exists: ${!!token}`);

    const data = await fetchFromBackend(`/tickets?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const count = data?.total || (Array.isArray(data) ? data.length : 0);
    console.log(`[NextAPI] Backend success. Tickets found: ${count}`);

    return NextResponse.json({
      success: true,
      data: data?.data || data || [],
      count: count,
    });

  } catch (error: any) {
    console.error(`[NextAPI] ERROR in GET /api/tickets:`, error);
    const status = error.status || 500;
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch tickets",
      },
      { status: status }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 👇 CAMBIO: Agregamos 'await' aquí también
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    console.log(`[NextAPI] POST /api/tickets - Creating ticket...`);

    const data = await fetchFromBackend("/tickets", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    console.log(`[NextAPI] Ticket created successfully`);

    return NextResponse.json({
      success: true,
      data,
      message: "Ticket created successfully",
    });
  } catch (error: any) {
    console.error(`[NextAPI] ERROR in POST /api/tickets:`, error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create ticket",
      },
      { status: 500 }
    );
  }
}