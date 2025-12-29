"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface YardsFiltersProps {
  typeFilter: string;
  statusFilter: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreate?: () => void;
  canCreate?: boolean;
}

export function YardsFilters({
  typeFilter,
  statusFilter,
  onTypeChange,
  onStatusChange,
  onCreate,
  canCreate = true,
}: YardsFiltersProps) {
  return (
    <div className="w-52 flex-shrink-0 space-y-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Yards</h1>
        <p className="text-xs text-muted-foreground">Manage all yards</p>
      </div>

      {canCreate && onCreate && (
        <Button onClick={onCreate} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Yard
        </Button>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold">Filters</h3>

        <div className="space-y-1.5">
          <Label className="text-xs">Type</Label>
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="SAAS">SaaS</SelectItem>
              <SelectItem value="FULL_SERVICE">Full Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
