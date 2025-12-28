"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  CheckCircle2,
  Edit2,
  MapPin,
  Phone,
  Trash2,
  XCircle,
} from "lucide-react";
import { Yard } from "../types";

interface YardsTableProps {
  loading: boolean;
  yards: Yard[];
  totalFiltered: number;
  onDetails: (yard: Yard) => void;
  onEdit: (yard: Yard) => void;
  onDelete: (yard: Yard) => void;
}

const getTypeBadge = (type: Yard["yardType"]) => {
  return type === "SAAS" ? (
    <Badge variant="default" className="bg-blue-500">
      SaaS
    </Badge>
  ) : (
    <Badge variant="secondary">Full Service</Badge>
  );
};

export function YardsTable({
  loading,
  yards,
  totalFiltered,
  onDetails,
  onEdit,
  onDelete,
}: YardsTableProps) {
  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Common Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                Loading...
              </TableCell>
            </TableRow>
          ) : totalFiltered === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                No yards found
              </TableCell>
            </TableRow>
          ) : (
            yards.map((yard) => (
              <TableRow
                key={yard.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onDetails(yard)}
              >
                <TableCell className="font-medium">#{yard.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {yard.name}
                  </div>
                </TableCell>
                <TableCell>{yard.commonName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-xs truncate">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{yard.propertyAddress}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {yard.contactInfo}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(yard.yardType)}</TableCell>
                <TableCell>
                  {yard.isActive ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(yard);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(yard);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
