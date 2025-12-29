import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";

// GET /api/tickets - Fetch all tickets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    // ✅ CORRECCIÓN: Usamos console.log (permitido en Vercel) en vez de guardar en archivo
    console.log(`[NextAPI] GET /api/tickets page=${page} limit=${limit}`);

    // Llamamos al backend usando la configuración que ya arreglamos en api-client
    const data = await fetchFromBackend(`/tickets?page=${page}&limit=${limit}`);

    // Solo logueamos el conteo para no saturar la consola
    const count = data?.total || (Array.isArray(data) ? data.length : 0);
    console.log(`[NextAPI] Backend success. Tickets found: ${count}`);

    return NextResponse.json({
      success: true,
      data: data?.data || data || [],
      count: count,
    });

  } catch (error: any) {
    // ✅ Log del error real en la consola de Vercel
    console.error(`[NextAPI] ERROR in GET /api/tickets:`, error);
    
    // Si el error tiene respuesta del backend, intentamos mostrarla
    if (error.status) {
       console.error(`[NextAPI] Status Code: ${error.status}`);
    }

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
    
    console.log(`[NextAPI] POST /api/tickets - Creating ticket...`);

    const data = await fetchFromBackend("/tickets", {
      method: "POST",
      body: JSON.stringify(body),
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