import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackendServer } from "@/lib/api-server";

// GET /api/tickets - Fetch all tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Ignoramos paginación para traer todos los tickets
    const pageSize = 200;
    const maxPages = 50; // seguridad ante loops infinitos
    let page = 1;
    const allTickets: any[] = [];
    let total = 0;

    // ✅ CORRECCIÓN: Usamos console.log (permitido en Vercel) en vez de guardar en archivo
    console.log(`[NextAPI] GET /api/tickets (todos)`);

    while (page <= maxPages) {
      const data = await fetchFromBackendServer(
        request,
        `/tickets?page=${page}&limit=${pageSize}`
      );

      const pageTickets = data?.data || data || [];
      if (page === 1 && typeof data?.total === "number") {
        total = data.total;
      }

      allTickets.push(...pageTickets);

      if (pageTickets.length < pageSize) break;
      if (total && allTickets.length >= total) break;
      page += 1;
    }

    const count = total || allTickets.length;
    console.log(`[NextAPI] Backend success. Tickets found: ${count}`);

    return NextResponse.json({
      success: true,
      data: allTickets,
      count,
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`[NextAPI] POST /api/tickets - Creating ticket...`);

    const data = await fetchFromBackendServer(request, "/tickets", {
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
