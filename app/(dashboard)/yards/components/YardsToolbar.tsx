"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";

interface YardsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  totalCount: number;
}

export function YardsToolbar({
  search,
  onSearchChange,
  onRefresh,
  totalCount,
}: YardsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search yards..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" size="icon" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {totalCount} yard{totalCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
