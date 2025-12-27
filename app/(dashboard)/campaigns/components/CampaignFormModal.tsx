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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignFormData, CampaignType, YardSummary } from "../types";

interface CampaignFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  isSubmitting: boolean;
  formData: CampaignFormData;
  onFormChange: (next: CampaignFormData) => void;
  validationErrors: Record<string, string>;
  onValidationErrorChange: (next: Record<string, string>) => void;
  onSubmit: () => void;
  idPrefix: string;
  yards: YardSummary[];
}

const campaignTypeLabels: Record<CampaignType, string> = {
  ONBOARDING: "Onboarding",
  AR: "AR",
  OTHER: "Other",
};

export function CampaignFormModal({
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
  idPrefix,
  yards,
}: CampaignFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-nombre`}>Name *</Label>
            <Input
              id={`${idPrefix}-nombre`}
              value={formData.nombre}
              onChange={(e) => {
                onFormChange({ ...formData, nombre: e.target.value });
                onValidationErrorChange({
                  ...validationErrors,
                  nombre: "",
                });
              }}
              className={validationErrors.nombre ? "border-red-500" : ""}
            />
            {validationErrors.nombre && (
              <p className="text-xs text-red-500">{validationErrors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-tipo`}>Type *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: CampaignType) =>
                  onFormChange({ ...formData, tipo: value })
                }
              >
                <SelectTrigger id={`${idPrefix}-tipo`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(campaignTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.tipo && (
                <p className="text-xs text-red-500">{validationErrors.tipo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-isActive`}>Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  onFormChange({
                    ...formData,
                    isActive: value === "active",
                  })
                }
              >
                <SelectTrigger id={`${idPrefix}-isActive`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-yardaId`}>Yard</Label>
              <Select
                value={formData.yardaId ? String(formData.yardaId) : "none"}
                onValueChange={(value) =>
                  onFormChange({
                    ...formData,
                    yardaId: value === "none" ? undefined : Number(value),
                  })
                }
              >
                <SelectTrigger id={`${idPrefix}-yardaId`}>
                  <SelectValue placeholder="Select a yard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No yard</SelectItem>
                  {yards.map((yard) => (
                    <SelectItem key={yard.id} value={String(yard.id)}>
                      {yard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.yardaId && (
                <p className="text-xs text-red-500">{validationErrors.yardaId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-duracion`}>Duration</Label>
              <Input
                id={`${idPrefix}-duracion`}
                value={formData.duracion}
                onChange={(e) =>
                  onFormChange({ ...formData, duracion: e.target.value })
                }
                placeholder="30 days"
              />
            </div>
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
