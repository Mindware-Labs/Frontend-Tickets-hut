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
import {
  FileText,
  Download,
  Users,
  PhoneMissed,
  CheckCircle2,
  CreditCard,
  Search,
  CalendarDays,
  Filter,
  XCircle,
  Ban,
  PhoneOff,
  BadgeDollarSign,
  ReceiptText,
  MoveRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  icon?: React.ReactNode;
  color?: string;
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

// --- Constants & Helpers ---
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

const AR_ICONS: Record<string, React.ReactNode> = {
  PAID: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  NOT_PAID: <XCircle className="h-4 w-4 text-red-600" />,
  OFFLINE_PAYMENT: <ReceiptText className="h-4 w-4 text-amber-600" />,
  NOT_PAID_CHECK: <FileText className="h-4 w-4 text-amber-700" />,
  MOVED_OUT: <MoveRight className="h-4 w-4 text-orange-600" />,
  CANCELED: <Ban className="h-4 w-4 text-rose-600" />,
  BALANCE_0: <BadgeDollarSign className="h-4 w-4 text-teal-600" />,
  DO_NOT_CALL: <PhoneOff className="h-4 w-4 text-red-600" />,
};

const categorizeIssueDetail = (detail: string) => {
  const text = detail.toLowerCase();
  const tags: string[] = [];
  if (
    /(not parked|no longer parked|not parking|not at the location)/i.test(text)
  )
    tags.push("not_parked");
  if (
    /(out of service|blocked|disconnected|wrong number|no number)/i.test(text)
  )
    tags.push("unreachable");
  if (/(no further contact|do not contact|police)/i.test(text))
    tags.push("no_contact");
  if (/(rate discrepancy|pricing|price|rate)/i.test(text))
    tags.push("rate_discrepancy");
  if (/(declined|refused)/i.test(text)) tags.push("declined");
  if (/(handling internally|handled internally|company handling)/i.test(text))
    tags.push("handled_internally");
  if (/(paid by check|check)/i.test(text)) tags.push("paid_by_check");
  if (/(unresponsive|no response|no reply)/i.test(text))
    tags.push("unresponsive");
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

// --- Subcomponents ---

const MetricCard = ({ metric }: { metric: ReportMetric }) => (
  <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between space-y-0 pb-2">
      <p className="text-sm font-medium text-muted-foreground">
        {metric.title}
      </p>
      {metric.icon && (
        <div className={cn("rounded-full p-2 bg-opacity-10", metric.color)}>
          {metric.icon}
        </div>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
    </div>
    {/* Decorative background shape */}
    <div
      className={cn(
        "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-5",
        metric.color?.replace("text-", "bg-")
      )}
    />
  </div>
);

const CustomerTable = ({
  title,
  rows,
}: {
  title: string;
  rows: CustomerRow[];
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col border-b px-6 py-4">
        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} {rows.length === 1 ? "record" : "records"} found
        </p>
      </div>

      {/* Container with horizontal scroll for mobile responsiveness */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px] align-middle">
          <div className="grid grid-cols-12 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-y">
            <div className="col-span-3 px-6 py-3">Customer</div>
            <div className="col-span-3 px-6 py-3">Phone</div>
            <div className="col-span-2 px-6 py-3">Status</div>
            <div className="col-span-4 px-6 py-3">Notes / Special Case</div>
          </div>
          <div className="divide-y">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-20" />
                No customer data available for this section.
              </div>
            ) : (
              rows.map((row, index) => (
                <div
                  key={`${title}-${index}`}
                  className="grid grid-cols-12 text-sm hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="col-span-3 px-6 py-3 font-medium truncate"
                    title={row.name}
                  >
                    {row.name}
                  </div>
                  <div className="col-span-3 px-6 py-3 text-muted-foreground truncate">
                    {row.phone || "—"}
                  </div>
                  <div className="col-span-2 px-6 py-3">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {row.status}
                    </span>
                  </div>
                  <div className="col-span-4 px-6 py-3 text-muted-foreground break-words text-xs">
                    {row.specialCase || "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
    if (campaignIdParam) setSelectedCampaignId(campaignIdParam);
  }, [campaignIdParam]);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/images/LOGO CQ-01.png");
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string")
            setLogoDataUrl(reader.result);
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
      campaigns.find((c) => c.id.toString() === selectedCampaignId) || null
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
        (t) => (t.direction || "").toUpperCase() === CallDirection.MISSED
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
        Object.keys(AR_LABELS).forEach((key) => {
          if (!arGroups.has(key)) arGroups.set(key, []);
        });

        const arPalette = [
          "text-blue-600",
          "text-green-600",
          "text-amber-600",
          "text-emerald-600",
          "text-purple-600",
          "text-slate-600",
          "text-orange-600",
          "text-rose-600",
          "text-cyan-600",
        ];

        metrics = [
          {
            title: "Total Customers",
            value: customers.length,
            icon: <Users className="h-4 w-4 text-blue-600" />,
            color: "text-blue-600",
          },
          ...Object.keys(AR_LABELS).map((key, idx) => ({
            title: AR_LABELS[key],
            value: arGroups.get(key)?.length || 0,
            color: arPalette[idx + 1] || "text-slate-600",
          })),
          {
            title: "Missed Calls",
            value: missedCalls.length,
            icon: <PhoneMissed className="h-4 w-4 text-red-600" />,
            color: "text-red-600",
          },
        ];

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
          .filter((t) => t.issueDetail?.trim())
          .map((t) => ({
            customerId: t.customerId,
            customerName: t.customer?.name,
            customerPhone: t.customerPhone ?? t.customer?.phone,
            note: t.issueDetail?.trim() ?? "",
          }));
        const specialCases = notes.map((n) => ({
          ...n,
          tags: n.note ? categorizeIssueDetail(n.note) : [],
        }));
        const specialCaseMap = new Map<string, string>();
        specialCases.forEach((item) => {
          const key = `${item.customerName || "Unknown"}::${
            item.customerPhone || ""
          }`;
          if (item.note) specialCaseMap.set(key, item.note);
        });

        const buildRowsWithNotes = (items: Ticket[], status: string) =>
          items.map((t) => {
            const name = getCustomerLabel(t);
            const phone = t.customerPhone || t.customer?.phone || "";
            const key = `${name}::${phone}`;
            return {
              name,
              phone,
              status,
              specialCase:
                t.issueDetail?.trim() || specialCaseMap.get(key) || "",
            };
          });

        metrics = [
          {
            title: "Total Customers",
            value: customers.length,
            icon: <Users className="h-4 w-4 text-slate-600" />,
            color: "text-slate-600",
          },
          {
            title: "Accepted",
            value: groups.registered.length,
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
            color: "text-emerald-600",
          },
          {
            title: "LL Pay",
            value: groups.paidWithLandlord.length,
            icon: <CreditCard className="h-4 w-4 text-amber-600" />,
            color: "text-amber-600",
          },
          {
            title: "Missed Calls",
            value: missedCalls.length,
            icon: <PhoneMissed className="h-4 w-4 text-rose-600" />,
            color: "text-rose-600",
          },
        ];

        tables = [
          {
            title: "Paid with LL",
            rows: buildRowsWithNotes(groups.paidWithLandlord, "Paid with LL"),
          },
          {
            title: "Registered",
            rows: buildRowsWithNotes(groups.registered, "Registered"),
          },
          {
            title: "Not Registered",
            rows: buildRowsWithNotes(groups.pending, "Not Registered"),
          },
          {
            title: "Missed Calls",
            rows: buildRowsWithNotes(missedCalls, "Missed Call"),
          },
        ];

        reportLines.push("Parking Registration & Payment Status Report");
        if (selectedCampaign?.nombre) reportLines.push(selectedCampaign.nombre);
        reportLines.push(`Total Customers: ${customers.length}`);
        reportLines.push(`Accepted: ${groups.registered.length}`);
      }

      setReport({
        campaign: selectedCampaign,
        metrics,
        totalCustomers: customers.length,
        reportLines,
        tables,
      });
    } catch (error: any) {
      console.error(error);
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

    // Logo logic
    const logoSize = 30;
    const logoX = pageWidth - 14 - logoSize;
    const logoY = 7;
    if (logoDataUrl)
      doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoSize, logoSize);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CAMPAIGN:", 14, 30);
    doc.setFont("helvetica", "normal");
    doc.text(report.campaign?.nombre || "—", 38, 30);

    if (startDate || endDate) {
      doc.setFont("helvetica", "bold");
      doc.text("RANGE:", 120, 30);
      doc.setFont("helvetica", "normal");
      doc.text(`${startDate || "Start"} - ${endDate || "End"}`, 145, 30);
    }

    let currentY = 50;

    currentY += 40;
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
            ? rows.map((r) => [
                r.name,
                r.phone || "—",
                r.status,
                r.specialCase || "—",
              ])
            : [["No data", "", "", ""]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 64, 175] },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        didDrawPage: (d) => {
          if (d.cursor) currentY = d.cursor.y + 10;
        },
      });
    };
    report.tables.forEach((t) => tableBlock(t.title, t.rows));
    doc.save(`report_${report.campaign?.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
              Campaign Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze performance and generate customer lists for campaigns.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportPdf}
              disabled={!report}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            <Button
              onClick={buildReport}
              disabled={loading}
              className="gap-2 min-w-[140px]"
            >
              {loading ? (
                <>Generating...</>
              ) : (
                <>
                  <FileText className="h-4 w-4" /> Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-lg shadow-slate-200/60 dark:shadow-slate-950/40 md:p-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
            <Filter className="w-4 h-4" /> Report Configuration
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Campaign
              </label>
              <Select
                value={selectedCampaignId}
                onValueChange={setSelectedCampaignId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium leading-none">
                Start Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium leading-none">
                End Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {!report ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No report generated</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
              Select a campaign and date range above, then click "Generate
              Report" to view the data.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {report.metrics.map((metric, idx) => (
                <MetricCard key={idx} metric={metric} />
              ))}
            </div>

            {/* Report Summary/Notes */}
            {report.reportLines.length > 0 && (
              <div className="rounded-lg border bg-blue-50/50 p-4 text-sm text-blue-900 dark:bg-blue-950/20 dark:text-blue-100">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" /> Report Summary
                </h4>
                <div className="space-y-1 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                  {report.reportLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Tables */}
            <div className="space-y-8">
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
    </div>
  );
}
