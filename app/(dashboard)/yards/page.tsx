"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Building,
  Phone,
  Mail,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { fetchFromBackend } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

interface Yard {
  id: number;
  name: string;
  commonName: string;
  propertyAddress: string;
  contactInfo: string;
  yardLink?: string;
  notes?: string;
  yardType: "SAAS" | "FULL_SERVICE";
  isActive: boolean;
}

export default function YardsPage() {
  const [yards, setYards] = useState<Yard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedYard, setSelectedYard] = useState<Yard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    commonName: "",
    propertyAddress: "",
    contactInfo: "",
    yardLink: "",
    notes: "",
    yardType: "SAAS" as "SAAS" | "FULL_SERVICE",
    isActive: true,
  });

  // Fetch yards from backend
  const fetchYards = async () => {
    try {
      setLoading(true);
      const data = await fetchFromBackend("/yards");
      setYards(data);
    } catch (error) {
      console.error("Error fetching yards:", error);
      toast({
        title: "Error",
        description: "Failed to load yards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYards();
  }, []);

  // Filter yards
  const filteredYards = useMemo(() => {
    return yards.filter((yard) => {
      const matchesSearch =
        yard.name.toLowerCase().includes(search.toLowerCase()) ||
        yard.commonName.toLowerCase().includes(search.toLowerCase()) ||
        yard.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
        yard.contactInfo.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || yard.yardType === typeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && yard.isActive) ||
        (statusFilter === "inactive" && !yard.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [yards, search, typeFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      name: "",
      commonName: "",
      propertyAddress: "",
      contactInfo: "",
      yardLink: "",
      notes: "",
      yardType: "SAAS",
      isActive: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (yard: Yard) => {
    setSelectedYard(yard);
    setFormData({
      name: yard.name,
      commonName: yard.commonName,
      propertyAddress: yard.propertyAddress,
      contactInfo: yard.contactInfo,
      yardLink: yard.yardLink || "",
      notes: yard.notes || "",
      yardType: yard.yardType,
      isActive: yard.isActive,
    });
    setShowEditModal(true);
  };

  const handleDelete = (yard: Yard) => {
    setSelectedYard(yard);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async () => {
    try {
      setIsSubmitting(true);
      await fetchFromBackend("/yards", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast({
        title: "Success",
        description: "Yard created successfully",
      });

      setShowCreateModal(false);
      fetchYards();
      resetForm();
    } catch (error) {
      console.error("Error creating yard:", error);
      toast({
        title: "Error",
        description: "Failed to create yard",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedYard) return;

    try {
      setIsSubmitting(true);
      await fetchFromBackend(`/yards/${selectedYard.id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });

      toast({
        title: "Success",
        description: "Yard updated successfully",
      });

      setShowEditModal(false);
      fetchYards();
      resetForm();
      setSelectedYard(null);
    } catch (error) {
      console.error("Error updating yard:", error);
      toast({
        title: "Error",
        description: "Failed to update yard",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (!selectedYard) return;

    try {
      setIsSubmitting(true);
      await fetchFromBackend(`/yards/${selectedYard.id}`, {
        method: "DELETE",
      });

      toast({
        title: "Success",
        description: "Yard deleted successfully",
      });

      setShowDeleteModal(false);
      fetchYards();
      setSelectedYard(null);
    } catch (error) {
      console.error("Error deleting yard:", error);
      toast({
        title: "Error",
        description: "Failed to delete yard",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "SAAS" ? (
      <Badge variant="default" className="bg-blue-500">
        SaaS
      </Badge>
    ) : (
      <Badge variant="secondary">Full Service</Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yards</h1>
          <p className="text-muted-foreground">
            Manage all yards in the system
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Yard
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search yards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="SAAS">SaaS</SelectItem>
                <SelectItem value="FULL_SERVICE">Full Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredYards.length} yard
              {filteredYards.length !== 1 ? "s" : ""} found
            </div>
            <Button variant="outline" size="sm" onClick={fetchYards}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
              ) : filteredYards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No yards found
                  </TableCell>
                </TableRow>
              ) : (
                filteredYards.map((yard) => (
                  <TableRow key={yard.id}>
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
                          onClick={() => handleEdit(yard)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(yard)}
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
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Yard</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new yard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="278 Ellis Road"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commonName">Common Name *</Label>
                <Input
                  id="commonName"
                  value={formData.commonName}
                  onChange={(e) =>
                    setFormData({ ...formData, commonName: e.target.value })
                  }
                  placeholder="Parking Kingdom Jacksonville"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Address *</Label>
              <Input
                id="propertyAddress"
                value={formData.propertyAddress}
                onChange={(e) =>
                  setFormData({ ...formData, propertyAddress: e.target.value })
                }
                placeholder="278 Ellis Rd N, Jacksonville, FL 32254"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info *</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) =>
                  setFormData({ ...formData, contactInfo: e.target.value })
                }
                placeholder="904-265-9233"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yardLink">Yard Link</Label>
              <Input
                id="yardLink"
                value={formData.yardLink}
                onChange={(e) =>
                  setFormData({ ...formData, yardLink: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yardType">Type *</Label>
                <Select
                  value={formData.yardType}
                  onValueChange={(value: "SAAS" | "FULL_SERVICE") =>
                    setFormData({ ...formData, yardType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAAS">SaaS</SelectItem>
                    <SelectItem value="FULL_SERVICE">Full Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Yard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Yard</DialogTitle>
            <DialogDescription>Modify the yard details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-commonName">Common Name *</Label>
                <Input
                  id="edit-commonName"
                  value={formData.commonName}
                  onChange={(e) =>
                    setFormData({ ...formData, commonName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-propertyAddress">Address *</Label>
              <Input
                id="edit-propertyAddress"
                value={formData.propertyAddress}
                onChange={(e) =>
                  setFormData({ ...formData, propertyAddress: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactInfo">Contact Info *</Label>
              <Input
                id="edit-contactInfo"
                value={formData.contactInfo}
                onChange={(e) =>
                  setFormData({ ...formData, contactInfo: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-yardLink">Yard Link</Label>
              <Input
                id="edit-yardLink"
                value={formData.yardLink}
                onChange={(e) =>
                  setFormData({ ...formData, yardLink: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-yardType">Type *</Label>
                <Select
                  value={formData.yardType}
                  onValueChange={(value: "SAAS" | "FULL_SERVICE") =>
                    setFormData({ ...formData, yardType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAAS">SaaS</SelectItem>
                    <SelectItem value="FULL_SERVICE">Full Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the yard "{selectedYard?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
