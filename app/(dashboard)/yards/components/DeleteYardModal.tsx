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

interface DeleteYardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yardName?: string;
  ticketCount?: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function DeleteYardModal({
  open,
  onOpenChange,
  yardName,
  ticketCount,
  isSubmitting,
  onConfirm,
}: DeleteYardModalProps) {
  const hasTickets = (ticketCount ?? 0) > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the yard "{yardName}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {hasTickets && (
          <p className="text-sm text-destructive">
            This yard has {ticketCount} ticket(s) and cannot be deleted. Please
            deactivate the yard instead.
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
