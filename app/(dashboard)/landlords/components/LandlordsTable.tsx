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
import { Building, Edit2, Mail, Phone, Trash2, User } from "lucide-react";
import { Landlord, YardOption } from "../types";

interface LandlordsTableProps {
  loading: boolean;
  landlords: Landlord[];
  totalFiltered: number;
  yards: YardOption[];
  onDetails: (landlord: Landlord) => void;
  onEdit: (landlord: Landlord) => void;
  onDelete: (landlord: Landlord) => void;
}

const getYardLabels = (landlord: Landlord, yards: YardOption[]) => {
  const fromRelation =
    landlord.yards?.map((yard) => yard.commonName || yard.name) || [];
  if (fromRelation.length > 0) return fromRelation;

  const fallback = yards
    .filter((yard) => yard.landlord?.id === landlord.id)
    .map((yard) => yard.commonName || yard.name);
  return fallback;
};

export function LandlordsTable({
  loading,
  landlords,
  totalFiltered,
  yards,
  onDetails,
  onEdit,
  onDelete,
}: LandlordsTableProps) {
  return (
    <div className="flex-1 rounded-lg border overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Yard</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                Loading...
              </TableCell>
            </TableRow>
          ) : totalFiltered === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No landlords found
              </TableCell>
            </TableRow>
          ) : (
            landlords.map((landlord) => {
              const yardCount = getYardLabels(landlord, yards).length;
              return (
                <TableRow
                  key={landlord.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onDetails(landlord)}
                >
                <TableCell className="font-medium">#{landlord.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {landlord.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {landlord.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {landlord.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1">
                    <Building className="h-3 w-3" />
                    {yardCount} yard{yardCount === 1 ? "" : "s"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(landlord);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(landlord);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
