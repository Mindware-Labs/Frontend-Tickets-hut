"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { fetchFromBackend } from "@/lib/api-client";
import type { Landlord, YardOption } from "../../landlords/types";

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (landlordIdParam) {
      setSelectedLandlordId(landlordIdParam);
    }
  }, [landlordIdParam]);

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
      const response = await fetch(
        `/api/landlords/${selectedLandlordId}/report?${query.toString()}`
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || result?.error || "Failed to load report");
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
        throw new Error(result?.message || result?.error || "Failed to send report");
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

  const handleDownloadReport = () => {
    if (!reportData || !selectedLandlord) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Landlord Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Landlord: ${selectedLandlord.name}`, 14, 26);
    doc.text(
      `Range: ${reportStartDate} - ${reportEndDate}`,
      14,
      32
    );

    let currentY = 38;

    autoTable(doc, {
      startY: currentY,
      head: [["Metric", "Value"]],
      body: [
        ["Total Tickets", reportData.totals.total],
        ["Inbound", reportData.totals.inbound],
        ["Outbound", reportData.totals.outbound],
        ["Avg / Yard", reportData.averagePerYard],
      ],
      didDrawPage: (data) => {
        if (data.cursor) {
          currentY = data.cursor.y + 8;
        }
      },
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Yard", "Total", "Inbound", "Outbound"]],
      body:
        reportData.yards.length > 0
          ? reportData.yards.map((yard) => [
              yard.name,
              yard.total,
              yard.inbound,
              yard.outbound,
            ])
          : [["No data", "", "", ""]],
      didDrawPage: (data) => {
        if (data.cursor) {
          currentY = data.cursor.y + 8;
        }
      },
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Top Yard", "Total"]],
      body:
        reportData.topYards.length > 0
          ? reportData.topYards.map((yard) => [yard.name, yard.total])
          : [["No data", ""]],
      didDrawPage: (data) => {
        if (data.cursor) {
          currentY = data.cursor.y + 8;
        }
      },
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Date", "Total", "Inbound", "Outbound"]],
      body:
        reportData.callsByDay.length > 0
          ? reportData.callsByDay.map((day) => [
              day.date,
              day.total,
              day.inbound,
              day.outbound,
            ])
          : [["No data", "", "", ""]],
      didDrawPage: (data) => {
        if (data.cursor) {
          currentY = data.cursor.y + 8;
        }
      },
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Status", "Count"]],
      body: Object.keys(reportData.statusBreakdown).length
        ? Object.entries(reportData.statusBreakdown).map(([status, count]) => [
            status,
            count,
          ])
        : [["No data", ""]],
    });

    doc.save(`landlord_report_${selectedLandlord.id}.pdf`);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landlord Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate landlord activity reports and send confirmations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleGenerateReport} disabled={reportLoading}>
            {reportLoading ? "Generating..." : "Generate Report"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={!reportData}
          >
            Download PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handleSendReport}
            disabled={!reportData || reportSending || reportLoading}
          >
            {reportSending ? "Sending..." : "Send Report"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Landlord
          </p>
          <Select
            value={selectedLandlordId}
            onValueChange={(value) => {
              setSelectedLandlordId(value);
              setReportYardId("all");
              setReportData(null);
              setReportError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select landlord" />
            </SelectTrigger>
            <SelectContent>
              {landlords.map((landlord) => (
                <SelectItem key={landlord.id} value={landlord.id.toString()}>
                  {landlord.name}
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
            value={reportStartDate}
            onChange={(event) => setReportStartDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            End Date
          </p>
          <Input
            type="date"
            value={reportEndDate}
            onChange={(event) => setReportEndDate(event.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <p className="text-xs font-semibold text-muted-foreground">Yard</p>
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
      </div>

      {reportError && (
        <p className="text-sm text-red-500">{reportError}</p>
      )}

      {!reportData ? (
        <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          Select a landlord and generate a report to see results.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Total Tickets</p>
              <p className="text-lg font-semibold">{reportData.totals.total}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Inbound</p>
              <p className="text-lg font-semibold">{reportData.totals.inbound}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Outbound</p>
              <p className="text-lg font-semibold">
                {reportData.totals.outbound}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Avg / Yard</p>
              <p className="text-lg font-semibold">{reportData.averagePerYard}</p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">Yard Breakdown</p>
            <div className="space-y-2">
              {reportData.yards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : (
                reportData.yards.map((yard) => (
                  <div
                    key={yard.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{yard.name}</span>
                      <span>Total: {yard.total}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inbound: {yard.inbound} · Outbound: {yard.outbound}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">Top Yards</p>
            <div className="space-y-2">
              {reportData.topYards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : (
                reportData.topYards.map((yard) => (
                  <div
                    key={yard.id}
                    className="rounded-md border p-3 text-sm flex items-center justify-between"
                  >
                    <span className="font-medium">{yard.name}</span>
                    <span>Total: {yard.total}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">Calls by Day</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {reportData.callsByDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : (
                reportData.callsByDay.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-md border p-3 text-xs flex items-center justify-between"
                  >
                    <span>{day.date}</span>
                    <span>Total: {day.total}</span>
                    <span>In: {day.inbound}</span>
                    <span>Out: {day.outbound}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground">
              Status Breakdown
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(reportData.statusBreakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">No status data.</p>
              ) : (
                Object.entries(reportData.statusBreakdown).map(
                  ([status, count]) => (
                    <Badge key={status} variant="outline">
                      {status}: {count}
                    </Badge>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
