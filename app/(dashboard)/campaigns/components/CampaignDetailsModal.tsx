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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Tag,
  Clock,
  Building,
  Ticket,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { Campaign } from "../types";
import { useRole } from "@/components/providers/role-provider";

type CampaignDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  campaignTypeLabels: Record<string, string>;
  getStatusColor: (isActive: boolean) => string;
  getYardLabel: (campaign: Campaign) => string;
  showTicketsPanel: boolean;
  ticketsLoading: boolean;
  tickets: any[];
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
  showTicketsPanel: _showTicketsPanel,
  ticketsLoading: _ticketsLoading,
  tickets,
  ticketSearch: _ticketSearch,
  setTicketSearch: _setTicketSearch,
  onViewTickets: _onViewTickets,
}: CampaignDetailsModalProps) {
  const { role } = useRole();
  const isAgent = role?.toString().toLowerCase() === "agent";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {campaign?.nombre || "Campaign Details"}
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  {campaign?.id && <span>ID: {campaign.id}</span>}
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={
                campaign ? getStatusColor(campaign.isActive) : undefined
              }
            >
              {campaign?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Campaign Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Tag className="h-3.5 w-3.5" />
                          Type
                        </div>
                        <p className="text-sm font-medium">
                          {campaign
                            ? campaignTypeLabels[campaign.tipo] || "N/A"
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Duration
                        </div>
                        <p className="text-sm font-medium">
                          {campaign?.duracion || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building className="h-3.5 w-3.5" />
                          Yard
                        </div>
                        <p className="text-sm font-medium break-words">
                          {campaign ? getYardLabel(campaign) : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Ticket className="h-3.5 w-3.5" />
                          Tickets
                        </div>
                        <p className="text-sm font-medium">
                          {campaign?.ticketCount ?? tickets.length ?? 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {campaign?.id && !isAgent && (
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
                      <Link href={`/reports/campaigns?campaignId=${campaign.id}`}>
                        <FileText className="h-4 w-4" />
                        Open Report
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
