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
import Link from "next/link";
import type { Landlord, YardOption } from "../types";
import { useRole } from "@/components/providers/role-provider";

interface LandlordDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landlord: Landlord | null;
  yards: YardOption[];
}

const getYardLabels = (landlord: Landlord | null, yards: YardOption[]) => {
  if (!landlord) return [];
  const fromRelation = landlord.yards?.map((yard) => yard.name) || [];
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
}: LandlordDetailsModalProps) {
  const { role } = useRole();
  const isAgent = role?.toString().toLowerCase() === "agent";
  const yardLabels = getYardLabels(landlord, yards);

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
                yardLabels.map((label, index) => (
                  <Badge
                    key={`${label}-${index}`}
                    variant="outline"
                    className="gap-1"
                  >
                    <Building className="h-3 w-3" />
                    {label}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {landlord?.id && !isAgent && (
            <div className="rounded-lg border p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Reports</h3>
                <p className="text-xs text-muted-foreground">
                  Open the detailed landlord report page.
                </p>
              </div>
              <Button asChild>
                <Link href={`/reports/landlords?landlordId=${landlord.id}`}>
                  Open Report
                </Link>
              </Button>
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
