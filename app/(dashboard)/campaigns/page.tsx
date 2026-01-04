"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useRole } from "@/components/providers/role-provider";
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
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  ShieldAlert,
  Tag,
  Ticket,
  Megaphone,
} from "lucide-react";

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
  const { role } = useRole();
  const normalizedRole = role?.toString().toLowerCase();
  const isAgent = normalizedRole === "agent";
  const canManage = !isAgent;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [yards, setYards] = useState<YardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<CampaignType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [yardFilter, setYardFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
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

  // Close all modals when route changes
  const pathname = usePathname();
  useEffect(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
  }, [pathname]);

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
          ticket.campaignId === campaignId || ticket.campaign?.id === campaignId
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
    if (!formData.tipo) errors.tipo = "Please select a campaign type.";

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
    if (!formData.tipo) errors.tipo = "Please select a campaign type.";

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

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-primary" /> Campaigns
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your communication initiatives.
            </p>
          </div>
          {canManage && (
            <Button
              className="bg-primary hover:bg-primary/90 shadow-sm gap-2"
              onClick={handleCreate}
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          )}
        </div>

        {/* Filters Section */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or yard..."
              className="pl-9 bg-card border-border/60 focus-visible:ring-primary"
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
              <SelectTrigger className="h-10 w-[160px] bg-card border-border/60">
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
              <SelectTrigger className="h-10 w-[150px] bg-card border-border/60">
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
              <SelectTrigger className="h-10 w-[200px] bg-card border-border/60">
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
              className="border-border/60"
              onClick={() => {
                setTypeFilter("all");
                setStatusFilter("all");
                setYardFilter("all");
                setSearchTerm("");
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            {/* Simple visual loader placeholder or real spinner */}
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p>Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 bg-muted/5">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Megaphone className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No campaigns found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm text-center">
              {searchTerm
                ? "Try adjusting your search terms or filters."
                : "Get started by creating your first campaign to track customer interactions."}
            </p>
            {!searchTerm && canManage && (
              <Button className="mt-6" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="group relative flex flex-col justify-between overflow-hidden border border-border/60 bg-gradient-to-b from-card to-card/50 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20"
              >
                {/* Active Indicator Strip */}
                {campaign.isActive && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 opacity-80" />
                )}

                <CardHeader className="pb-4 pt-5 pl-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Title & Status Pulse */}
                      <div className="flex items-center gap-2">
                        <CardTitle className="truncate text-lg font-bold tracking-tight text-foreground/90">
                          {campaign.nombre}
                        </CardTitle>
                        {campaign.isActive ? (
                          <span
                            className="relative flex h-2.5 w-2.5 shrink-0"
                            title="Active"
                          >
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                          </span>
                        ) : (
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground/30"
                            title="Inactive"
                          />
                        )}
                      </div>

                      {/* ID & Date */}
                      <CardDescription className="flex items-center gap-2 text-xs font-medium">
                        <span className="font-mono text-primary/70 bg-primary/5 px-1.5 rounded-sm">
                          #{campaign.id}
                        </span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="flex items-center gap-1 text-muted-foreground truncate">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(campaign.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </CardDescription>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground data-[state=open]:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Manage Campaign</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDetails(campaign)}
                        >
                          <ArrowUpRight className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleEdit(campaign)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                              Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(campaign)}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pb-6 pl-7 pr-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-3 border border-border/30">
                    {/* Tickets Column */}
                    <div className="space-y-0.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Ticket className="h-3 w-3" />
                        Tickets
                      </span>
                      <p className="text-2xl font-bold tracking-tight text-foreground">
                        {campaign.ticketCount ?? 0}
                      </p>
                    </div>

                    {/* Duration Column */}
                    <div className="space-y-0.5 border-l border-border/40 pl-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        Duration
                      </span>
                      <p className="text-lg font-semibold tracking-tight text-foreground truncate mt-1">
                        {campaign.duracion || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 text-blue-700 border-blue-200/40 hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/40 transition-colors"
                    >
                      <Tag className="h-3 w-3" />
                      {campaignTypeLabels[campaign.tipo]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/5 text-orange-700 border-orange-200/40 hover:bg-orange-500/10 dark:text-orange-400 dark:border-orange-900/40 transition-colors"
                    >
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">
                        {getYardLabel(campaign)}
                      </span>
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="border-t bg-muted/30 px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group/btn w-full justify-between h-auto py-2 px-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-background/80"
                    onClick={() => handleDetails(campaign)}
                  >
                    View Full Report
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
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

      {/* MODALS */}
      {canManage && (
        <>
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
            ticketCount={selectedCampaign?.ticketCount}
            isSubmitting={isSubmitting}
            onConfirm={handleSubmitDelete}
          />
        </>
      )}

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
