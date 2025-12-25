'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  Edit2,
  FileBox,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface KnowledgeGuide {
  id: number;
  name: string;
  description: string;
  fileUrl?: string;
  date?: string;
}

interface GuideFormState {
  name: string;
  description: string;
  file: File | null;
}

const initialForm: GuideFormState = {
  name: "",
  description: "",
  file: null,
};

export default function GuidesPage() {
  const [guides, setGuides] = useState<KnowledgeGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeGuide, setActiveGuide] = useState<KnowledgeGuide | null>(null);
  const [formState, setFormState] = useState<GuideFormState>(initialForm);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeGuide | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchGuides = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/knowledge?page=1&limit=200");
      const result = await response.json();
      if (result?.success) {
        setGuides(result.data || []);
      } else {
        setGuides([]);
      }
    } catch (error) {
      console.error("Failed to load guides", error);
      setGuides([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const resetForm = () => {
    setFormState(initialForm);
    setValidationErrors({});
    setActiveGuide(null);
  };

  const openCreate = () => {
    setFormMode("create");
    resetForm();
    setShowForm(true);
  };

  const openEdit = (guide: KnowledgeGuide) => {
    setFormMode("edit");
    setActiveGuide(guide);
    setFormState({
      name: guide.name,
      description: guide.description,
      file: null,
    });
    setValidationErrors({});
    setShowForm(true);
  };

  const getDownloadUrl = (guide: KnowledgeGuide) => {
    if (!guide.fileUrl) return null;
    return `${apiBase}/knowledge/${guide.id}/download`;
  };

  const getFileName = (fileUrl?: string) => {
    if (!fileUrl) return "No file";
    const parts = fileUrl.split("/");
    return parts[parts.length - 1] || "file";
  };

  const formTitle = formMode === "create" ? "Add Guide" : "Edit Guide";
  const formDescription =
    formMode === "create"
      ? "Create a new operational guide with optional attachment."
      : "Update the selected guide details and file.";

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formState.description.trim()) {
      errors.description = "Description is required";
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
          ? "/api/knowledge"
          : `/api/knowledge/${activeGuide?.id}`;
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
              ? "Guide created successfully"
              : "Guide updated successfully",
        });
        setShowForm(false);
        resetForm();
        await fetchGuides();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to save guide",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Guide save error", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the guide",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (guide: KnowledgeGuide) => {
    if (!guide) return;
    try {
      const response = await fetch(`/api/knowledge/${guide.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result?.success) {
        toast({
          title: "Deleted",
          description: "Guide removed successfully",
        });
        await fetchGuides();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to delete guide",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete guide error", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the guide",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (guide: KnowledgeGuide) => {
    setDeleteTarget(guide);
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

  const sortedGuides = useMemo(() => {
    return [...guides].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [guides]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Operational Guides
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Handbooks, tutoriales e instrucciones operativas para agentes.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Guide
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading guides...
        </div>
      ) : sortedGuides.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/40">
          <CardContent className="py-10 text-center text-muted-foreground">
            No guides yet. Create the first one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGuides.map((guide) => {
            const downloadUrl = getDownloadUrl(guide);
            return (
              <Card
                key={guide.id}
                className="bg-card border-border hover:border-primary/50 transition-all group"
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <div className="p-2 rounded-lg bg-muted text-primary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <FileBox className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base text-foreground leading-tight">
                      {guide.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {guide.fileUrl ? getFileName(guide.fileUrl) : "No attachment"}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {guide.description}
                  </p>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => openEdit(guide)}
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
                    onClick={() => openDeleteDialog(guide)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formTitle}</DialogTitle>
            <DialogDescription>{formDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guide-name">Name *</Label>
              <Input
                id="guide-name"
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
              <Label htmlFor="guide-description">Description *</Label>
              <Textarea
                id="guide-description"
                value={formState.description}
                onChange={(event) => {
                  setFormState({ ...formState, description: event.target.value });
                  setValidationErrors({ ...validationErrors, description: "" });
                }}
                rows={5}
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && (
                <p className="text-xs text-red-500">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guide-file">Attachment</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="guide-file"
                  type="file"
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      file: event.target.files?.[0] || null,
                    })
                  }
                />
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
              </div>
              {formMode === "edit" && activeGuide?.fileUrl && !formState.file && (
                <p className="text-xs text-muted-foreground">
                  Current file: {getFileName(activeGuide.fileUrl)}
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
                "Create Guide"
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
            <DialogTitle>Delete guide</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove "${deleteTarget.name}".`
                : "This will permanently remove the selected guide."}
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
