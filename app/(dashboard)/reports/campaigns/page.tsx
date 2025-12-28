"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { fetchFromBackend } from "@/lib/api-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Campaign = {
  id: number;
  nombre: string;
  yarda?: { name?: string | null } | null;
  isActive?: boolean;
};

type Ticket = {
  id: number;
  customerId?: number | null;
  customer?: { name?: string | null; phone?: string | null } | null;
  customerPhone?: string | null;
  campaignId?: number | null;
  campaign?: { id?: number | null } | null;
  onboardingOption?: string | null;
  issueDetail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CustomerRow = {
  name: string;
  phone: string;
  status: string;
  specialCase: string;
};

type ReportData = {
  campaign: Campaign | null;
  summary: {
    totalCustomers: number;
    accepted: number;
    pending: number;
    llPay: number;
    notParked: number;
    pendingUnresponsive: number;
  };
  reportLines: string[];
  tables: {
    paid: CustomerRow[];
    registered: CustomerRow[];
    pending: CustomerRow[];
    noAnswer: CustomerRow[];
  };
};

const ONBOARDING = {
  REGISTERED: "REGISTERED",
  NOT_REGISTERED: "NOT_REGISTERED",
  PAID_WITH_LL: "PAID_WITH_LL",
};

const categorizeIssueDetail = (detail: string) => {
  const text = detail.toLowerCase();
  const tags: string[] = [];
  if (/(not parked|no longer parked|not parking|not at the location)/i.test(text)) {
    tags.push("not_parked");
  }
  if (/(out of service|blocked|disconnected|wrong number|no number)/i.test(text)) {
    tags.push("unreachable");
  }
  if (/(no further contact|do not contact|police)/i.test(text)) {
    tags.push("no_contact");
  }
  if (/(rate discrepancy|pricing|price|rate)/i.test(text)) {
    tags.push("rate_discrepancy");
  }
  if (/(declined|refused)/i.test(text)) {
    tags.push("declined");
  }
  if (/(handling internally|handled internally|company handling)/i.test(text)) {
    tags.push("handled_internally");
  }
  if (/(paid by check|check)/i.test(text)) {
    tags.push("paid_by_check");
  }
  if (/(unresponsive|no response|no reply)/i.test(text)) {
    tags.push("unresponsive");
  }
  return tags;
};

const getCustomerLabel = (ticket: Ticket) => {
  if (ticket.customer?.name) return ticket.customer.name;
  if (ticket.customerPhone) return ticket.customerPhone;
  if (ticket.customer?.phone) return ticket.customer.phone;
  if (ticket.customerId) return `Customer #${ticket.customerId}`;
  return "Unknown";
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const inRange = (date: Date | null, start: Date | null, end: Date | null) => {
  if (!date) return false;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};

const CustomerTable = ({ title, rows }: { title: string; rows: CustomerRow[] }) => {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{rows.length} customers</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border/60">
        <div className="grid grid-cols-12 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div className="col-span-4 px-4 py-2">Customer</div>
          <div className="col-span-3 px-4 py-2">Phone</div>
          <div className="col-span-2 px-4 py-2">Status</div>
          <div className="col-span-3 px-4 py-2">Special Case</div>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">
            No customer data available.
          </div>
        ) : (
          rows.map((row, index) => (
            <div key={`${title}-${index}`} className="grid grid-cols-12 border-t text-sm">
              <div className="col-span-4 px-4 py-2 font-medium">{row.name}</div>
              <div className="col-span-3 px-4 py-2 text-muted-foreground">
                {row.phone || "—"}
              </div>
              <div className="col-span-2 px-4 py-2 text-muted-foreground">
                {row.status}
              </div>
              <div className="col-span-3 px-4 py-2 text-xs text-muted-foreground">
                {row.specialCase || "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function CampaignReportsPage() {
  const searchParams = useSearchParams();
  const campaignIdParam = searchParams.get("campaignId");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await fetchFromBackend("/campaign?page=1&limit=500");
        const items = Array.isArray(data) ? data : data?.data || [];
        setCampaigns(items);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast({
          title: "Error",
          description: "Failed to load campaigns",
          variant: "destructive",
        });
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaignIdParam) {
      setSelectedCampaignId(campaignIdParam);
    }
  }, [campaignIdParam]);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((campaign) => campaign.id.toString() === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  const buildReport = async () => {
    if (!selectedCampaignId) {
      toast({
        title: "Select a campaign",
        description: "Pick a campaign before generating the report.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetchFromBackend("/tickets?page=1&limit=5000");
      const items: Ticket[] = response?.data || response || [];

      const campaignId = Number(selectedCampaignId);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);

      const filtered = items.filter((ticket) => {
        const ticketCampaignId =
          ticket.campaignId ?? ticket.campaign?.id ?? null;
        if (ticketCampaignId !== campaignId) return false;
        if (!start && !end) return true;
        const createdAt = parseDate(ticket.createdAt);
        return inRange(createdAt, start, end);
      });

      const byCustomer = new Map<number, Ticket>();
      filtered.forEach((ticket) => {
        if (!ticket.customerId) return;
        const existing = byCustomer.get(ticket.customerId);
        if (!existing) {
          byCustomer.set(ticket.customerId, ticket);
          return;
        }
        const existingUpdated = parseDate(existing.updatedAt)?.getTime() || 0;
        const currentUpdated = parseDate(ticket.updatedAt)?.getTime() || 0;
        if (currentUpdated >= existingUpdated) {
          byCustomer.set(ticket.customerId, ticket);
        }
      });

      const customers = Array.from(byCustomer.values());
      const groups = {
        registered: [] as Ticket[],
        pending: [] as Ticket[],
        paidWithLandlord: [] as Ticket[],
        unknown: [] as Ticket[],
      };

      customers.forEach((ticket) => {
        switch (ticket.onboardingOption) {
          case ONBOARDING.REGISTERED:
            groups.registered.push(ticket);
            break;
          case ONBOARDING.NOT_REGISTERED:
            groups.pending.push(ticket);
            break;
          case ONBOARDING.PAID_WITH_LL:
            groups.paidWithLandlord.push(ticket);
            break;
          default:
            groups.unknown.push(ticket);
            break;
        }
      });

      const notes = customers
        .filter((ticket) => ticket.issueDetail?.trim())
        .map((ticket) => ({
          customerId: ticket.customerId,
          customerName: ticket.customer?.name ?? null,
          customerPhone: ticket.customerPhone ?? ticket.customer?.phone ?? null,
          note: ticket.issueDetail?.trim() ?? "",
        }));

      const specialCases = notes.map((note) => ({
        ...note,
        tags: note.note ? categorizeIssueDetail(note.note) : [],
      }));

      const specialCaseTags = new Map<number, string[]>();
      const specialCaseMap = new Map<string, string>();
      specialCases.forEach((item) => {
        if (item.customerId) {
          specialCaseTags.set(item.customerId, item.tags);
        }
        const name = item.customerName || "Unknown";
        const phone = item.customerPhone || "";
        const key = `${name}::${phone}`;
        if (item.note) {
          specialCaseMap.set(key, item.note);
        }
      });

      const pendingSet = new Set(groups.pending.map((ticket) => ticket.customerId));
      const notParkedPending = specialCases.filter(
        (item) =>
          item.customerId &&
          pendingSet.has(item.customerId) &&
          item.tags.includes("not_parked")
      ).length;
      const unreachablePending = specialCases.filter(
        (item) =>
          item.customerId &&
          pendingSet.has(item.customerId) &&
          item.tags.includes("unreachable")
      ).length;
      const pendingUnresponsive = Math.max(
        0,
        groups.pending.length - notParkedPending - unreachablePending
      );

      const notUnresponsiveTags = new Set([
        "not_parked",
        "unreachable",
        "no_contact",
        "declined",
        "handled_internally",
        "paid_by_check",
        "rate_discrepancy",
      ]);
      const unresponsiveCustomers = groups.pending.filter((ticket) => {
        const tags = specialCaseTags.get(ticket.customerId ?? -1) || [];
        if (tags.some((tag) => notUnresponsiveTags.has(tag))) {
          return false;
        }
        if (tags.includes("unresponsive")) {
          return true;
        }
        return tags.length === 0;
      });

      const buildRows = (items: Ticket[], status: string) =>
        items.map((ticket) => {
          const name = getCustomerLabel(ticket);
          const phone = ticket.customerPhone || ticket.customer?.phone || "";
          const key = `${name}::${phone}`;
          return {
            name,
            phone,
            status,
            specialCase: specialCaseMap.get(key) || "",
          };
        });

      const reportLines: string[] = [];
      reportLines.push("Parking Registration & Payment Status Report");
      if (selectedCampaign?.nombre) reportLines.push(selectedCampaign.nombre);
      reportLines.push(`Total Customers: ${customers.length}`);
      reportLines.push(`Accepted: ${groups.registered.length}`);
      reportLines.push(`Pending: ${groups.pending.length}`);
      reportLines.push(`LL Pay: ${groups.paidWithLandlord.length}`);
      if (notParkedPending > 0 || pendingUnresponsive > 0) {
        reportLines.push(
          `Not Parked: ${notParkedPending} | Pending/Unresponsive: ${pendingUnresponsive}`
        );
      }

      setReport({
        campaign: selectedCampaign,
        summary: {
          totalCustomers: customers.length,
          accepted: groups.registered.length,
          pending: groups.pending.length,
          llPay: groups.paidWithLandlord.length,
          notParked: notParkedPending,
          pendingUnresponsive,
        },
        reportLines,
        tables: {
          paid: buildRows(groups.paidWithLandlord, "Paid with LL"),
          registered: buildRows(groups.registered, "Registered"),
          pending: buildRows(groups.pending, "Not Registered"),
          noAnswer: buildRows(unresponsiveCustomers, "No Answer"),
        },
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report.",
        variant: "destructive",
      });
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = () => {
    if (!report) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Campaign Report", 14, 18);
    doc.setFontSize(10);
    if (report.campaign?.nombre) {
      doc.text(`Campaign: ${report.campaign.nombre}`, 14, 26);
    }
    if (report.campaign?.yarda?.name) {
      doc.text(`Yard: ${report.campaign.yarda.name}`, 14, 32);
    }
    if (startDate || endDate) {
      doc.text(
        `Range: ${startDate || "Start"} - ${endDate || "End"}`,
        14,
        38
      );
    }

    let currentY = 44;

    autoTable(doc, {
      startY: currentY,
      head: [["Metric", "Value"]],
      body: [
        ["Total Customers", report.summary.totalCustomers],
        ["Accepted", report.summary.accepted],
        ["Pending", report.summary.pending],
        ["LL Pay", report.summary.llPay],
        ["Not Parked", report.summary.notParked],
        ["Pending/Unresponsive", report.summary.pendingUnresponsive],
      ],
      didDrawPage: (data) => {
        if (data.cursor) {
          currentY = data.cursor.y + 8;
        }
      },
    });

    const drawTable = (title: string, rows: CustomerRow[]) => {
      doc.text(title, 14, currentY);
      currentY += 6;
      autoTable(doc, {
        startY: currentY,
        head: [["Customer", "Phone", "Status", "Special Case"]],
        body:
          rows.length > 0
            ? rows.map((row) => [
                row.name,
                row.phone || "—",
                row.status,
                row.specialCase || "—",
              ])
            : [["No customer data available.", "", "", ""]],
        didDrawPage: (data) => {
          if (data.cursor) {
            currentY = data.cursor.y + 8;
          }
        },
      });
    };

    drawTable("Paid with LL", report.tables.paid);
    drawTable("Registered", report.tables.registered);
    drawTable("Not Registered", report.tables.pending);
    drawTable("No Answer", report.tables.noAnswer);

    doc.save(`campaign_report_${report.campaign?.id || "campaign"}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Campaign Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate onboarding campaign summaries and customer lists.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={buildReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </Button>
          <Button variant="outline" onClick={exportPdf} disabled={!report}>
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Campaign
          </p>
          <Select
            value={selectedCampaignId}
            onValueChange={setSelectedCampaignId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                  {campaign.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Start Date
          </p>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            End Date
          </p>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>

      {!report ? (
        <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          Select a campaign and generate a report to see results.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-semibold">{report.summary.totalCustomers}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Accepted</p>
              <p className="text-2xl font-semibold">{report.summary.accepted}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold">{report.summary.pending}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">LL Pay</p>
              <p className="text-2xl font-semibold">{report.summary.llPay}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Not Parked</p>
              <p className="text-2xl font-semibold">{report.summary.notParked}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Pending / Unresponsive</p>
              <p className="text-2xl font-semibold">{report.summary.pendingUnresponsive}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">Report Notes</p>
            <div className="mt-2 space-y-1 text-sm">
              {report.reportLines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <CustomerTable title="Paid with LL" rows={report.tables.paid} />
            <CustomerTable title="Registered" rows={report.tables.registered} />
            <CustomerTable title="Not Registered" rows={report.tables.pending} />
            <CustomerTable title="No Answer" rows={report.tables.noAnswer} />
          </div>
        </div>
      )}
    </div>
  );
}
