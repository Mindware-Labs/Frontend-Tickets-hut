"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Landlord, YardOption } from "../types";

interface LandlordDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landlord: Landlord | null;
  yards: YardOption[];
  reportStartDate: string;
  reportEndDate: string;
  reportYardId: string;
  onReportStartDateChange: (value: string) => void;
  onReportEndDateChange: (value: string) => void;
  onReportYardIdChange: (value: string) => void;
  reportLoading: boolean;
  reportSending: boolean;
  reportError: string | null;
  reportData: {
    totals: { total: number; inbound: number; outbound: number };
    averagePerYard: number;
    topYards: Array<{ id: number; name: string; total: number }>;
    callsByDay: Array<{ date: string; total: number; inbound: number; outbound: number }>;
    yards: Array<{ id: number; name: string; total: number; inbound: number; outbound: number }>;
    statusBreakdown: Record<string, number>;
  } | null;
  onGenerateReport: () => void;
  onSendReport: () => void;
}

const getYardLabels = (landlord: Landlord | null, yards: YardOption[]) => {
  if (!landlord) return [];
  const fromRelation =
    landlord.yards?.map((yard) => yard.name) || [];
  if (fromRelation.length > 0) return fromRelation;
  return yards
    .filter((yard) => yard.landlord?.id === landlord.id)
    .map((yard) => yard.name);
};

export function LandlordDetailsModal({
  open,
  onOpenChange,
  landlord,
  yards,
  reportStartDate,
  reportEndDate,
  reportYardId,
  onReportStartDateChange,
  onReportEndDateChange,
  onReportYardIdChange,
  reportLoading,
  reportSending,
  reportError,
  reportData,
  onGenerateReport,
  onSendReport,
}: LandlordDetailsModalProps) {
  const yardLabels = getYardLabels(landlord, yards);
  const yardOptions =
    landlord?.yards?.map((yard) => ({
      id: yard.id,
      label:  yard.name,
    })) ||
    yards
      .filter((yard) => yard.landlord?.id === landlord?.id)
      .map((yard) => ({
        id: yard.id,
        label: yard.name,
      }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Landlord Details</DialogTitle>
          <DialogDescription>
            {landlord?.name || "Landlord overview"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{landlord?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{landlord?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{landlord?.phone || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Yards</h3>
              <span className="text-xs text-muted-foreground">
                {yardLabels.length} total
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {yardLabels.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  No yards linked to this landlord.
                </span>
              ) : (
                yardLabels.map((label) => (
                  <Badge key={label} variant="outline" className="gap-1">
                    <Building className="h-3 w-3" />
                    {label}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Reports</h3>
              <Button
                variant="outline"
                onClick={onSendReport}
                disabled={reportSending || reportLoading}
              >
                {reportSending ? "Sending..." : "Send Report"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Start Date</span>
                <Input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => onReportStartDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">End Date</span>
                <Input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => onReportEndDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Yard</span>
                <Select value={reportYardId} onValueChange={onReportYardIdChange}>
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

            <div className="flex gap-3">
              <Button onClick={onGenerateReport} disabled={reportLoading}>
                {reportLoading ? "Generating..." : "Generate Report"}
              </Button>
            </div>

            {reportError && (
              <p className="text-sm text-red-500">{reportError}</p>
            )}

            {reportData && (
              <div className="space-y-3">
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
                    <p className="text-lg font-semibold">{reportData.totals.outbound}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Avg / Yard</p>
                    <p className="text-lg font-semibold">{reportData.averagePerYard}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Yard Breakdown</p>
                  <div className="space-y-2">
                    {(reportData.yards ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data.</p>
                    ) : (
                      (reportData.yards ?? []).map((yard) => (
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

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Top Yards</p>
                  <div className="space-y-2">
                    {(reportData.topYards ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data.</p>
                    ) : (
                      (reportData.topYards ?? []).map((yard) => (
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

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Calls by Day</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {(reportData.callsByDay ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data.</p>
                    ) : (
                      (reportData.callsByDay ?? []).map((day) => (
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

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Status Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(reportData.statusBreakdown ?? {}).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No status data.</p>
                    ) : (
                      Object.entries(reportData.statusBreakdown ?? {}).map(
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
