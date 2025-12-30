import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackendServer } from "@/lib/api-server";

type Ticket = {
  id: number;
  status?: string;
  campaign?: string | null;
  campaignId?: number | null;
  disposition?: string | null;
  createdAt?: string;
  priority?: string | null;
  customer?: { name?: string | null };
  assignedTo?: number | null;
  assignedToUser?: { id?: number; name?: string } | null;
};

type Campaign = {
  id: number;
  nombre: string;
  tipo?: string | null;
  isActive?: boolean;
};

const STATUS_ACTIVE = new Set(["OPEN", "IN_PROGRESS"]);
const STATUS_CLOSED = new Set(["CLOSED", "RESOLVED"]);
const PRIORITY_ALERT = new Set(["HIGH", "EMERGENCY"]);

const CAMPAIGN_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  AR: "AR",
  OTHER: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const FALLBACK_CHART_ITEM = [{ name: "No data", count: 0 }];

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeLabel(value: unknown, labels: Record<string, string>) {
  if (value === null || value === undefined) return "Unspecified";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "Unspecified";
    return labels[trimmed] || toTitleCase(trimmed);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    const key = String(value);
    return labels[key] || key;
  }

  return "Unspecified";
}

function getCampaignLabel(
  ticket: Ticket,
  campaignsById: Record<number, string>
) {
  if (ticket.campaign && typeof ticket.campaign === "object") {
    const maybeCampaign = ticket.campaign as { nombre?: string };
    if (maybeCampaign.nombre) return maybeCampaign.nombre;
  }

  if (ticket.campaignId && campaignsById[ticket.campaignId]) {
    return campaignsById[ticket.campaignId];
  }

  return normalizeLabel(ticket.campaign || "Unspecified", CAMPAIGN_LABELS);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getUserIdFromRequest(
  request: NextRequest
): Promise<number | null> {
  // First, try to extract from token directly (faster)
  const cookieToken =
    request.cookies.get("auth-token")?.value ||
    request.cookies.get("auth_token")?.value;
  const headerToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const authToken = cookieToken || headerToken || null;

  if (authToken) {
    try {
      const payloadPart = authToken.split(".")[1];
      if (payloadPart) {
        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const payloadString = atob(base64);
        const payload = JSON.parse(payloadString);
        console.log("[agent-stats] Token payload keys:", Object.keys(payload));
        const userId = payload?.id || payload?.userId || payload?.sub;
        if (userId) {
          console.log("[agent-stats] Found user ID in token:", userId);
          return Number(userId);
        }
      }
    } catch (tokenError) {
      console.error("[agent-stats] Error parsing token:", tokenError);
    }
  } else {
    console.log("[agent-stats] No auth token found in cookies or headers");
  }

  // Fallback: try to get user profile from backend
  try {
    const profileResponse = await fetchFromBackendServer(
      request,
      "/auth/profile"
    );
    
    console.log("[agent-stats] Profile response:", {
      hasId: !!profileResponse?.id,
      hasUserId: !!profileResponse?.userId,
      keys: profileResponse ? Object.keys(profileResponse) : [],
    });
    
    // The profile should contain the user ID
    if (profileResponse?.id) {
      return Number(profileResponse.id);
    }
    if (profileResponse?.userId) {
      return Number(profileResponse.userId);
    }
  } catch (error: any) {
    console.error("[agent-stats] Error getting profile from backend:", error);
    // If it's a 401, the user is not authenticated
    if (error?.status === 401 || error?.body?.statusCode === 401) {
      console.log("[agent-stats] User not authenticated (401)");
    }
  }

  return null;
}

async function fetchTicketsWithLimit(
  request: NextRequest,
  limit: number,
  maxPages: number,
  agentId: number | null
) {
  const tickets: Ticket[] = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchFromBackendServer(
      request,
      `/tickets?page=${page}&limit=${limit}`
    );
    const pageTickets: Ticket[] = response?.data || response || [];
    if (page === 1 && typeof response?.total === "number") {
      total = response.total;
    }

    // Filter tickets by agent if agentId is provided
    let filteredTickets = pageTickets;
    if (agentId !== null) {
      filteredTickets = pageTickets.filter((ticket) => {
        const assignedToId = ticket.assignedTo || ticket.assignedToUser?.id;
        return assignedToId === agentId;
      });
    }

    tickets.push(...filteredTickets);

    if (pageTickets.length < limit) break;
    if (total && tickets.length >= total) break;
  }

  return { tickets, total: total || tickets.length };
}

async function fetchCampaigns(request: NextRequest, limit: number) {
  const response = await fetchFromBackendServer(
    request,
    `/campaign?page=1&limit=${limit}`
  );
  const campaigns: Campaign[] = response?.data || response || [];
  return campaigns;
}

// GET /api/dashboard/agent-stats - Fetch agent-specific dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const agentId = await getUserIdFromRequest(request);

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to identify agent. Please ensure you are logged in.",
        },
        { status: 401 }
      );
    }

    const { tickets, total } = await fetchTicketsWithLimit(
      request,
      200,
      5,
      agentId
    );
    let campaigns: Campaign[] = [];
    try {
      campaigns = await fetchCampaigns(request, 200);
    } catch {
      campaigns = [];
    }
    const totalTickets = total;
    const totalCalls = totalTickets;

    const openTickets = tickets.filter(
      (ticket) => ticket.status === "OPEN"
    ).length;
    const inProgressTickets = tickets.filter(
      (ticket) => ticket.status === "IN_PROGRESS"
    ).length;
    const activeTickets = openTickets + inProgressTickets;
    const closedTickets = tickets.filter((ticket) =>
      STATUS_CLOSED.has(ticket.status || "")
    ).length;
    const pendingActions = tickets.filter(
      (ticket) =>
        PRIORITY_ALERT.has(ticket.priority || "") &&
        !STATUS_CLOSED.has(ticket.status || "")
    ).length;

    const resolutionRate =
      totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;

    const campaignCounts = tickets.reduce<Record<string, number>>(
      (acc, ticket) => {
        const label = normalizeLabel(
          ticket.campaign || "Unspecified",
          CAMPAIGN_LABELS
        );
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      },
      {}
    );

    const dispositionCounts = tickets.reduce<Record<string, number>>(
      (acc, ticket) => {
        const label = normalizeLabel(ticket.disposition || "Unspecified", {});
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      },
      {}
    );

    const now = new Date();
    const dayBuckets = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      return {
        key: formatDateKey(date),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      };
    });

    const bucketMap = dayBuckets.reduce<Record<string, number>>(
      (acc, bucket, index) => {
        acc[bucket.key] = index;
        return acc;
      },
      {}
    );

    tickets.forEach((ticket) => {
      if (!ticket.createdAt) return;
      const date = new Date(ticket.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = formatDateKey(date);
      const bucketIndex = bucketMap[key];
      if (bucketIndex === undefined) return;
      dayBuckets[bucketIndex].count += 1;
    });

    const callsByDay = dayBuckets.map((bucket) => ({
      day: bucket.label,
      calls: bucket.count,
    }));

    const campaignsByName = campaigns.map((campaign) => ({
      name: campaign.nombre,
      count: 1,
    }));

    const ticketsByCampaign = campaignsByName.length
      ? campaignsByName
      : Object.entries(campaignCounts).map(([name, count]) => ({
          name,
          count,
        }));

    const ticketsByDisposition = Object.entries(dispositionCounts).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    const campaignsById = campaigns.reduce<Record<number, string>>(
      (acc, campaign) => {
        acc[campaign.id] = campaign.nombre;
        return acc;
      },
      {}
    );

    const recentTickets = tickets.slice(0, 5).map((ticket) => ({
      id: ticket.id,
      clientName: ticket.customer?.name || "Unassigned",
      campaign: getCampaignLabel(ticket, campaignsById),
      status: normalizeLabel(ticket.status || "Unspecified", STATUS_LABELS),
      createdAt: ticket.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        kpis: {
          totalCalls,
          totalTickets,
          activeTickets,
          openTickets,
          inProgressTickets,
          closedTickets,
          pendingActions,
          resolutionRate,
          callsLast7Days: callsByDay.reduce((sum, item) => sum + item.calls, 0),
        },
        charts: {
          callsByDay,
          ticketsByCampaign: ticketsByCampaign.length
            ? ticketsByCampaign
            : FALLBACK_CHART_ITEM,
          ticketsByDisposition: ticketsByDisposition.length
            ? ticketsByDisposition
            : FALLBACK_CHART_ITEM,
        },
        recentTickets,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch agent dashboard stats",
      },
      { status: 500 }
    );
  }
}

