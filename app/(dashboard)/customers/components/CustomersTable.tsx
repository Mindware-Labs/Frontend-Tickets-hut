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
import { Edit2, Phone, Trash2, User } from "lucide-react";
import { Customer } from "../types";

interface CustomersTableProps {
  loading: boolean;
  customers: Customer[];
  totalFiltered: number;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  canManage?: boolean;
}

export function CustomersTable({
  loading,
  customers,
  totalFiltered,
  onEdit,
  onDelete,
  canManage = true,
}: CustomersTableProps) {
  return (
    <div className="flex-1 rounded-lg border overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Campaigns</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                Loading...
              </TableCell>
            </TableRow>
          ) : totalFiltered === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">#{customer.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {customer.name || "Unknown"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {customer.phone || "No phone"}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.campaigns && customer.campaigns.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {customer.campaigns.map((campaign) => (
                        <Badge
                          key={campaign.id}
                          variant="secondary"
                          className="shadow-none"
                        >
                          {campaign.nombre}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="outline" className="shadow-none">
                      No campaigns
                    </Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(customer)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
