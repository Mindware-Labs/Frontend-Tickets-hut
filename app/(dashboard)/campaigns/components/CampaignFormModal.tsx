"use client";

import { useState } from "react"; // 1. Importar useState para controlar el popover
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
// 2. Importar componentes para el Combobox (Buscador)
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react"; // Iconos necesarios
import { cn } from "@/lib/utils"; // Utilidad para combinar clases
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
  // 3. Estado local para controlar si el buscador de yards está abierto o cerrado
  const [openYardCombobox, setOpenYardCombobox] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-visible"> 
        {/* Nota: overflow-y-visible ayuda a que el popover no se corte si el modal es pequeño */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* --- NAME INPUT --- */}
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
              className={`w-full truncate ${
                validationErrors.nombre ? "border-red-500" : ""
              }`}
            />
            {validationErrors.nombre && (
              <p className="text-xs text-red-500">{validationErrors.nombre}</p>
            )}
          </div>

          {/* --- TYPE SELECT & STATUS SELECT --- */}
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
            
            {/* --- YARD COMBOBOX (SEARCHABLE) --- */}
            <div className="space-y-2 flex flex-col">
              <Label htmlFor={`${idPrefix}-yardaId`}>Yard</Label>
              <Popover open={openYardCombobox} onOpenChange={setOpenYardCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    id={`${idPrefix}-yardaId`}
                    variant="outline"
                    role="combobox"
                    aria-expanded={openYardCombobox}
                    className={cn(
                      "w-full justify-between font-normal", // font-normal para que parezca un input
                      !formData.yardaId && "text-muted-foreground",
                      validationErrors.yardaId && "border-red-500"
                    )}
                  >
                    {formData.yardaId
                      ? yards.find((yard) => yard.id === formData.yardaId)?.name
                      : "Select a yard..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search yard..." />
                    <CommandList>
                      <CommandEmpty>No yard found.</CommandEmpty>
                      <CommandGroup>
                        {/* Opción para "No yard" / Limpiar selección */}
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            onFormChange({ ...formData, yardaId: undefined });
                            setOpenYardCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.yardaId ? "opacity-100" : "opacity-0"
                            )}
                          />
                          No yard
                        </CommandItem>
                        
                        {/* Lista de Yards */}
                        {yards.map((yard) => (
                          <CommandItem
                            key={yard.id}
                            value={yard.name} // Importante para que el filtro funcione por nombre
                            onSelect={() => {
                              onFormChange({ ...formData, yardaId: yard.id });
                              setOpenYardCombobox(false);
                              // Limpiar error si existe
                              if (validationErrors.yardaId) {
                                onValidationErrorChange({
                                    ...validationErrors,
                                    yardaId: "",
                                });
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.yardaId === yard.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {yard.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {validationErrors.yardaId && (
                <p className="text-xs text-red-500">
                  {validationErrors.yardaId}
                </p>
              )}
            </div>

            {/* --- DURATION INPUT --- */}
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-duracion`}>
                Duration (Optional)
              </Label>
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