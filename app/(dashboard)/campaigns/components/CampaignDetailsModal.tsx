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
import Link from "next/link";
import { Search } from "lucide-react";
import type { Campaign } from "../types";

type CampaignTicket = {
  id: number;
  status?: string | null;
  createdAt?: string;
  customer?: { name?: string | null };
  customerPhone?: string | null;
};

type CampaignDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  campaignTypeLabels: Record<string, string>;
  getStatusColor: (isActive: boolean) => string;
  getYardLabel: (campaign: Campaign) => string;
  showTicketsPanel: boolean;
  ticketsLoading: boolean;
  tickets: CampaignTicket[];
  ticketSearch: string;
  setTicketSearch: (value: string) => void;
  onViewTickets: () => void;
};

export function CampaignDetailsModal({
  open,
  onOpenChange,
  campaign,
  campaignTypeLabels,
  getStatusColor,
  getYardLabel,
  showTicketsPanel,
  ticketsLoading,
  tickets,
  ticketSearch,
  setTicketSearch,
  onViewTickets,
}: CampaignDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Details</DialogTitle>
          <DialogDescription>
            {campaign?.nombre || "Campaign overview"}
          </DialogDescription>
        </DialogHeader>

        <div className={showTicketsPanel ? "grid gap-6 md:grid-cols-2" : "space-y-6"}>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Campaign</p>
                  <p className="text-lg font-semibold">
                    {campaign?.nombre || "N/A"}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={campaign ? getStatusColor(campaign.isActive) : undefined}
                >
                  {campaign?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">
                    {campaign ? campaignTypeLabels[campaign.tipo] : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">
                    {campaign?.duracion || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Yard</p>
                  <p className="text-sm font-medium">
                    {campaign ? getYardLabel(campaign) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tickets</p>
                  <p className="text-sm font-medium">
                    {campaign?.ticketCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={onViewTickets} disabled={!campaign}>
                View Tickets
              </Button>
              {campaign?.id && (
                <Button asChild variant="secondary">
                  <Link href={`/reports/campaigns?campaignId=${campaign.id}`}>
                    Open Report
                  </Link>
                </Button>
              )}
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
                    No tickets found for this campaign.
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
