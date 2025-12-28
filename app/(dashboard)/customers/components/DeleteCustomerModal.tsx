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

interface DeleteCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
  ticketCount?: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function DeleteCustomerModal({
  open,
  onOpenChange,
  customerName,
  ticketCount,
  isSubmitting,
  onConfirm,
}: DeleteCustomerModalProps) {
  const hasTickets = (ticketCount ?? 0) > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the customer "{customerName}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {hasTickets && (
          <p className="text-sm text-destructive">
            This customer has {ticketCount} ticket(s) and cannot be deleted.
            Please archive the customer instead.
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
