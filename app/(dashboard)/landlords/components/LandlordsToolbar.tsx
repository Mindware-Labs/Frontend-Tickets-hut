"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Search } from "lucide-react";

interface LandlordsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate?: () => void;
  canCreate?: boolean;
  totalCount: number;
}

export function LandlordsToolbar({
  search,
  onSearchChange,
  onRefresh,
  onCreate,
  canCreate = true,
  totalCount,
}: LandlordsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search landlords..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" size="icon" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      {canCreate && onCreate && (
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Landlord
        </Button>
      )}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {totalCount} landlord{totalCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
