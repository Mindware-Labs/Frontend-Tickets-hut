"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { fetchFromBackend } from "@/lib/api-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CallDirection } from "@/app/(dashboard)/tickets/types";

type Campaign = {
  id: number;
  nombre: string;
  yarda?: { name?: string | null } | null;
  isActive?: boolean;
  tipo?: string;
};

type Ticket = {
  id: number;
  customerId?: number | null;
  customer?: { name?: string | null; phone?: string | null } | null;
  customerPhone?: string | null;
  campaignId?: number | null;
  campaign?: { id?: number | null } | null;
  campaingOption?: string | null;
  campaignOption?: string | null;
  onboardingOption?: string | null;
  issueDetail?: string | null;
  direction?: CallDirection | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type CustomerRow = {
  name: string;
  phone: string;
  status: string;
  specialCase: string;
};

type ReportMetric = {
  title: string;
  value: number;
};

type ReportTable = {
  title: string;
  rows: CustomerRow[];
};

type ReportData = {
  campaign: Campaign | null;
  metrics: ReportMetric[];
  totalCustomers: number;
  reportLines: string[];
  tables: ReportTable[];
};

const ONBOARDING = {
  REGISTERED: "REGISTERED",
  NOT_REGISTERED: "NOT_REGISTERED",
  PAID_WITH_LL: "PAID_WITH_LL",
};

const AR_LABELS: Record<string, string> = {
  PAID: "Paid",
  NOT_PAID: "Not Paid",
  OFFLINE_PAYMENT: "Offline Payment",
  NOT_PAID_CHECK: "Not Paid Check",
  MOVED_OUT: "Moved Out",
  CANCELED: "Canceled",
  BALANCE_0: "Balance 0",
  DO_NOT_CALL: "Do Not Call",
};

const categorizeIssueDetail = (detail: string) => {
  const text = detail.toLowerCase();
  const tags: string[] = [];
  if (
    /(not parked|no longer parked|not parking|not at the location)/i.test(text)
  ) {
    tags.push("not_parked");
  }
  if (
    /(out of service|blocked|disconnected|wrong number|no number)/i.test(text)
  ) {
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

const CustomerTable = ({
  title,
  rows,
}: {
  title: string;
  rows: CustomerRow[];
}) => {
  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {rows.length} customers
        </span>
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
            <div
              key={`${title}-${index}`}
              className="grid grid-cols-12 border-t text-sm"
            >
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
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

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

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/images/LOGO CQ-01.png");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string") {
            setLogoDataUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading logo", error);
      }
    };
    loadLogo();
  }, []);

  const selectedCampaign = useMemo(() => {
    return (
      campaigns.find(
        (campaign) => campaign.id.toString() === selectedCampaignId
      ) || null
    );
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

      const missedCalls = filtered.filter(
        (ticket) =>
          (ticket.direction || "").toUpperCase() === CallDirection.MISSED
      );

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
      const isArCampaign =
        (selectedCampaign?.tipo || "").toUpperCase() === "AR";

      let metrics: ReportMetric[] = [];
      let tables: ReportTable[] = [];
      const reportLines: string[] = [];

      if (isArCampaign) {
        const arGroups = new Map<string, Ticket[]>();
        customers.forEach((ticket) => {
          const option =
            ticket.campaignOption ??
            ticket.campaingOption ??
            ticket.onboardingOption ??
            "";
          const key = AR_LABELS[option as keyof typeof AR_LABELS]
            ? option
            : "UNSPECIFIED";
          const arr = arGroups.get(key) || [];
          arr.push(ticket);
          arGroups.set(key, arr);
        });

        // ensure all AR categories exist
        Object.keys(AR_LABELS).forEach((key) => {
          if (!arGroups.has(key)) {
            arGroups.set(key, []);
          }
        });

        metrics = [
          { title: "Total Customers", value: customers.length },
          ...Object.keys(AR_LABELS).map((key) => ({
            title: AR_LABELS[key],
            value: arGroups.get(key)?.length || 0,
          })),
          { title: "Missed Calls", value: missedCalls.length },
        ];

        const buildRows = (items: Ticket[], status: string) =>
          items.map((ticket) => {
            const name = getCustomerLabel(ticket);
            const phone = ticket.customerPhone || ticket.customer?.phone || "";
            return {
              name,
              phone,
              status,
              specialCase: ticket.issueDetail?.trim() || "",
            };
          });

        tables = [
          ...Object.keys(AR_LABELS).map((key) => ({
            title: AR_LABELS[key],
            rows: buildRows(arGroups.get(key) || [], AR_LABELS[key]),
          })),
          {
            title: "Missed Calls",
            rows: buildRows(missedCalls, "Missed Call"),
          },
        ];

        reportLines.push("AR Campaign Status Report");
        if (selectedCampaign?.nombre) reportLines.push(selectedCampaign.nombre);
        reportLines.push(`Total Customers: ${customers.length}`);
      } else {
        const groups = {
          registered: [] as Ticket[],
          pending: [] as Ticket[],
          paidWithLandlord: [] as Ticket[],
          unknown: [] as Ticket[],
        };

        customers.forEach((ticket) => {
          const option =
            ticket.campaingOption ?? ticket.onboardingOption ?? null;
          switch (option) {
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
            customerPhone:
              ticket.customerPhone ?? ticket.customer?.phone ?? null,
            note: ticket.issueDetail?.trim() ?? "",
          }));

        const specialCases = notes.map((note) => ({
          ...note,
          tags: note.note ? categorizeIssueDetail(note.note) : [],
        }));

        const specialCaseMap = new Map<string, string>();
        specialCases.forEach((item) => {
          const name = item.customerName || "Unknown";
          const phone = item.customerPhone || "";
          const key = `${name}::${phone}`;
          if (item.note) {
            specialCaseMap.set(key, item.note);
          }
        });

        const pendingSet = new Set(
          groups.pending.map((ticket) => ticket.customerId)
        );
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

        const buildRows = (items: Ticket[], status: string) =>
          items.map((ticket) => {
            const name = getCustomerLabel(ticket);
            const phone = ticket.customerPhone || ticket.customer?.phone || "";
            const key = `${name}::${phone}`;
            return {
              name,
              phone,
              status,
              specialCase:
                ticket.issueDetail?.trim() || specialCaseMap.get(key) || "",
            };
          });

        metrics = [
          { title: "Total Customers", value: customers.length },
          { title: "Accepted", value: groups.registered.length },
          { title: "LL Pay", value: groups.paidWithLandlord.length },
          { title: "Missed Calls", value: missedCalls.length },
        ];

        tables = [
          {
            title: "Paid with LL",
            rows: buildRows(groups.paidWithLandlord, "Paid with LL"),
          },
          {
            title: "Registered",
            rows: buildRows(groups.registered, "Registered"),
          },
          {
            title: "Not Registered",
            rows: buildRows(groups.pending, "Not Registered"),
          },
          {
            title: "Missed Calls",
            rows: buildRows(missedCalls, "Missed Call"),
          },
        ];

        reportLines.push("Parking Registration & Payment Status Report");
        if (selectedCampaign?.nombre) reportLines.push(selectedCampaign.nombre);
        reportLines.push(`Total Customers: ${customers.length}`);
        reportLines.push(`Accepted: ${groups.registered.length}`);
        reportLines.push(`LL Pay: ${groups.paidWithLandlord.length}`);
        if (missedCalls.length > 0) {
          reportLines.push(`Missed Calls: ${missedCalls.length}`);
        }
      }

      setReport({
        campaign: selectedCampaign,
        metrics,
        totalCustomers: customers.length,
        reportLines,
        tables,
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
    const primary = "#1e40af";
    const secondary = "#3b82f6";
    const gray = "#6b7280";
    const light = "#f3f4f6";
    const white = "#ffffff";

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(light);
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setTextColor(primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CAMPAIGN REPORT", 14, 18);

    const logoSize = 30;
    const logoX = pageWidth - 14 - logoSize;
    const logoY = 7;
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoSize, logoSize);
    } else {
      doc.setFillColor(primary);
      doc.setDrawColor(primary);
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("CQ", logoX + logoSize / 2, logoY + logoSize / 2 + 6, {
        align: "center",
        baseline: "middle",
      });
    }

    doc.setDrawColor(secondary);
    doc.setLineWidth(2);
    doc.line(14, 22, 60, 22);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CAMPAIGN:", 14, 30);
    doc.setFont("helvetica", "normal");
    doc.text(report.campaign?.nombre || "—", 38, 30);

    if (report.campaign?.yarda?.name) {
      doc.setFont("helvetica", "bold");
      doc.text("YARD:", 14, 36);
      doc.setFont("helvetica", "normal");
      doc.text(report.campaign.yarda.name, 32, 36);
    }

    if (startDate || endDate) {
      doc.setFont("helvetica", "bold");
      doc.text("RANGE:", 120, 30);
      doc.setFont("helvetica", "normal");
      doc.text(`${startDate || "Start"} - ${endDate || "End"}`, 145, 30);
    }

    const palette = [
      "#1e40af",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#0ea5e9",
      "#22c55e",
      "#f97316",
    ];
    const metrics = report.metrics.map((item, idx) => ({
      title: item.title,
      value: item.value,
      color: palette[idx % palette.length],
    }));

    const boxH = 28;
    const gap = 6;
    const startX = 14;
    const startY = 50;
    const metricsPerRow = 4;
    const boxW =
      (pageWidth - startX * 2 - gap * (metricsPerRow - 1)) / metricsPerRow;

    metrics.forEach((m, idx) => {
      const x = startX + (boxW + gap) * (idx % metricsPerRow);
      const y = startY + Math.floor(idx / metricsPerRow) * (boxH + gap);

      doc.setFillColor("#e5e7eb");
      doc.rect(x + 1.5, y + 1.5, boxW, boxH, "F");

      doc.setFillColor(white);
      doc.setDrawColor("#e5e7eb");
      doc.rect(x, y, boxW, boxH, "FD");

      doc.setFillColor(m.color);
      doc.rect(x, y, boxW, 3, "F");

      doc.setTextColor(gray);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(m.title.toUpperCase(), x + 3, y + 10);

      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(String(m.value ?? 0), x + 3, y + 22);
    });

    const metricRows = Math.ceil(metrics.length / metricsPerRow);
    let currentY = startY + metricRows * (boxH + gap) + 10;

    const tableBlock = (title: string, rows: CustomerRow[]) => {
      doc.setTextColor(primary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, 14, currentY);
      currentY += 4;

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
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 64, 175] },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        didDrawPage: (data) => {
          if (data.cursor) {
            currentY = data.cursor.y + 10;
          }
        },
      });
    };

    report.tables.forEach((table) => tableBlock(table.title, table.rows));

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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.metrics.map((metric) => (
              <div
                key={metric.title}
                className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm"
              >
                <p className="text-xs text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">
              Report Notes
            </p>
            <div className="mt-2 space-y-1 text-sm">
              {report.reportLines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {report.tables.map((table) => (
              <CustomerTable
                key={table.title}
                title={table.title}
                rows={table.rows}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
