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
import { fetchFromBackend, fetchBlobFromBackend } from "@/lib/api-client";
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
  direction?: string;
  status: string;
  note: string;
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

const PDF_COLOR_MAP: Record<string, [number, number, number]> = {
  "text-blue-600": [37, 99, 235],
  "text-green-600": [22, 163, 74],
  "text-amber-600": [217, 119, 6],
  "text-emerald-600": [5, 150, 105],
  "text-purple-600": [124, 58, 237],
  "text-slate-600": [71, 85, 105],
  "text-orange-600": [234, 88, 12],
  "text-rose-600": [225, 29, 72],
  "text-cyan-600": [8, 145, 178],
  "text-red-600": [220, 38, 38],
  "text-teal-600": [13, 148, 136],
};

const getRgbColor = (className?: string): [number, number, number] => {
  if (className && PDF_COLOR_MAP[className]) return PDF_COLOR_MAP[className];
  return [55, 65, 81];
};

type ImageSize = { width: number; height: number };

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
        <div className="min-w-200 align-middle">
          <div className="grid grid-cols-12 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-y">
            <div className="col-span-3 px-6 py-3">Customer</div>
            <div className="col-span-2 px-6 py-3">Phone</div>
            <div className="col-span-2 px-6 py-3">Direction</div>
            <div className="col-span-2 px-6 py-3">Status</div>
            <div className="col-span-3 px-6 py-3">Notes / Special Case</div>
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
                  <div className="col-span-2 px-6 py-3 text-muted-foreground truncate">
                    {row.phone || "—"}
                  </div>
                  <div className="col-span-2 px-6 py-3">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                      {row.direction || "Unknown"}
                    </span>
                  </div>
                  <div className="col-span-2 px-6 py-3">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {row.status}
                    </span>
                  </div>
                  <div className="col-span-3 px-6 py-3 text-muted-foreground wrap-break-word text-xs">
                    {row.note || "—"}
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
  const [logoFormat, setLogoFormat] = useState<"PNG" | "JPEG">("JPEG");
  const [logoSize, setLogoSize] = useState<ImageSize | null>(null);

  const getLogoUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/images/logo.jpeg`
      : "/images/logo.jpeg";

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
        const response = await fetch("/images/logo.jpeg");
        if (!response.ok) throw new Error("Logo not found");
        const blob = await response.blob();
        const format =
          blob.type.includes("jpeg") || blob.type.includes("jpg")
            ? "JPEG"
            : "PNG";
        setLogoFormat(format);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string") {
            setLogoDataUrl(reader.result);
            const img = new Image();
            img.onload = () =>
              setLogoSize({ width: img.width, height: img.height });
            img.src = reader.result;
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
      campaigns.find((c) => c.id.toString() === selectedCampaignId) || null
    );
  }, [campaigns, selectedCampaignId]);

  const buildReport = async () => {
    if (!selectedCampaignId || !startDate || !endDate) {
      toast({
        title: "Select campaign and dates",
        description: "You must select a campaign and date range.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      const response = await fetchFromBackend(
        `/campaign/${selectedCampaignId}/report?${params.toString()}`
      );
      if (!response) throw new Error("No data from backend");
      // El backend ya entrega los datos agregados y tablas
      setReport({
        campaign: response.campaign || null,
        metrics: response.metrics || [],
        totalCustomers: response.totals?.total || 0,
        reportLines: [],
        tables: response.tables || [],
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

  const exportPdfBackend = async () => {
    if (!report) return;
    if (!startDate || !endDate) {
      toast({
        title: "Select dates",
        description: "Start and end date are required to export the PDF.",
        variant: "destructive",
      });
      return;
    }
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        logoUrl: getLogoUrl(),
      });
      const blob = await fetchBlobFromBackend(
        `/campaign/${selectedCampaignId}/report/pdf?${params.toString()}`,
        { method: "GET" }
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `campaign_report_${selectedCampaignId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500">
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
              onClick={exportPdfBackend}
              disabled={!report}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            <Button
              onClick={buildReport}
              disabled={loading}
              className="gap-2 min-w-35"
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
          <div className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-center animate-in zoom-in-95 duration-300">
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
