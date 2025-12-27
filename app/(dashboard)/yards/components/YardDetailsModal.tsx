"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Yard } from "../types";

type YardTicket = {
  id: number;
  status?: string | null;
  createdAt?: string;
  customer?: { name?: string | null };
  customerPhone?: string | null;
};

type YardDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yard: Yard | null;
  showTicketsPanel: boolean;
  showLandlordPanel: boolean;
  ticketsLoading: boolean;
  tickets: YardTicket[];
  ticketSearch: string;
  setTicketSearch: (value: string) => void;
  onViewTickets: () => void;
  onViewLandlord: () => void;
};

const getTypeLabel = (type: Yard["yardType"]) =>
  type === "SAAS" ? "SaaS" : "Full Service";

export function YardDetailsModal({
  open,
  onOpenChange,
  yard,
  showTicketsPanel,
  showLandlordPanel,
  ticketsLoading,
  tickets,
  ticketSearch,
  setTicketSearch,
  onViewTickets,
  onViewLandlord,
}: YardDetailsModalProps) {
  const showDetailsPanel = showTicketsPanel || showLandlordPanel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yard Details</DialogTitle>
          <DialogDescription>{yard?.name || "Yard overview"}</DialogDescription>
        </DialogHeader>

        <div className={showDetailsPanel ? "grid gap-6 md:grid-cols-2" : "space-y-6"}>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Yard</p>
                  <p className="text-lg font-semibold">
                    {yard?.commonName || yard?.name || "N/A"}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    yard?.isActive
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                  }
                >
                  {yard?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">
                    {yard ? getTypeLabel(yard.yardType) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">
                    {yard?.propertyAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium">
                    {yard?.contactInfo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Link</p>
                  <p className="text-sm font-medium">
                    {yard?.yardLink || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={onViewTickets} disabled={!yard}>
                View Tickets
              </Button>
              <Button variant="outline" onClick={onViewLandlord} disabled={!yard}>
                View Landlord
              </Button>
            </div>
          </div>

          {showTicketsPanel && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Tickets</h3>
                <span className="text-xs text-muted-foreground">
                  {tickets.length} results
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
                {ticketsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading tickets...
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No tickets found for this yard.
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-lg border p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">#{ticket.id}</p>
                        <Badge variant="outline">
                          {ticket.status || "Unknown"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.customer?.name || "Unassigned"}
                      </p>
                      {ticket.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {showLandlordPanel && !showTicketsPanel && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Landlord</h3>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {yard?.landlord?.name || "No landlord assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Landlord ID</p>
                  <p className="text-sm font-medium">
                    {yard?.landlord?.id ?? yard?.landlordId ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
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
