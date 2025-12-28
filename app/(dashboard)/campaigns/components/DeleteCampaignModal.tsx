"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName?: string;
  ticketCount?: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function DeleteCampaignModal({
  open,
  onOpenChange,
  campaignName,
  ticketCount,
  isSubmitting,
  onConfirm,
}: DeleteCampaignModalProps) {
  const hasTickets = (ticketCount ?? 0) > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the campaign "{campaignName}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {hasTickets && (
          <p className="text-sm text-destructive">
            This campaign has {ticketCount} ticket(s) and cannot be deleted.
            Please deactivate the campaign instead.
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting || hasTickets}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
