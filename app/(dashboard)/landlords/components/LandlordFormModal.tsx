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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LandlordFormData, YardOption } from "../types";

interface LandlordFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  isSubmitting: boolean;
  formData: LandlordFormData;
  onFormChange: (next: LandlordFormData) => void;
  validationErrors: Record<string, string>;
  onValidationErrorChange: (next: Record<string, string>) => void;
  onSubmit: () => void;
  yards: YardOption[];
  idPrefix: string;
}

export function LandlordFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isSubmitting,
  formData,
  onFormChange,
  validationErrors,
  onValidationErrorChange,
  onSubmit,
  yards,
  idPrefix,
}: LandlordFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-name`}>Name *</Label>
              <Input
                id={`${idPrefix}-name`}
                value={formData.name}
                onChange={(e) => {
                  onFormChange({ ...formData, name: e.target.value });
                  onValidationErrorChange({ ...validationErrors, name: "" });
                }}
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-phone`}>Phone *</Label>
              <Input
                id={`${idPrefix}-phone`}
                value={formData.phone}
                onChange={(e) => {
                  onFormChange({ ...formData, phone: e.target.value });
                  onValidationErrorChange({ ...validationErrors, phone: "" });
                }}
                className={validationErrors.phone ? "border-red-500" : ""}
              />
              {validationErrors.phone && (
                <p className="text-xs text-red-500">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-email`}>Email *</Label>
            <Input
              id={`${idPrefix}-email`}
              value={formData.email}
              onChange={(e) => {
                onFormChange({ ...formData, email: e.target.value });
                onValidationErrorChange({ ...validationErrors, email: "" });
              }}
              className={validationErrors.email ? "border-red-500" : ""}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Yards *</Label>
            <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto">
              {yards.length === 0 ? (
                <p className="text-xs text-muted-foreground">No yards available</p>
              ) : (
                yards.map((yard) => {
                  const value = yard.id.toString();
                  const checked = formData.yardIds.includes(value);
                  return (
                    <label
                      key={yard.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          const isChecked = Boolean(next);
                          const yardIds = isChecked
                            ? [...formData.yardIds, value]
                            : formData.yardIds.filter((id) => id !== value);
                          onFormChange({ ...formData, yardIds });
                          onValidationErrorChange({
                            ...validationErrors,
                            yardIds: "",
                          });
                        }}
                      />
                      <span>{yard.commonName || yard.name}</span>
                    </label>
                  );
                })
              )}
            </div>
            {validationErrors.yardIds && (
              <p className="text-xs text-red-500">{validationErrors.yardIds}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? `${submitLabel}...` : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
