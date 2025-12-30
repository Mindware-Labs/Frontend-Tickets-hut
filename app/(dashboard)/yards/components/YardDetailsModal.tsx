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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  MapPin,
  Phone,
  Link as LinkIcon,
  User,
  ExternalLink,
} from "lucide-react";
import type { Yard } from "../types";

type YardDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yard: Yard | null;
  showTicketsPanel: boolean;
  showLandlordPanel: boolean;
  ticketsLoading: boolean;
  tickets: any[];
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
  showTicketsPanel: _showTicketsPanel,
  showLandlordPanel,
  ticketsLoading: _ticketsLoading,
  tickets: _tickets,
  ticketSearch: _ticketSearch,
  setTicketSearch: _setTicketSearch,
  onViewTickets: _onViewTickets,
  onViewLandlord,
}: YardDetailsModalProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {yard?.commonName || yard?.name || "Yard Details"}
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  {yard?.name !== yard?.commonName && yard?.name && (
                    <span>{yard.name}</span>
                  )}
                  {yard?.id && <span className="ml-2">ID: {yard.id}</span>}
                </DialogDescription>
              </div>
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
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-4">
                <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building className="h-3.5 w-3.5" />
                      Type
                    </div>
                    <p className="text-sm font-medium">
                      {yard ? getTypeLabel(yard.yardType) : "N/A"}
                    </p>
                  </div>
                  {yard?.landlord && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        Landlord
                      </div>
                      <p className="text-sm font-medium truncate">
                        {yard.landlord.name || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
                {yard?.propertyAddress && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      Address
                    </div>
                    <p className="text-sm font-medium break-words">{yard.propertyAddress}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {yard?.contactInfo && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        Contact
                      </div>
                      <p className="text-sm font-medium break-words">{yard.contactInfo}</p>
                    </div>
                  )}
                  {yard?.yardLink && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Link
                      </div>
                      <a
                        href={yard.yardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1 break-all"
                      >
                        View Link
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
                </Card>

            {/* Action Buttons */}
            {yard?.landlord && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={showLandlordPanel ? "default" : "outline"}
                  onClick={onViewLandlord}
                  disabled={!yard}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  View Landlord
                </Button>
              </div>
            )}

                {/* Landlord Panel */}
                {showLandlordPanel && yard?.landlord && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Landlord Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Name</p>
                          <p className="text-sm font-medium">
                            {yard.landlord.name || "N/A"}
                          </p>
                        </div>
                        {(yard.landlord.id || yard.landlordId) && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Landlord ID
                            </p>
                            <p className="text-sm font-medium">
                              {yard.landlord.id ?? yard.landlordId ?? "N/A"}
                            </p>
                          </div>
                        )}
                        {yard.landlord.email && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="text-sm font-medium break-words">{yard.landlord.email}</p>
                          </div>
                        )}
                        {yard.landlord.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Phone</p>
                            <p className="text-sm font-medium">{yard.landlord.phone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
