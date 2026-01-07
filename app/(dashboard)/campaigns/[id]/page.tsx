"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchFromBackend } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  FileDown,
  FileText,
  Loader2,
  Search,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportMetric {
  title: string;
  value: number;
  color: string;
}

interface ReportRow {
  name: string;
  phone: string;
  status: string;
  note: string;
  direction: string;
  createdAt: string;
  agentName: string;
}

interface ReportTable {
  title: string;
  rows: ReportRow[];
}

interface CampaignReportData {
  metrics: ReportMetric[];
  tables: ReportTable[];
  totals: { total: number; missed: number };
}

export default function CampaignReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<CampaignReportData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCampaign(true);
        const d = await fetchFromBackend(`/campaign/${id}`);
        if (d) setCampaignName(d.nombre);
      } catch (e) {
        console.error(e);
        toast({
          title: "Error",
          description: "Failed to load campaign details.",
          variant: "destructive",
        });
      } finally {
        setLoadingCampaign(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleGenerate = async () => {
    if (!startDate || !endDate) return;
    setGenerating(true);
    try {
      const q = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const data = await fetchFromBackend(`/campaign/${id}/report/data?${q}`);
      setReportData(data);
      toast({ title: "Generated", description: "Report data updated." });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (fmt: "pdf" | "excel") => {
    if (!startDate || !endDate) return;
    const q = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    // Ajusta la URL base según tu entorno (o usa una variable de entorno)
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    window.open(`${baseUrl}/campaign/${id}/report/${fmt}?${q}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Campaign Reports</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Analyze performance and generate customer lists for campaigns.
          </p>
        </div>
        {reportData && (
          <div className="flex gap-2 ml-10 sm:ml-0">
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <FileDown className="mr-2 h-4 w-4 text-red-600" /> PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <FileDown className="mr-2 h-4 w-4 text-green-600" /> Excel
            </Button>
          </div>
        )}
      </div>

      {/* Configuration Card */}
      <div className="rounded-xl border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase">
          <Search className="h-4 w-4" /> Report Configuration
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Campaign</label>
            <Select disabled value={id}>
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingCampaign ? "Loading..." : campaignName}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={id}>{campaignName}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleGenerate}
            disabled={generating || !startDate || !endDate}
            className="bg-primary"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Content */}
      {!reportData ? (
        <div className="rounded-xl border border-dashed p-12 flex flex-col items-center justify-center text-center bg-muted/5 min-h-[300px]">
          <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No report generated</h3>
          <p className="text-muted-foreground mt-1">
            Select a date range above and click &quot;Generate Report&quot; to view the
            data.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {reportData.metrics.map((m, i) => (
              <Card key={i} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase truncate" title={m.title}>
                      {m.title}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-primary">{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tables */}
          {reportData.tables.map((table, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />{" "}
                {table.title}{" "}
                <Badge variant="secondary" className="ml-1">
                  {table.rows.length}
                </Badge>
              </h3>
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-3 whitespace-nowrap">Customer</th>
                      <th className="px-6 py-3 whitespace-nowrap">Phone</th>
                      <th className="px-6 py-3 whitespace-nowrap">Status</th>
                      <th className="px-6 py-3 min-w-[200px]">Notes</th>
                      <th className="px-6 py-3 whitespace-nowrap">Date</th>
                      <th className="px-6 py-3 whitespace-nowrap">Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {table.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center italic text-muted-foreground"
                        >
                          No records found for this category.
                        </td>
                      </tr>
                    ) : (
                      table.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-foreground">
                            {row.name}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground font-mono text-xs">
                            {row.phone}
                          </td>
                          <td className="px-6 py-3">
                            <Badge
                              variant="outline"
                              className="font-normal text-[10px] uppercase tracking-wide"
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td
                            className="px-6 py-3 max-w-[300px] truncate text-muted-foreground"
                            title={row.note}
                          >
                            {row.note || "-"}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                            {new Date(row.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {row.agentName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}