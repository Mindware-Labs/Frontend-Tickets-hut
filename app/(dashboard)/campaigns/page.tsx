"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Campaign, CampaignFormData, CampaignType, YardSummary } from "./types";
import { CampaignFormModal } from "./components/CampaignFormModal";
import { DeleteCampaignModal } from "./components/DeleteCampaignModal";
import { CampaignsPagination } from "./components/CampaignsPagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CampaignDetailsModal } from "./components/CampaignDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Megaphone,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useRole } from "@/components/providers/role-provider";
import { ShieldAlert } from "lucide-react";

type CampaignTicket = {
  id: number;
  status?: string | null;
  createdAt?: string;
  customer?: { name?: string | null };
  customerPhone?: string | null;
  campaignId?: number | null;
  campaign?: { id?: number | null };
};

const DEFAULT_FORM: CampaignFormData = {
  nombre: "",
  yardaId: undefined,
  duracion: "",
  tipo: "ONBOARDING",
  isActive: true,
};

const campaignTypeLabels: Record<CampaignType, string> = {
  ONBOARDING: "Onboarding",
  AR: "AR",
  OTHER: "Other",
};

export default function CampaignsPage() {
  const { isAdmin } = useRole();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [yards, setYards] = useState<YardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<CampaignType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [yardFilter, setYardFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [campaignTickets, setCampaignTickets] = useState<CampaignTicket[]>([]);
  const [showTicketsPanel, setShowTicketsPanel] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await fetchFromBackend("/campaign?page=1&limit=100");
      const items = Array.isArray(data) ? data : data?.data || [];
      setCampaigns(items);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchYards = async () => {
    try {
      const data = await fetchFromBackend("/yards");
      const items = Array.isArray(data) ? data : data?.data || [];
      setYards(items);
    } catch (error) {
      console.error("Error fetching yards:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchYards();
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const yardName =
        campaign.yarda?.name ||
        yards.find((yard) => yard.id === campaign.yardaId)?.name ||
        "";
      const matchesSearch =
        campaign.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        yardName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || campaign.tipo === typeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && campaign.isActive) ||
        (statusFilter === "inactive" && !campaign.isActive);
      const matchesYard =
        yardFilter === "all" ||
        campaign.yardaId?.toString() === yardFilter ||
        campaign.yarda?.id?.toString() === yardFilter;

      return matchesSearch && matchesType && matchesStatus && matchesYard;
    });
  }, [campaigns, searchTerm, typeFilter, statusFilter, yardFilter, yards]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, yardFilter]);

  const getStatusColor = (isActive: boolean) =>
    isActive
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-700 border-amber-500/20";

  const getDurationDays = (duration?: string | null) => {
    if (!duration) return null;
    const parsed = parseInt(duration, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const getProgress = (campaign: Campaign) => {
    const durationDays = getDurationDays(campaign.duracion);
    if (!durationDays) return null;
    const createdAt = new Date(campaign.createdAt);
    if (Number.isNaN(createdAt.getTime())) return null;
    const elapsedDays =
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.min(100, Math.max(0, Math.round((elapsedDays / durationDays) * 100)));
  };

  const getYardLabel = (campaign: Campaign) => {
    return (
      campaign.yarda?.name ||
      yards.find((yard) => yard.id === campaign.yardaId)?.name ||
      "No yard"
    );
  };

  const resetForm = () => setFormData(DEFAULT_FORM);
  const clearValidationErrors = () => setValidationErrors({});

  const handleCreate = () => {
    resetForm();
    clearValidationErrors();
    setShowCreateModal(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      nombre: campaign.nombre,
      yardaId: campaign.yardaId ?? undefined,
      duracion: campaign.duracion ?? "",
      tipo: campaign.tipo,
      isActive: campaign.isActive,
    });
    clearValidationErrors();
    setShowEditModal(true);
  };

  const handleDelete = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const handleDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
    setShowTicketsPanel(false);
    setTicketSearch("");
    setCampaignTickets([]);
  };

  const fetchTicketsForCampaign = async (campaignId: number) => {
    try {
      setTicketsLoading(true);
      const response = await fetchFromBackend("/tickets?page=1&limit=500");
      const items: CampaignTicket[] = response?.data || response || [];
      const filtered = items.filter(
        (ticket) =>
          ticket.campaignId === campaignId ||
          ticket.campaign?.id === campaignId,
      );
      setCampaignTickets(filtered);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setCampaignTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    const term = ticketSearch.toLowerCase();
    return campaignTickets.filter((ticket) => {
      const name = ticket.customer?.name?.toLowerCase() || "";
      const phone = (ticket.customerPhone || "").toLowerCase();
      const id = `#${ticket.id}`;
      return (
        name.includes(term) ||
        phone.includes(term) ||
        id.toLowerCase().includes(term)
      );
    });
  }, [campaignTickets, ticketSearch]);

  const buildPayload = (data: CampaignFormData) => ({
    ...data,
    yardaId: data.yardaId ?? undefined,
    duracion: data.duracion.trim() ? data.duracion.trim() : undefined,
  });

  const handleSubmitCreate = async () => {
    setValidationErrors({});
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim())
      errors.nombre = "Please enter the campaign name.";
    if (!formData.tipo)
      errors.tipo = "Please select a campaign type.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Missing fields",
        description: "Please review the highlighted fields and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchFromBackend("/campaign", {
        method: "POST",
        body: JSON.stringify(buildPayload(formData)),
      });

      toast({
        title: "Saved",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Campaign created successfully</span>
          </div>
        ),
      });

      setShowCreateModal(false);
      fetchCampaigns();
      resetForm();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create the campaign.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedCampaign) return;
    setValidationErrors({});
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim())
      errors.nombre = "Please enter the campaign name.";
    if (!formData.tipo)
      errors.tipo = "Please select a campaign type.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Missing fields",
        description: "Please review the highlighted fields and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchFromBackend(`/campaign/${selectedCampaign.id}`, {
        method: "PATCH",
        body: JSON.stringify(buildPayload(formData)),
      });

      toast({
        title: "Saved",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Campaign updated successfully</span>
          </div>
        ),
      });

      setShowEditModal(false);
      fetchCampaigns();
      resetForm();
      setSelectedCampaign(null);
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update the campaign.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (!selectedCampaign) return;

    try {
      setIsSubmitting(true);
      await fetchFromBackend(`/campaign/${selectedCampaign.id}`, {
        method: "DELETE",
      });

      toast({
        title: "Deleted",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Campaign deleted successfully</span>
          </div>
        ),
      });

      setShowDeleteModal(false);
      fetchCampaigns();
      setSelectedCampaign(null);
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the campaign.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to view marketing campaigns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage campaigns using real backend data
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or yard..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value: CampaignType | "all") =>
                setTypeFilter(value)
              }
            >
              <SelectTrigger className="h-10 w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                <SelectItem value="AR">AR</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "active" | "inactive") =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="h-10 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={yardFilter}
              onValueChange={(value) => setYardFilter(value)}
            >
              <SelectTrigger className="h-10 w-[200px]">
                <SelectValue placeholder="Yard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Yards</SelectItem>
                {yards.map((yard) => (
                  <SelectItem key={yard.id} value={yard.id.toString()}>
                    {yard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter("all");
                setStatusFilter("all");
                setYardFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading campaigns...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedCampaigns.map((campaign) => {
              const progress = getProgress(campaign);

              return (
                <Card
                  key={campaign.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">{campaign.nombre}</CardTitle>
                          <CardDescription className="text-xs font-mono">
                            ID #{campaign.id}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(campaign.isActive)} border`}
                      >
                        {campaign.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {progress === null ? "N/A" : `${progress}%`}
                        </span>
                      </div>
                      <Progress
                        value={progress ?? 0}
                        className={progress === null ? "h-2 opacity-50" : "h-2"}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-2xl font-bold">
                              {campaign.ticketCount ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total Tickets
                            </p>
                          </div>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="rounded-lg border p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {campaign.duracion || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
                        <div className="text-center">
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-500">
                            {campaignTypeLabels[campaign.tipo]}
                          </p>
                          <p className="text-xs font-medium text-blue-600/80 dark:text-blue-500/80">
                            Type
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/20">
                        <div className="text-center">
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500">
                            {getYardLabel(campaign)}
                          </p>
                          <p className="text-xs font-medium text-emerald-600/80 dark:text-emerald-500/80">
                            Yard
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                            Edit Campaign
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(campaign)}
                          >
                            Delete Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDetails(campaign)}
                      >
                        Details
                        <ArrowUpRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredCampaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">No campaigns found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search" : "Create a campaign to get started"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              )}
            </div>
          </div>
        )}

        {!loading && filteredCampaigns.length > 0 && (
          <CampaignsPagination
            totalCount={filteredCampaigns.length}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CampaignFormModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) clearValidationErrors();
        }}
        title="Create New Campaign"
        description="Fill in the details to create a new campaign"
        submitLabel="Create Campaign"
        isSubmitting={isSubmitting}
        formData={formData}
        onFormChange={setFormData}
        validationErrors={validationErrors}
        onValidationErrorChange={setValidationErrors}
        onSubmit={handleSubmitCreate}
        idPrefix="create"
        yards={yards}
      />

      <CampaignFormModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) clearValidationErrors();
        }}
        title="Edit Campaign"
        description="Update campaign details"
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        formData={formData}
        onFormChange={setFormData}
        validationErrors={validationErrors}
        onValidationErrorChange={setValidationErrors}
        onSubmit={handleSubmitEdit}
        idPrefix="edit"
        yards={yards}
      />

      <DeleteCampaignModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        campaignName={selectedCampaign?.nombre}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmitDelete}
      />

      <CampaignDetailsModal
        open={showDetailsModal}
        onOpenChange={(open) => {
          setShowDetailsModal(open);
          if (!open) {
            setShowTicketsPanel(false);
            setTicketSearch("");
            setCampaignTickets([]);
          }
        }}
        campaign={selectedCampaign}
        campaignTypeLabels={campaignTypeLabels}
        getStatusColor={getStatusColor}
        getYardLabel={getYardLabel}
        showTicketsPanel={showTicketsPanel}
        ticketsLoading={ticketsLoading}
        tickets={filteredTickets}
        ticketSearch={ticketSearch}
        setTicketSearch={setTicketSearch}
        onViewTickets={async () => {
          if (!selectedCampaign) return;
          if (!showTicketsPanel) {
            await fetchTicketsForCampaign(selectedCampaign.id);
          }
          setShowTicketsPanel(true);
        }}
      />
    </>
  );
}
