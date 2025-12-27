"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit2,
  FileText,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { PaginationFooter } from "@/components/common/pagination-footer";

interface PolicyItem {
  id: number;
  name: string;
  description: string;
  fileUrl?: string;
  date?: string;
}

interface PolicyFormState {
  name: string;
  description: string;
  file: File | null;
}

const initialForm: PolicyFormState = {
  name: "",
  description: "",
  file: null,
};

export default function PoliciesPage() {
  const [search, setSearch] = useState("");
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activePolicy, setActivePolicy] = useState<PolicyItem | null>(null);
  const [formState, setFormState] = useState<PolicyFormState>(initialForm);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PolicyItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/policies?page=1&limit=200");
      const result = await response.json();
      if (result?.success) {
        setPolicies(result.data || []);
      } else {
        setPolicies([]);
      }
    } catch (error) {
      console.error("Failed to load policies", error);
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const resetForm = () => {
    setFormState(initialForm);
    setValidationErrors({});
    setActivePolicy(null);
  };

  const openCreate = () => {
    setFormMode("create");
    resetForm();
    setShowForm(true);
  };

  const openEdit = (policy: PolicyItem) => {
    setFormMode("edit");
    setActivePolicy(policy);
    setFormState({
      name: policy.name,
      description: policy.description || "",
      file: null,
    });
    setValidationErrors({});
    setShowForm(true);
  };

  const getDownloadUrl = (policy: PolicyItem) => {
    if (!policy.fileUrl) return null;
    return `${apiBase}/policies/${policy.id}/download`;
  };

  const getFileName = (fileUrl?: string) => {
    if (!fileUrl) return "No file";
    const parts = fileUrl.split("/");
    return parts[parts.length - 1] || "file";
  };

  const filteredPolicies = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? policies.filter((policy) => policy.name.toLowerCase().includes(term))
      : policies;
    return [...list].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [policies, search]);

  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPolicies, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, policies]);

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) {
      errors.name = "Name is required";
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append("name", formState.name.trim());
      payload.append("description", formState.description.trim());
      if (formState.file) {
        payload.append("file", formState.file);
      }

      const url =
        formMode === "create"
          ? "/api/policies"
          : `/api/policies/${activePolicy?.id}`;
      const method = formMode === "create" ? "POST" : "PATCH";
      const response = await fetch(url, {
        method,
        body: payload,
      });
      const result = await response.json();

      if (result?.success) {
        toast({
          title: "Success",
          description:
            formMode === "create"
              ? "Policy created successfully"
              : "Policy updated successfully",
        });
        setShowForm(false);
        resetForm();
        await fetchPolicies();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to save policy",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Policy save error", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the policy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (policy: PolicyItem) => {
    if (!policy) return;
    try {
      const response = await fetch(`/api/policies/${policy.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result?.success) {
        toast({
          title: "Deleted",
          description: "Policy removed successfully",
        });
        await fetchPolicies();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to delete policy",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete policy error", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the policy",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (policy: PolicyItem) => {
    setDeleteTarget(policy);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await handleDelete(deleteTarget);
    closeDeleteDialog();
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Rig Hut Policies
          </h1>
          <p className="text-muted-foreground text-sm">
            Legal documentation and official regulations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              className="pl-9 bg-card border-border focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Policy
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading policies...
        </div>
      ) : filteredPolicies.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/40">
          <CardContent className="py-10 text-center text-muted-foreground">
            No policies found. Create a new policy to get started.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPolicies.map((policy) => {
              const downloadUrl = getDownloadUrl(policy);
              return (
                <Card
                  key={policy.id}
                  className="bg-card border-border hover:border-primary/50 transition-all group"
                >
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                    <div className="p-2 rounded-lg bg-muted text-primary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-foreground leading-tight">
                        {policy.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        {policy.fileUrl
                          ? getFileName(policy.fileUrl)
                          : "No attachment"}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {policy.description || "No description provided."}
                    </p>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => openEdit(policy)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        if (downloadUrl) {
                          window.open(downloadUrl, "_blank");
                        }
                      }}
                      disabled={!downloadUrl}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => openDeleteDialog(policy)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <PaginationFooter
            totalCount={filteredPolicies.length}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
            itemLabel="policies"
          />
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add Policy" : "Edit Policy"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Create a new policy document with optional attachment."
                : "Update the selected policy details and file."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Name *</Label>
              <Input
                id="policy-name"
                value={formState.name}
                onChange={(event) => {
                  setFormState({ ...formState, name: event.target.value });
                  setValidationErrors({ ...validationErrors, name: "" });
                }}
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                value={formState.description}
                onChange={(event) => {
                  setFormState({
                    ...formState,
                    description: event.target.value,
                  });
                }}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload files</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="policy-file"
                  type="file"
                  className="sr-only"
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      file: event.target.files?.[0] || null,
                    })
                  }
                />
                <Button asChild variant="outline" size="sm">
                  <Label htmlFor="policy-file" className="cursor-pointer">
                    Choose files
                  </Label>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {formState.file ? "1 file selected" : "No files selected"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formState.file ? (
                  <Badge
                    variant="secondary"
                    className="pl-3 pr-1 py-1 gap-2 group"
                  >
                    <span className="truncate max-w-[200px]">
                      {formState.file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-transparent"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          file: null,
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No files selected
                  </p>
                )}
              </div>
              {formMode === "edit" &&
                activePolicy?.fileUrl &&
                !formState.file && (
                  <p className="text-xs text-muted-foreground">
                    Current file: {getFileName(activePolicy.fileUrl)}
                  </p>
                )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : formMode === "create" ? (
                "Create Policy"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete policy</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove "${deleteTarget.name}".`
                : "This will permanently remove the selected policy."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
