"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { fetchBlobFromBackend, fetchFromBackend } from "@/lib/api-client";
import type { Landlord, YardOption } from "../../landlords/types";
import { useRole } from "@/components/providers/role-provider";
import {
  FileText,
  Download,
  PhoneIncoming,
  PhoneOutgoing,
  BarChart3,
  Home,
  Mail,
  Filter,
  CalendarDays,
  Search,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type LandlordReport = {
  totals: { total: number; inbound: number; outbound: number };
  averagePerYard: number;
  topYards: Array<{ id: number; name: string; total: number }>;
  callsByDay: Array<{
    date: string;
    total: number;
    inbound: number;
    outbound: number;
  }>;
  yards: Array<{
    id: number;
    name: string;
    total: number;
    inbound: number;
    outbound: number;
  }>;
  statusBreakdown: Record<string, number>;
};

export default function LandlordReportsPage() {
  const { role } = useRole();
  const normalizedRole = role?.toString().toLowerCase();
  const isAgent = normalizedRole === "agent";
  const router = useRouter();
  const searchParams = useSearchParams();
  const landlordIdParam = searchParams.get("landlordId");

  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [yards, setYards] = useState<YardOption[]>([]);
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>("");
  const [reportStartDate, setReportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().slice(0, 10);
  });
  const [reportEndDate, setReportEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [reportYardId, setReportYardId] = useState("all");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<LandlordReport | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getLogoUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/images/logo.jpeg`
      : "/images/logo.jpeg";

  useEffect(() => {
    if (isAgent) {
      router.replace("/landlords");
      return;
    }

    const loadLandlords = async () => {
      try {
        const data = await fetchFromBackend("/landlords?page=1&limit=500");
        const items = Array.isArray(data) ? data : data?.data || [];
        setLandlords(items);
      } catch (error) {
        console.error("Error fetching landlords:", error);
        toast({
          title: "Error",
          description: "Failed to load landlords",
          variant: "destructive",
        });
      }
    };
    const loadYards = async () => {
      try {
        const data = await fetchFromBackend("/yards");
        const items = Array.isArray(data) ? data : data?.data || [];
        setYards(items);
      } catch (error) {
        console.error("Error fetching yards:", error);
      }
    };
    loadLandlords();
    loadYards();
  }, [isAgent, router]);

  useEffect(() => {
    if (landlordIdParam) {
      setSelectedLandlordId(landlordIdParam);
    }
  }, [landlordIdParam]);

  // Close all modals when route changes
  const pathname = usePathname();
  useEffect(() => {
    setConfirmOpen(false);
  }, [pathname]);

  if (isAgent) {
    return null;
  }

  const metrics = useMemo(
    () =>
      reportData
        ? [
            {
              title: "Total Tickets",
              value: reportData.totals.total,
              icon: <BarChart3 className="h-4 w-4 text-slate-600" />,
              color: "text-slate-600",
            },
            {
              title: "Inbound",
              value: reportData.totals.inbound,
              icon: <PhoneIncoming className="h-4 w-4 text-emerald-600" />,
              color: "text-emerald-600",
            },
            {
              title: "Outbound",
              value: reportData.totals.outbound,
              icon: <PhoneOutgoing className="h-4 w-4 text-amber-600" />,
              color: "text-amber-600",
            },
            {
              title: "Avg / Yard",
              value: reportData.averagePerYard,
              icon: <Home className="h-4 w-4 text-blue-600" />,
              color: "text-blue-600",
            },
          ]
        : [],
    [reportData]
  );

  const MetricCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    color?: string;
  }) => (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className={cn("rounded-full p-2 bg-opacity-10", color)}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
      </div>
    </div>
  );

  const selectedLandlord = useMemo(() => {
    return (
      landlords.find(
        (landlord) => landlord.id.toString() === selectedLandlordId
      ) || null
    );
  }, [landlords, selectedLandlordId]);

  const yardOptions = useMemo(() => {
    if (!selectedLandlord) return [];
    const fromRelation =
      selectedLandlord.yards?.map((yard) => ({
        id: yard.id,
        label: yard.commonName || yard.name,
      })) || [];
    if (fromRelation.length > 0) return fromRelation;
    return yards
      .filter((yard) => yard.landlord?.id === selectedLandlord.id)
      .map((yard) => ({
        id: yard.id,
        label: yard.commonName || yard.name,
      }));
  }, [selectedLandlord, yards]);

  const handleGenerateReport = async () => {
    if (!selectedLandlordId) {
      toast({
        title: "Select a landlord",
        description: "Pick a landlord before generating the report.",
        variant: "destructive",
      });
      return;
    }
    setReportLoading(true);
    setReportError(null);
    try {
      const query = new URLSearchParams({
        startDate: reportStartDate,
        endDate: reportEndDate,
      });
      if (reportYardId !== "all") {
        query.set("yardId", reportYardId);
      }
      query.set("logoUrl", getLogoUrl());
      const response = await fetch(
        `/api/landlords/${selectedLandlordId}/report?${query.toString()}`
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Failed to load report"
        );
      }
      setReportData(result);
    } catch (error: any) {
      setReportError(error.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSendReport = async () => {
    if (!selectedLandlordId || !selectedLandlord) {
      toast({
        title: "Select a landlord",
        description: "Pick a landlord before sending the report.",
        variant: "destructive",
      });
      return;
    }
    setReportSending(true);
    setReportError(null);
    try {
      const payload: any = {
        startDate: reportStartDate,
        endDate: reportEndDate,
      };
      if (reportYardId !== "all") {
        payload.yardId = Number(reportYardId);
      }
      payload.logoUrl = getLogoUrl();
      const response = await fetch(
        `/api/landlords/${selectedLandlordId}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Failed to send report"
        );
      }
      toast({
        title: "Report sent",
        description: `Report emailed to ${selectedLandlord.email}`,
      });
    } catch (error: any) {
      setReportError(error.message || "Failed to send report");
    } finally {
      setReportSending(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!reportData || !selectedLandlord) return;
    try {
      const query = new URLSearchParams({
        startDate: reportStartDate,
        endDate: reportEndDate,
      });
      if (reportYardId !== "all") {
        query.set("yardId", reportYardId);
      }
      query.set("logoUrl", getLogoUrl());
      const blob = await fetchBlobFromBackend(
        `/landlords/${selectedLandlordId}/report/pdf?${query.toString()}`,
        { method: "GET" }
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `landlord_report_${selectedLandlordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download report.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExcel = async () => {
    if (!reportData || !selectedLandlord) return;
    try {
      const query = new URLSearchParams({
        startDate: reportStartDate,
        endDate: reportEndDate,
      });
      if (reportYardId !== "all") {
        query.set("yardId", reportYardId);
      }
      const blob = await fetchBlobFromBackend(
        `/landlords/${selectedLandlordId}/report/excel?${query.toString()}`,
        { method: "GET" }
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `landlord_report_${selectedLandlordId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download Excel report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Landlord Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate activity reports and manage communications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              disabled={!reportData}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadExcel}
              disabled={!reportData}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={!reportData || reportSending || reportLoading}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">
                {reportSending ? "Sending..." : "Email Report"}
              </span>
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              className="gap-2 min-w-[140px]"
            >
              {reportLoading ? (
                "Generating..."
              ) : (
                <>
                  <FileText className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
            <Filter className="w-4 h-4" /> Report Configuration
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-medium leading-none">
                Landlord
              </label>
              <Select
                value={selectedLandlordId}
                onValueChange={(value) => {
                  setSelectedLandlordId(value);
                  setReportYardId("all");
                  setReportData(null);
                  setReportError(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select landlord" />
                </SelectTrigger>
                <SelectContent>
                  {landlords.map((landlord) => (
                    <SelectItem
                      key={landlord.id}
                      value={landlord.id.toString()}
                    >
                      {landlord.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-medium leading-none">Yard</label>
              <Select value={reportYardId} onValueChange={setReportYardId}>
                <SelectTrigger>
                  <SelectValue placeholder="All yards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All yards</SelectItem>
                  {yardOptions.map((yard) => (
                    <SelectItem key={yard.id} value={yard.id.toString()}>
                      {yard.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-medium leading-none">
                Start Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={reportStartDate}
                  onChange={(event) => setReportStartDate(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-medium leading-none">
                End Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={reportEndDate}
                  onChange={(event) => setReportEndDate(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {reportError && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            {reportError}
          </div>
        )}

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send report by email?</AlertDialogTitle>
              <AlertDialogDescription>
                We will send the landlord activity report to{" "}
                {selectedLandlord?.email || "the configured address"}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={reportSending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={reportSending}
                onClick={async () => {
                  setConfirmOpen(false);
                  await handleSendReport();
                }}
              >
                {reportSending ? "Sending..." : "Send report"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!reportData ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No report generated</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
              Select a landlord and date range above, then click "Generate" to
              view statistics.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => (
                <MetricCard
                  key={m.title}
                  title={m.title}
                  value={m.value}
                  icon={m.icon}
                  color={m.color}
                />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow-sm h-full">
                <div className="flex flex-col border-b px-6 py-4">
                  <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" /> Yard
                    Breakdown
                  </h3>
                </div>
                <div className="p-0 overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground sticky top-0">
                        <tr>
                          <th className="px-6 py-3 font-medium">Yard Name</th>
                          <th className="px-6 py-3 font-medium text-right">
                            Total
                          </th>
                          <th className="px-6 py-3 font-medium text-right">
                            In
                          </th>
                          <th className="px-6 py-3 font-medium text-right">
                            Out
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {reportData.yards.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-muted-foreground"
                            >
                              No data available
                            </td>
                          </tr>
                        ) : (
                          reportData.yards.map((yard) => (
                            <tr
                              key={yard.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-6 py-3 font-medium">
                                {yard.name}
                              </td>
                              <td className="px-6 py-3 text-right font-bold">
                                {yard.total}
                              </td>
                              <td className="px-6 py-3 text-right text-emerald-600">
                                {yard.inbound}
                              </td>
                              <td className="px-6 py-3 text-right text-amber-600">
                                {yard.outbound}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow-sm h-full">
                <div className="flex flex-col border-b px-6 py-4">
                  <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" /> Calls
                    by Day
                  </h3>
                </div>
                <div className="p-0 overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground sticky top-0">
                        <tr>
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium text-right">
                            Total
                          </th>
                          <th className="px-6 py-3 font-medium text-right">
                            Inbound
                          </th>
                          <th className="px-6 py-3 font-medium text-right">
                            Outbound
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {reportData.callsByDay.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-muted-foreground"
                            >
                              No data available
                            </td>
                          </tr>
                        ) : (
                          reportData.callsByDay.map((day) => (
                            <tr
                              key={day.date}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-6 py-3 font-medium">
                                {day.date}
                              </td>
                              <td className="px-6 py-3 text-right font-bold">
                                {day.total}
                              </td>
                              <td className="px-6 py-3 text-right text-muted-foreground">
                                {day.inbound}
                              </td>
                              <td className="px-6 py-3 text-right text-muted-foreground">
                                {day.outbound}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  Top Performing Yards
                </h3>
                <div className="space-y-3">
                  {reportData.topYards.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data.</p>
                  ) : (
                    reportData.topYards.map((yard, index) => (
                      <div
                        key={yard.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">
                            {yard.name}
                          </span>
                        </div>
                        <Badge variant="secondary" className="font-bold">
                          {yard.total} Tickets
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  Status Breakdown
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(reportData.statusBreakdown).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No status data.
                    </p>
                  ) : (
                    Object.entries(reportData.statusBreakdown).map(
                      ([status, count]) => {
                        const label = status
                          .toLowerCase()
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ");
                        return (
                          <Badge
                            key={status}
                            variant="outline"
                            className="px-3 py-1.5 text-sm gap-2"
                          >
                            <span className="opacity-70 font-normal">
                              {label}
                            </span>
                            <span className="font-bold border-l pl-2 ml-1">
                              {count}
                            </span>
                          </Badge>
                        );
                      }
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
