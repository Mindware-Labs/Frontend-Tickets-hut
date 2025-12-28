"use client";

import { useState, useMemo, useEffect, JSX } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { fetchFromBackend } from "@/lib/api-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Plus,
  AlertCircle,
  Inbox,
  User,
  Hash,
  Star,
  Archive,
  SlidersHorizontal,
  PhoneOutgoing,
  PhoneIncoming,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Download,
  X,
  FileText,
  Edit2,
  Save,
  Calendar,
  Clock,
  CheckCircle,
  Tag,
  MessageCircle,
  Users,
  Sparkles,
  Building,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Ticket } from "@/lib/mock-data";
import {
  AgentOption,
  CallDirection,
  CampaignOption,
  CreateTicketFormData,
  CustomerOption,
  ManagementType,
  TicketDisposition,
  YardOption,
} from "./types";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { TicketDetailsFields } from "./components/TicketDetailsFields";

// Extend the Ticket type
declare module "@/lib/mock-data" {
  interface Ticket {
    issueDetail?: string;
    yardId?: string;
    yardType?: string;
    campaignId?: number;
    customer?: { name: string; phone?: string };
    customerPhone?: string;
    disposition?: string;
    onboardingOption?: string;
    attachments?: string[];
  }
}

export enum OnboardingOption {
  NOT_REGISTER = "NOT_REGISTERED",
  REGISTER = "REGISTERED",
  PAID_WITH_LL = "PAID_WITH_LL",
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EMERGENCY = "EMERGENCY",
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedYardId, setSelectedYardId] = useState<string>("");
  const [isAssigningYard, setIsAssigningYard] = useState(false);
  const [isIssueDetailEditing, setIsIssueDetailEditing] = useState(false);
  const [wasIssueDetailFilled, setWasIssueDetailFilled] = useState(false);
  const [yardSearch, setYardSearch] = useState("");
  const [yardCategory, setYardCategory] = useState<string>("all");
  const [yards, setYards] = useState<YardOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createValidationErrors, setCreateValidationErrors] = useState<
    Record<string, string>
  >({});
  const [newAttachment, setNewAttachment] = useState("");
  const [createAttachmentFiles, setCreateAttachmentFiles] = useState<File[]>(
    []
  );
  const [customerSearchCreate, setCustomerSearchCreate] = useState("");
  const [yardSearchCreate, setYardSearchCreate] = useState("");
  const [agentSearchCreate, setAgentSearchCreate] = useState("");
  const [campaignSearchCreate, setCampaignSearchCreate] = useState("");
  const [campaignSearchEdit, setCampaignSearchEdit] = useState("");
  const [createFormData, setCreateFormData] = useState<CreateTicketFormData>({
    customerId: "",
    customerPhone: "",
    yardId: "",
    campaignId: "",
    onboardingOption: "",
    agentId: "",
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.LOW,
    direction: CallDirection.INBOUND,
    callDate: "",
    disposition: "",
    issueDetail: "",
    attachments: [] as string[],
  });

  // State for updating ticket
  const [isUpdating, setIsUpdating] = useState(false);

  // Add campaign to the edit state
  const [editData, setEditData] = useState<{
    disposition?: string;
    issueDetail?: string;
    onboardingOption?: string;
    status?: string;
    priority?: string;
    attachments?: string[];
    campaignId?: string;
  }>({});

  // Helper functions
  const getAssigneeName = (assignedTo: any) => {
    if (!assignedTo) return "Unassigned";
    if (typeof assignedTo === "string") return assignedTo;
    return assignedTo.name || "Unknown Agent";
  };

  const getAssigneeInitials = (assignedTo: any) => {
    const name = getAssigneeName(assignedTo);
    if (name === "Unassigned") return "NA";
    return name.substring(0, 2).toUpperCase();
  };

  const getClientName = (ticket: any) => {
    if (ticket.clientName) return ticket.clientName;
    if (ticket.customer?.name) return ticket.customer.name;
    return "Unknown Caller";
  };

  const getClientPhone = (ticket: any) => {
    if (ticket.phone) return ticket.phone;
    if (ticket.customerPhone) return ticket.customerPhone;
    if (ticket.customer?.phone) return ticket.customer.phone;
    return "-";
  };

  const getClientInitials = (ticket: any) => {
    const name = getClientName(ticket);
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Open":
      case "OPEN":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-600";
      case "In Progress":
      case "IN_PROGRESS":
        return "border-amber-500/20 bg-amber-500/5 text-amber-600";
      case "Closed":
      case "CLOSED":
      default:
        return "";
    }
  };

  const getPriorityColor = (priority?: string) => {
    const p = priority?.toUpperCase();
    switch (p) {
      case "HIGH":
      case "EMERGENCY":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "MEDIUM":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "LOW":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-muted-foreground bg-secondary/50";
    }
  };

  const getDirectionIcon = (direction: string) => {
    const d = direction?.toString().toLowerCase();
    if (d === "missed") {
      return <AlertTriangle className="h-3 w-3 text-rose-500" />;
    }
    if (d === "outbound") {
      return <PhoneOutgoing className="h-3 w-3 text-blue-500" />;
    } else {
      return <PhoneIncoming className="h-3 w-3 text-emerald-500" />;
    }
  };

  const getDirectionText = (direction: string) => {
    const d = direction?.toString().toLowerCase();
    if (d === "missed") return "Missed";
    return d === "outbound" ? "Outbound" : "Inbound";
  };

  const isMissedCall = (ticket: Ticket) =>
    ticket.direction?.toString().toLowerCase() === "missed";

  const formatEnumLabel = (value?: string) => {
    if (!value) return "-";

    if (value === OnboardingOption.PAID_WITH_LL || value === "PAID_WITH_LL") {
      return "Paid with LL";
    }
    return value
      .toString()
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const normalizeEnumValue = (value?: string) => {
    if (!value) return "";
    return value.toString().trim().toUpperCase().replace(/\s+/g, "_");
  };

  const getCampaign = (ticket: Ticket) => {
    if (
      ticket.campaign &&
      typeof ticket.campaign === "object" &&
      "nombre" in ticket.campaign
    ) {
      return (ticket.campaign as { nombre?: string }).nombre;
    }
    if (ticket.campaignId) {
      const campaign = campaigns.find((c) => c.id === ticket.campaignId);
      return campaign?.nombre || null;
    }
    return null;
  };

  const getYardTypeColor = (type?: string) => {
    const t = type?.toLowerCase();
    switch (t) {
      case "full_service":
        return "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400";
      case "saas":
        return "border-purple-500/20 bg-purple-500/5 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400";
      default:
        return "border-gray-500/20 bg-gray-500/5 text-gray-600";
    }
  };

  const getYardTypeIcon = (type?: string) => {
    const t = type?.toLowerCase();
    switch (t) {
      case "full_service":
        return <Users className="h-3 w-3" />;
      case "saas":
        return <Sparkles className="h-3 w-3" />;
      default:
        return <Building className="h-3 w-3" />;
    }
  };

  const getYardDisplayName = (ticket: Ticket) => {
    if (ticket.yard && typeof ticket.yard === "object") {
      const y = ticket.yard as any;
      const name = y.name || "";
      const secondary = y.commonName || y.city || "";
      const location = y.propertyAddress || y.state || "";

      let display = name;
      if (secondary) display += ` - ${secondary}`;
      if (location && location !== secondary) display += ` (${location})`;

      return display || "Unknown Yard";
    }

    if (typeof ticket.yard === "string" && ticket.yard.trim() !== "") {
      return ticket.yard;
    }

    if (ticket.yardId) {
      const yard = yards.find(
        (y) => y.id.toString() === ticket.yardId?.toString()
      );
      if (yard) return yard.commonName || yard.name;
    }

    return null;
  };

  const getAttachmentUrl = (value: string) => {
    if (!value) return "";
    if (value.startsWith("http")) return value;
    if (value.startsWith("s3://")) {
      return `${apiBase}/tickets/attachments/download?fileUrl=${encodeURIComponent(
        value
      )}`;
    }
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${apiBase}${normalized}`;
  };

  const getAttachmentLabel = (value: string) => {
    if (!value) return "Attachment";
    const parts = value.split("/");
    return parts[parts.length - 1] || value;
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tickets");
      const result = await response.json();
      if (result.success) {
        setTickets(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYards = async () => {
    try {
      const data = await fetchFromBackend("/yards");
      if (Array.isArray(data)) {
        setYards(data.filter((yard: any) => yard.isActive));
      } else {
        console.error("Yards data is not an array:", data);
        setYards([]);
      }
    } catch (err) {
      console.error("Failed to load yards", err);
      setYards([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/users?page=1&limit=500");
      const result = await response.json();
      if (result?.success) {
        setCustomers(result.data || []);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
      setCustomers([]);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const result = await response.json();
      if (result?.success) {
        const list = result.data || [];
        setAgents(list.filter((agent: any) => agent.isActive !== false));
      } else {
        setAgents([]);
      }
    } catch (err) {
      console.error("Failed to load agents", err);
      setAgents([]);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await fetchFromBackend("/campaign?page=1&limit=200");
      const list = Array.isArray(data) ? data : data?.data || [];
      setCampaigns(list.filter((campaign: any) => campaign.isActive === true));
    } catch (err) {
      console.error("Failed to load campaigns", err);
      setCampaigns([]);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchYards();
    fetchCustomers();
    fetchAgents();
    fetchCampaigns();
  }, []);

  const selectedYard = useMemo(() => {
    return yards.find((y) => y.id.toString() === selectedYardId);
  }, [selectedYardId, yards]);

  const currentYard = useMemo(() => {
    if (!selectedTicket?.yardId) return null;
    return yards.find(
      (y) => y.id.toString() === selectedTicket.yardId?.toString()
    );
  }, [selectedTicket?.yardId, yards]);

  const filteredYards = useMemo(() => {
    return yards.filter((yard) => {
      const matchesSearch =
        yardSearch === "" ||
        yard.name.toLowerCase().includes(yardSearch.toLowerCase()) ||
        yard.commonName.toLowerCase().includes(yardSearch.toLowerCase()) ||
        yard.propertyAddress.toLowerCase().includes(yardSearch.toLowerCase());

      const matchesCategory =
        yardCategory === "all" || yard.yardType === yardCategory;

      return matchesSearch && matchesCategory;
    });
  }, [yardSearch, yardCategory, yards]);

  const filteredCampaignsEdit = useMemo(() => {
    const term = campaignSearchEdit.toLowerCase();
    return campaigns.filter((campaign) =>
      campaign.nombre.toLowerCase().includes(term)
    );
  }, [campaigns, campaignSearchEdit]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const yardName =
        typeof ticket.yard === "string"
          ? ticket.yard
          : (ticket.yard as any)?.name || "";
      const clientName =
        ticket.clientName || (ticket.customer as any)?.name || "";
      const phone =
        ticket.phone ||
        (ticket.customer as any)?.phone ||
        ticket.customerPhone ||
        "";
      const status = normalizeEnumValue(ticket.status as any);
      const priority = (ticket.priority as any)?.toString().toUpperCase();
      const assigneeName = getAssigneeName(ticket.assignedTo);

      const matchesSearch =
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        yardName.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toString().includes(search) ||
        phone.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || status === normalizeEnumValue(statusFilter);
      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority === priorityFilter ||
        priority === priorityFilter.toUpperCase();
      const matchesDirection =
        directionFilter === "all" ||
        ticket.direction === directionFilter ||
        ticket.direction?.toString().toLowerCase() ===
          directionFilter.toLowerCase();
      const isMissed = isMissedCall(ticket);

      let matchesView = true;
      if (activeView === "missed") {
        matchesView = isMissed;
      } else if (activeView === "assigned_me") {
        matchesView = assigneeName === "Agent Smith";
      } else if (activeView === "unassigned") {
        matchesView = !ticket.assignedTo;
      } else if (activeView === "active") {
        matchesView =
          status === "OPEN" ||
          status === "IN_PROGRESS" ||
          ticket.status === "Open" ||
          ticket.status === "In Progress";
      } else if (activeView === "assigned") {
        matchesView = !!ticket.assignedTo;
      } else if (activeView === "high_priority") {
        matchesView = priority === "HIGH" || ticket.priority === "High";
      }

      if (activeView !== "missed") {
        matchesView = matchesView && !isMissed;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDirection &&
        matchesView
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
    directionFilter,
    activeView,
  ]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter, directionFilter, activeView]);

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedYardId(ticket.yardId || "");
    setAttachmentFiles([]);
    setWasIssueDetailFilled(Boolean(ticket.issueDetail?.trim()));
    setIsIssueDetailEditing(false);

    setEditData({
      disposition: ticket.disposition || "",
      issueDetail: ticket.issueDetail || "",
      onboardingOption: ticket.onboardingOption || "",
      status: ticket.status?.toString().toUpperCase().replace(" ", "_") || "",
      priority: ticket.priority?.toString().toUpperCase() || "",
      attachments: ticket.attachments || [],
      // Load campaign, or leave empty if none
      campaignId: ticket.campaignId
        ? ticket.campaignId.toString()
        : (ticket.campaign && typeof ticket.campaign === "object" && "id" in ticket.campaign)
        ? (ticket.campaign as { id: string | number }).id.toString()
        : "",
    });

    setShowDetails(true);
    setYardSearch("");
    setYardCategory("all");
    setCampaignSearchEdit("");
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);


      const updatePayload: any = {
        ...editData,
        yardId: selectedYardId ? parseInt(selectedYardId) : null,
        status: editData.status?.toUpperCase().replace(" ", "_"),
        priority: editData.priority?.toUpperCase(),
        disposition: editData.disposition || null,
        onboardingOption: editData.onboardingOption || null,
        issueDetail: editData.issueDetail || null,
        campaignId: editData.campaignId ? parseInt(editData.campaignId) : null,
      };

      const response = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (result.success) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id ? { ...t, ...result.data } : t
          )
        );

        setSelectedTicket({ ...selectedTicket, ...result.data });

        toast({
          title: "Success",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Ticket updated successfully</span>
            </div>
          ),
        });

        setShowDetails(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update ticket",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      toast({
        title: "Error",
        description: "An error occurred while updating the ticket",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadAttachments = async () => {
    if (!selectedTicket || attachmentFiles.length === 0) return;

    try {
      setIsUploadingAttachments(true);
      const formData = new FormData();
      attachmentFiles.forEach((file) => formData.append("files", file));

      const response = await fetch(
        `/api/tickets/${selectedTicket.id}/attachments`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();

      if (result?.success) {
        setSelectedTicket(result.data);
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? result.data : t))
        );
        setEditData((prev) => ({
          ...prev,
          attachments: result.data.attachments || prev.attachments || [],
        }));
        setAttachmentFiles([]);
        toast({
          title: "Success",
          description: "Attachments uploaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to upload attachments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload attachments error", error);
      toast({
        title: "Error",
        description: "An error occurred while uploading attachments",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  const handleAssignYard = async () => {
    if (!selectedTicket || !selectedYardId) return;
    setIsAssigningYard(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedTicket && selectedYard) {
        const updatedYard = `${selectedYard.name} - ${selectedYard.commonName}`;

        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  yardId: selectedYardId,
                  yard: updatedYard,
                  yardType: selectedYard.yardType,
                }
              : t
          )
        );

        setSelectedTicket((prev) =>
          prev
            ? {
                ...prev,
                yardId: selectedYardId,
                yard: updatedYard,
                yardType: selectedYard.yardType,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Assign yard error:", err);
    } finally {
      setIsAssigningYard(false);
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      customerId: "",
      customerPhone: "",
      yardId: "",
      campaignId: "",
      onboardingOption: "",
      agentId: "",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.LOW,
      direction: CallDirection.INBOUND,
      callDate: "",
      disposition: "",
      issueDetail: "",
      attachments: [],
    });
    setNewAttachment("");
    setCreateAttachmentFiles([]);
    setCustomerSearchCreate("");
    setYardSearchCreate("");
    setAgentSearchCreate("");
    setCreateValidationErrors({});
  };

  const handleCreateTicket = async () => {
    const errors: Record<string, string> = {};
    if (!createFormData.customerId) {
      errors.customerId = "Customer is required";
    }
    if (!createFormData.direction) {
      errors.direction = "Direction is required";
    }

    if (Object.keys(errors).length > 0) {
      setCreateValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      const payload = {
        customerId: Number(createFormData.customerId),
        direction: createFormData.direction,
        yardId: createFormData.yardId
          ? Number(createFormData.yardId)
          : undefined,
        customerPhone: createFormData.customerPhone || undefined,
        campaignId: createFormData.campaignId
          ? Number(createFormData.campaignId)
          : undefined,
        onboardingOption: createFormData.onboardingOption || undefined,
        agentId: createFormData.agentId
          ? Number(createFormData.agentId)
          : undefined,
        status: createFormData.status || undefined,
        priority: createFormData.priority || undefined,
        disposition: createFormData.disposition || undefined,
        issueDetail: createFormData.issueDetail?.trim() || undefined,
        attachments: createFormData.attachments.length
          ? createFormData.attachments
          : undefined,
      };

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        let createdTicket = result.data;
        if (createAttachmentFiles.length > 0 && createdTicket?.id) {
          try {
            const formData = new FormData();
            createAttachmentFiles.forEach((file) =>
              formData.append("files", file)
            );
            const uploadResponse = await fetch(
              `/api/tickets/${createdTicket.id}/attachments`,
              {
                method: "POST",
                body: formData,
              }
            );
            const uploadResult = await uploadResponse.json();
            if (uploadResult?.success) {
              createdTicket = uploadResult.data;
            } else {
              toast({
                title: "Warning",
                description:
                  uploadResult?.message ||
                  "Ticket created, but attachments failed to upload",
                variant: "destructive",
              });
            }
          } catch (uploadError) {
            console.error("Upload attachments error:", uploadError);
            toast({
              title: "Warning",
              description: "Ticket created, but attachments failed to upload",
              variant: "destructive",
            });
          }
        }
        toast({
          title: "Success",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Ticket created successfully</span>
            </div>
          ),
        });
        setShowCreateModal(false);
        resetCreateForm();
        fetchTickets();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create ticket",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Create ticket error:", err);
      toast({
        title: "Error",
        description: "An error occurred while creating the ticket",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const hasIssueDetail = Boolean(editData.issueDetail?.trim());
  const isIssueDetailFilledForDisplay =
    hasIssueDetail && (wasIssueDetailFilled || !isIssueDetailEditing);
  const savedAttachments = selectedTicket?.attachments || [];
  const pendingAttachments = (editData.attachments || []).filter(
    (att) => !savedAttachments.includes(att)
  );
  const hasSavedAttachments = savedAttachments.length > 0;
  const hasPendingAttachments = pendingAttachments.length > 0;
  const hasYardAssigned = Boolean(selectedYardId || selectedTicket?.yardId);
  const selectedCampaignForEdit = (() => {
    if (editData.campaignId) {
      return campaigns.find(
        (campaign) => campaign.id.toString() === editData.campaignId
      );
    }
    if (editData.campaignId) {
      return campaigns.find(
        (campaign) => campaign.id.toString() === editData.campaignId
      );
    }
    if (
      selectedTicket?.campaign &&
      typeof selectedTicket.campaign === "object"
    ) {
      return selectedTicket.campaign;
    }
    if (selectedTicket?.campaignId) {
      return campaigns.find(
        (campaign) => campaign.id === selectedTicket.campaignId
      );
    }
    return null;
  })();
  const showOnboardingOption =
    selectedCampaignForEdit?.tipo?.toString().toUpperCase() === "ONBOARDING";

  const metadataFields = [
    {
      key: "status",
      filled: Boolean(editData.status),
      node: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <Select
            value={editData.status}
            onValueChange={(v) =>
              setEditData((prev) => ({ ...prev, status: v }))
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TicketStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {formatEnumLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "priority",
      filled: Boolean(editData.priority),
      node: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Priority</p>
          <Select
            value={editData.priority}
            onValueChange={(v) =>
              setEditData((prev) => ({ ...prev, priority: v }))
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TicketPriority).map((p) => (
                <SelectItem key={p} value={p}>
                  {formatEnumLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "campaign",
      filled: Boolean(editData.campaignId),
      node: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Campaign</p>
          <Select
            value={editData.campaignId || "none"}
            onValueChange={(value) => {
              const selected =
                value === "none"
                  ? null
                  : campaigns.find(
                      (campaign) => campaign.id.toString() === value
                    );
              setEditData((prev) => ({
                ...prev,
                campaignId: value === "none" ? "" : value,
                onboardingOption:
                  selected?.tipo?.toString().toUpperCase() === "ONBOARDING"
                    ? prev.onboardingOption
                    : "",
              }));
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    className="pl-8"
                    value={campaignSearchEdit}
                    onChange={(e) => setCampaignSearchEdit(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <ScrollArea className="h-64">
                <SelectItem value="none">No campaign</SelectItem>
                {filteredCampaignsEdit.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No campaigns found
                  </div>
                ) : (
                  filteredCampaignsEdit.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.nombre}
                    </SelectItem>
                  ))
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "assignee",
      filled: true,
      node: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Assignee</p>
          <div className="flex items-center gap-2 h-8">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getAssigneeInitials(selectedTicket?.assignedTo)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {getAssigneeName(selectedTicket?.assignedTo)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "direction",
      filled: true,
      node: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Direction</p>
          <div className="flex items-center gap-2 h-8">
            {getDirectionIcon(selectedTicket?.direction || "inbound")}
            <span className="text-sm">
              {getDirectionText(selectedTicket?.direction || "inbound")}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "disposition",
      filled: Boolean(editData.disposition),
      node: (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Disposition
          </p>
          <Select
            value={editData.disposition}
            onValueChange={(v) =>
              setEditData((prev) => ({ ...prev, disposition: v }))
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select disposition" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TicketDisposition).map((d) => (
                <SelectItem key={d} value={d}>
                  {formatEnumLabel(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    showOnboardingOption
      ? {
          key: "onboardingOption",
          filled: Boolean(editData.onboardingOption),
          node: (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Onboarding Option
              </p>
              <Select
                value={editData.onboardingOption}
                onValueChange={(v) =>
                  setEditData((prev) => ({
                    ...prev,
                    onboardingOption: v,
                  }))
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OnboardingOption).map((o) => (
                    <SelectItem key={o} value={o}>
                      {formatEnumLabel(o)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ),
        }
      : null,
  ].filter(Boolean) as { key: string; filled: boolean; node: JSX.Element }[];

  const baseFullFields = [
    {
      key: "yardAssignment",
      filled: hasYardAssigned,
      node: (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <p className="text-sm font-medium text-muted-foreground">
                Yard Assignment
              </p>
            </div>
            {!hasYardAssigned && (
              <Badge
                variant="outline"
                className="border-amber-500/30 text-amber-600"
              >
                Missing
              </Badge>
            )}
          </div>
          {!hasYardAssigned && (
            <div className="text-xs text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Action Required: No yard assigned</span>
            </div>
          )}
          {currentYard && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">{currentYard.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentYard.propertyAddress ||
                        currentYard.propertyAddress}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {(currentYard.yardType || currentYard.yardType) ===
                        "SAAS" ||
                      (currentYard.yardType || currentYard.yardType) === "saas"
                        ? "SaaS"
                        : "Full Service"}
                    </Badge>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Yard</Label>
              <Select
                value={selectedYardId}
                onValueChange={(value) => setSelectedYardId(value)}
              >
                <SelectTrigger className="h-11 bg-muted/30 border-border/60">
                  <SelectValue placeholder="Select a yard...">
                    {selectedYard ? (
                      <div className="flex items-center gap-2">
                        <span className="truncate">{selectedYard.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {(selectedYard.yardType || selectedYard.yardType) ===
                            "SAAS" ||
                          (selectedYard.yardType || selectedYard.yardType) ===
                            "saas"
                            ? "SaaS"
                            : "Full Service"}
                        </Badge>
                      </div>
                    ) : (
                      "Select a yard..."
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="p-0">
                  <div className="p-3 border-b border-border/60 bg-muted/20">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search yards..."
                        className="pl-8 bg-background"
                        value={yardSearch}
                        onChange={(e) => setYardSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    {filteredYards.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No yards found
                      </div>
                    ) : (
                      filteredYards.map((yard) => (
                        <SelectItem key={yard.id} value={yard.id.toString()}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {yard.commonName || yard.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {yard.propertyAddress}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {selectedYard && (
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{selectedYard.name}</p>
                        <Badge variant="outline">
                          {(selectedYard.yardType || selectedYard.yardType) ===
                            "SAAS" ||
                          (selectedYard.yardType || selectedYard.yardType) ===
                            "saas"
                            ? "SaaS"
                            : "Full Service"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedYard.propertyAddress ||
                          selectedYard.propertyAddress}
                      </p>

                      {(selectedYard.contactInfo ||
                        selectedYard.contactInfo) && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <span className="font-medium">Contact:</span>
                          <span>
                            {selectedYard.contactInfo ||
                              selectedYard.contactInfo}
                          </span>
                        </div>
                      )}

                      {selectedYard.notes && (
                        <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                          <span className="font-medium">Note: </span>
                          {selectedYard.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedYardId("");
                      setYardSearch("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "issueDetail",
      filled: isIssueDetailFilledForDisplay,
      node: (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Issue Detail
          </p>
          <Textarea
            placeholder="Describe the issue..."
            value={editData.issueDetail || ""}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                issueDetail: e.target.value,
              }))
            }
            onFocus={() => setIsIssueDetailEditing(true)}
            onBlur={() => setIsIssueDetailEditing(false)}
            onKeyDown={(event) => {
              if (event.key === "Tab") {
                event.preventDefault();
              }
            }}
            className="min-h-[100px] bg-muted/20"
          />
        </div>
      ),
    },
  ];

  const filledMetadataFields: Array<{ key: string; node: JSX.Element }> =
    metadataFields
      .filter((field) => field.filled)
      .map((field) => ({ key: field.key, node: field.node }));
  const missingMetadataFields: Array<{ key: string; node: JSX.Element }> =
    metadataFields
      .filter((field) => !field.filled)
      .map((field) => ({ key: field.key, node: field.node }));
  const filledFullFields: Array<{ key: string; node: JSX.Element }> =
    baseFullFields
      .filter((field) => field.filled)
      .map((field) => ({ key: field.key, node: field.node }));
  const missingFullFields: Array<{ key: string; node: JSX.Element }> =
    baseFullFields
      .filter((field) => !field.filled)
      .map((field) => ({ key: field.key, node: field.node }));

  const attachmentControlsNode = (
    <div className="space-y-2">
      <Label>Upload files</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          id="ticket-attachments-upload"
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;
            setAttachmentFiles((prev) => [...prev, ...files]);
            e.currentTarget.value = "";
          }}
        />
        <Button asChild variant="outline" size="sm">
          <Label htmlFor="ticket-attachments-upload" className="cursor-pointer">
            Choose files
          </Label>
        </Button>
        <span className="text-xs text-muted-foreground">
          {attachmentFiles.length > 0
            ? `${attachmentFiles.length} file${
                attachmentFiles.length > 1 ? "s" : ""
              } selected`
            : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {attachmentFiles.map((file, idx) => (
          <Badge
            key={`${file.name}-${idx}`}
            variant="secondary"
            className="pl-3 pr-1 py-1 gap-2 group"
          >
            <span className="truncate max-w-[200px]">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-transparent"
              onClick={() =>
                setAttachmentFiles((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {attachmentFiles.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            No files selected
          </p>
        )}
      </div>

      {hasPendingAttachments && (
        <div className="flex flex-wrap gap-2 mt-2">
          {pendingAttachments.map((att, idx) => (
            <Badge
              key={`${att}-${idx}`}
              variant="secondary"
              className="pl-3 pr-1 py-1 gap-2 group"
            >
              <span className="truncate max-w-50">{att}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-transparent"
                onClick={() => {
                  setEditData((prev) => ({
                    ...prev,
                    attachments: (() => {
                      const next = [...(prev.attachments || [])];
                      const removeIndex = next.indexOf(att);
                      if (removeIndex >= 0) {
                        next.splice(removeIndex, 1);
                      }
                      return next;
                    })(),
                  }));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  if (hasSavedAttachments) {
    filledFullFields.push({
      key: "attachmentsSaved",
      node: (
        <div className="space-y-4">
          <div className="space-y-2">
            {savedAttachments.map((att, idx) => (
              <div
                key={`${att}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2"
              >
                <span className="text-sm truncate">
                  {getAttachmentLabel(att)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(getAttachmentUrl(att), "_blank")}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
          {attachmentControlsNode}
        </div>
      ),
    });
  } else {
    missingFullFields.push({
      key: "attachmentsPending",
      node: attachmentControlsNode,
    });
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row gap-6 p-4">
      {/* Sidebar izquierdo */}
      <div className="w-full lg:w-48 flex-shrink-0 flex flex-col gap-4">
        {/* ... Sidebar content unchanged ... */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ticketing</h2>
          <Button size="icon" variant="ghost">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>

        <div className="space-y-1">
          <Button
            variant={activeView === "all" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("all")}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            All Tickets
            <span className="ml-auto text-xs">
              {tickets.filter((t) => !isMissedCall(t)).length}
            </span>
          </Button>
          <Button
            variant={activeView === "active" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("active")}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Open
            <span className="ml-auto text-xs">
              {
                tickets.filter(
                  (t) =>
                    !isMissedCall(t) &&
                    (t.status === "Open" || t.status === "In Progress")
                ).length
              }
            </span>
          </Button>
          <Button
            variant={activeView === "assigned" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("assigned")}
          >
            <User className="mr-2 h-4 w-4" />
            Assigned
            <span className="ml-auto text-xs">
              {tickets.filter((t) => !isMissedCall(t) && !!t.assignedTo).length}
            </span>
          </Button>
          <Button
            variant={activeView === "assigned_me" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("assigned_me")}
          >
            <User className="mr-2 h-4 w-4" />
            My Tickets
            <span className="ml-auto text-xs">
              {
                tickets.filter(
                  (t) => !isMissedCall(t) && t.assignedTo === "Agent Smith"
                ).length
              }
            </span>
          </Button>
          <Button
            variant={activeView === "unassigned" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("unassigned")}
          >
            <Hash className="mr-2 h-4 w-4" />
            Unassigned
            <span className="ml-auto text-xs">
              {tickets.filter((t) => !isMissedCall(t) && !t.assignedTo).length}
            </span>
          </Button>
          <Button
            variant={activeView === "missed" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("missed")}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Missed Calls
            <span className="ml-auto text-xs">
              {tickets.filter((t) => isMissedCall(t)).length}
            </span>
          </Button>
          <Button
            variant={activeView === "high_priority" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveView("high_priority")}
          >
            <Star className="mr-2 h-4 w-4" />
            High Priority
            <span className="ml-auto text-xs">
              {tickets.filter((t) => !isMissedCall(t) && t.priority === "High").length}
            </span>
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Filters</h3>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(TicketStatus).map((value) => (
                  <SelectItem key={value} value={value}>
                    {formatEnumLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Directions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* ... Main content search/table unchanged ... */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[150px]">Name</TableHead>
                  <TableHead className="w-[140px]">Yard</TableHead>
                  <TableHead className="w-[120px]">Number</TableHead>
                  <TableHead className="w-[120px]">Campaign</TableHead>
                  <TableHead className="w-[140px]">Assignee</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[100px]">Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading tickets...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTickets.map((ticket) => {
                    const yardDisplayName = getYardDisplayName(ticket);
                    let yardType = ticket.yardType;

                    if (!yardType && ticket.yardId) {
                      const yardObj = yards.find(
                        (y) => y.id.toString() === ticket.yardId?.toString()
                      );
                      if (yardObj) yardType = yardObj.yardType;
                    }

                    return (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(ticket)}
                      >
                        <TableCell className="font-mono text-xs">
                          #{ticket.id}
                        </TableCell>
                        <TableCell>{getClientName(ticket)}</TableCell>
                        <TableCell>
                          {yardDisplayName ? (
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className={`${getYardTypeColor(yardType)}`}
                              >
                                <div className="flex items-center gap-1">
                                  {getYardTypeIcon(yardType)}
                                  <span className="truncate max-w-[150px]">
                                    {yardDisplayName}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                          ) : (
                            <div className="group relative inline-block">
                              <Badge
                                variant="outline"
                                className="border-amber-500/20 bg-amber-500/5 text-amber-600 animate-pulse"
                              >
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                              <div className="absolute z-10 hidden group-hover:block bg-white dark:bg-zinc-900 text-xs text-amber-700 dark:text-amber-300 border border-amber-400 rounded px-2 py-1 shadow-lg left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                                Yard pending assignment
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getClientPhone(ticket)}</TableCell>
                        <TableCell>
                          {getCampaign(ticket) ? (
                            <Badge variant="outline">
                              {getCampaign(ticket)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/5 text-amber-600"
                            >
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getAssigneeInitials(ticket.assignedTo)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {getAssigneeName(ticket.assignedTo)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(ticket.status)}
                          >
                            {formatEnumLabel(ticket.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.priority ? (
                            <Badge
                              variant="outline"
                              className={getPriorityColor(ticket.priority)}
                            >
                              {formatEnumLabel(ticket.priority)}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getDirectionIcon(ticket.direction || "inbound")}
                            <span className="text-xs">
                              {getDirectionText(ticket.direction || "inbound")}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredTickets.length)}{" "}
                of {filteredTickets.length} tickets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / page</SelectItem>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateTicketModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) resetCreateForm();
        }}
        customers={customers}
        yards={yards}
        agents={agents}
        campaigns={campaigns}
        createFormData={createFormData}
        setCreateFormData={setCreateFormData}
        createValidationErrors={createValidationErrors}
        setCreateValidationErrors={setCreateValidationErrors}
        customerSearchCreate={customerSearchCreate}
        setCustomerSearchCreate={setCustomerSearchCreate}
        yardSearchCreate={yardSearchCreate}
        setYardSearchCreate={setYardSearchCreate}
        agentSearchCreate={agentSearchCreate}
        setAgentSearchCreate={setAgentSearchCreate}
        campaignSearchCreate={campaignSearchCreate}
        setCampaignSearchCreate={setCampaignSearchCreate}
        newAttachment={newAttachment}
        setNewAttachment={setNewAttachment}
        attachmentFiles={createAttachmentFiles}
        setAttachmentFiles={setCreateAttachmentFiles}
        isCreating={isCreating}
        onSubmit={handleCreateTicket}
      />

      {/* Central dialog for ticket details */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">Ticket Details</DialogTitle>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-3 -mt-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getClientInitials(selectedTicket)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {getClientName(selectedTicket)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getClientPhone(selectedTicket)}
                  </div>
                </div>
              </div>

              <TicketDetailsFields
                filledMetadataFields={filledMetadataFields}
                filledFullFields={filledFullFields}
                missingMetadataFields={missingMetadataFields}
                missingFullFields={missingFullFields}
              />

              <DialogFooter className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"></p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetails(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateTicket}
                      disabled={isUpdating}
                      className="min-w-[120px]"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
