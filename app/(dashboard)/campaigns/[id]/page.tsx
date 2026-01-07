"use client";

// LOGS INMEDIATOS AL CARGAR EL ARCHIVO
if (typeof window !== 'undefined') {
  console.log('🚀🚀🚀 ARCHIVO CAMPAIGN REPORT PAGE CARGADO 🚀🚀🚀');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Window object:', typeof window);
} else {
  console.log('📦 Server-side: Campaign Report Page file loaded');
}

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
  ticketId: number;
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
  // LOGS INMEDIATOS AL RENDERIZAR EL COMPONENTE
  console.log('═══════════════════════════════════════════════════');
  console.log('🎯 CAMPAIGN REPORT PAGE COMPONENT RENDERING');
  console.log('═══════════════════════════════════════════════════');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Window available:', typeof window !== 'undefined');
  
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  console.log('📋 Component params:', {
    campaignId: id,
    params: params,
    routerExists: !!router,
    routerType: typeof router,
  });
  
  // Test log to verify component is rendering
  if (typeof window !== 'undefined') {
    console.log('✅ Client-side rendering confirmed');
    console.log('✅ Window.location:', window.location.href);
  } else {
    console.log('⚠️ Server-side rendering');
  }

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<CampaignReportData | null>(null);

  useEffect(() => {
    console.log('🔵 [Campaign Report] useEffect - Loading campaign:', id);
    const load = async () => {
      try {
        setLoadingCampaign(true);
        console.log('🔵 [Campaign Report] Fetching campaign details for:', id);
        const d = await fetchFromBackend(`/campaign/${id}`);
        console.log('🟢 [Campaign Report] Campaign details received:', d);
        if (d) {
          setCampaignName(d.nombre);
          console.log('🟢 [Campaign Report] Campaign name set to:', d.nombre);
        }
      } catch (e) {
        console.error('🔴 [Campaign Report] Error loading campaign:', e);
        toast({
          title: "Error",
          description: "Failed to load campaign details.",
          variant: "destructive",
        });
      } finally {
        setLoadingCampaign(false);
        console.log('🔵 [Campaign Report] Campaign loading finished');
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
      console.log('🔵 [Campaign Report] Generating report for campaign:', id);
      console.log('🔵 [Campaign Report] Date range:', { startDate, endDate });
      console.log('🔵 [Campaign Report] Request URL:', `/campaign/${id}/report?${q}`);
      
      const data = await fetchFromBackend(`/campaign/${id}/report?${q}`);
      
      console.log('🟢 [Campaign Report] Report data received:', data);
      console.log('🟢 [Campaign Report] Data type:', typeof data);
      console.log('🟢 [Campaign Report] Has tables?', !!data?.tables);
      console.log('🟢 [Campaign Report] Tables count:', data?.tables?.length || 0);
      
      if (data?.tables && data.tables.length > 0) {
        console.log('🟢 [Campaign Report] First table:', data.tables[0]);
        console.log('🟢 [Campaign Report] First table title:', data.tables[0]?.title);
        console.log('🟢 [Campaign Report] First table rows count:', data.tables[0]?.rows?.length || 0);
        
        if (data.tables[0]?.rows && data.tables[0].rows.length > 0) {
          console.log('🟢 [Campaign Report] First 3 rows sample:');
          data.tables[0].rows.slice(0, 3).forEach((row: any, idx: number) => {
            console.log(`  Row ${idx + 1}:`, {
              ticketId: row.ticketId,
              name: row.name,
              phone: row.phone,
              status: row.status,
              hasTicketId: !!row.ticketId,
              ticketIdType: typeof row.ticketId,
            });
          });
        } else {
          console.warn('⚠️ [Campaign Report] First table has no rows!');
        }
      } else {
        console.warn('⚠️ [Campaign Report] No tables in response!');
      }
      
      setReportData(data);
      toast({ title: "Generated", description: "Report data updated." });
    } catch (e) {
      console.error('🔴 [Campaign Report] Error generating report:', e);
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

  console.log('🎨 RENDERING JSX - About to return component');
  console.log('Current state:', {
    loadingCampaign,
    campaignName,
    generating,
    hasStartDate: !!startDate,
    hasEndDate: !!endDate,
    hasReportData: !!reportData,
    reportDataTablesCount: reportData?.tables?.length || 0,
  });

  // Log antes del return
  if (typeof window !== 'undefined') {
    console.log('🎨 JSX RENDERING - Inside return statement');
  }

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
          {(() => {
            console.log('=== RENDERING REPORT DATA ===');
            console.log('Report data:', reportData);
            console.log('Tables count:', reportData?.tables?.length);
            if (reportData?.tables) {
              reportData.tables.forEach((table, i) => {
                console.log(`Table ${i}:`, table.title, 'Rows:', table.rows.length);
              });
            }
            return null;
          })()}
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
          {reportData.tables.map((table, i) => {
            console.log(`🟡 [Campaign Report] Rendering table ${i}:`, {
              title: table.title,
              rowsCount: table.rows.length,
              firstRowSample: table.rows[0],
            });
            
            return (
            <div key={i} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />{" "}
                {table.title}{" "}
                <Badge variant="secondary" className="ml-1">
                  {table.rows.length}
                </Badge>
              </h3>
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden overflow-x-auto">
                <div className="px-6 py-2 bg-muted/30 border-b text-xs text-muted-foreground">
                  💡 Click on any row to view ticket details in All Tickets
                </div>
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
                      table.rows.map((row, idx) => {
                        console.log(`🟡 [Campaign Report] Rendering row ${idx}:`, {
                          ticketId: row.ticketId,
                          name: row.name,
                          hasTicketId: !!row.ticketId,
                          ticketIdType: typeof row.ticketId,
                          fullRow: row,
                        });
                        
                        const handleRowClick = (e: React.MouseEvent) => {
                          // SIMPLE TEST - This should ALWAYS fire
                          alert('CLICK DETECTED! Check console for details.');
                          console.log('=== ROW CLICKED ===');
                          console.log('🟣 [Campaign Report] Row clicked!', {
                            rowIndex: idx,
                            event: e,
                            target: e.target,
                            currentTarget: e.currentTarget,
                            rowData: row,
                            ticketId: row.ticketId,
                            hasTicketId: !!row.ticketId,
                          });
                          
                          // Prevent event from bubbling up
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // Check if click was on a badge or other interactive element
                          const target = e.target as HTMLElement;
                          console.log('🟣 [Campaign Report] Click target:', {
                            tagName: target.tagName,
                            className: target.className,
                            isButton: !!target.closest('button'),
                            isLink: !!target.closest('a'),
                            isBadge: target.closest('[class*="Badge"]') !== null,
                          });
                          
                          if (target.closest('button') || target.closest('a')) {
                            console.log('🟣 [Campaign Report] Click was on button/link, ignoring');
                            return;
                          }
                          
                          if (row.ticketId) {
                            const ticketUrl = `/tickets?id=${row.ticketId}`;
                            console.log('🟢 [Campaign Report] Navigating to ticket:', {
                              ticketId: row.ticketId,
                              url: ticketUrl,
                              router: router,
                              rowData: row,
                            });
                            router.push(ticketUrl);
                          } else {
                            console.error('🔴 [Campaign Report] Ticket ID is missing!', {
                              row: row,
                              rowIndex: idx,
                              tableTitle: table.title,
                            });
                            toast({
                              title: "Error",
                              description: "Ticket ID not found. Please refresh the report.",
                              variant: "destructive",
                            });
                          }
                        };
                        
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={(e) => {
                              console.log('=== TR ONCLICK FIRED ===', idx);
                              handleRowClick(e);
                            }}
                            onMouseDown={() => console.log('=== MOUSE DOWN ===', idx)}
                            onMouseUp={() => console.log('=== MOUSE UP ===', idx)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleRowClick(e as any);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="px-6 py-3 font-medium text-foreground">
                              {row.name}
                            </td>
                            <td className="px-6 py-3 text-muted-foreground font-mono text-xs">
                              {row.phone}
                            </td>
                            <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                              <Badge
                                variant="outline"
                                className="font-normal text-[10px] uppercase tracking-wide pointer-events-none"
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}