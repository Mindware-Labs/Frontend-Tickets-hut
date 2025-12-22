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
import { Ticket } from "@/lib/mock-data";
import {
  YARDS,
  YARD_CATEGORIES,
  type Yard,
  type YardType,
} from "@/lib/yard-data";

// Extender el tipo Ticket
declare module "@/lib/mock-data" {
  interface Ticket {
    issueDetail?: string;
    yardId?: string;
    yardType?: string;
    customer?: { name: string; phone?: string };
    customerPhone?: string;
    disposition?: string;
    onboardingOption?: string;
    attachments?: string[];
  }
}

// Enums para los selectores
export enum TicketDisposition {
  BOOKING = "BOOKING",
  GENERAL_INFO = "GENERAL_INFO",
  COMPLAINT = "COMPLAINT",
  SUPPORT = "SUPPORT",
  BILLING = "BILLING",
  TECHNICAL_ISSUE = "TECHNICAL_ISSUE",
  OTHER = "OTHER",
}

export enum OnboardingOption {
  NOT_REGISTER = "NOT_REGISTER",
  REGISTER = "REGISTER",
  PAID_WITH_LL = "PAID_WITH_LL",
  CANCELLED = "CANCELLED",
}

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
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
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedYardId, setSelectedYardId] = useState<string>("");
  const [isAssigningYard, setIsAssigningYard] = useState(false);
  const [issueDetail, setIssueDetail] = useState("");
  const [isEditingIssue, setIsEditingIssue] = useState(false);
  const [yardSearch, setYardSearch] = useState("");
  const [yardCategory, setYardCategory] = useState<string>("all");
  const [yards, setYards] = useState<
    Array<{
      id: number;
      name: string;
      commonName: string;
      propertyAddress: string;
      address?: string;
      contactInfo: string;
      contactPhone?: string;
      yardType: string;
      type?: string;
      isActive: boolean;
      notes?: string;
    }>
  >([]);

  // State for updating ticket
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState<{
    disposition?: string;
    issueDetail?: string;
    onboardingOption?: string;
    status?: string;
    priority?: string;
    attachments?: string[];
  }>({});

  // Helper functions moved to top to avoid ReferenceErrors during initialization
  // Safe access to assignee
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

  // Safe access to client/customer
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
      case "RESOLVED":
        return "border-rose-500/20 bg-rose-500/5 text-rose-600";
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
    if (d === "outbound") {
      return <PhoneOutgoing className="h-3 w-3 text-blue-500" />;
    } else {
      return <PhoneIncoming className="h-3 w-3 text-emerald-500" />;
    }
  };

  const getDirectionText = (direction: string) => {
    const d = direction?.toString().toLowerCase();
    return d === "outbound" ? "Outbound" : "Inbound";
  };

  const getCampaignFromType = (type: string) => {
    return type === "Onboarding" || type === "ONBOARDING" ? "Onboarding" : "AR";
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

  // Obtener yard display name para la tabla
  const getYardDisplayName = (ticket: Ticket) => {
    if (ticket.yard && typeof ticket.yard === 'object') {
      const y = ticket.yard as any
      // Handle different backend/mock structures
      const name = y.name || "";
      const secondary = y.commonName || y.city || "";
      const location = y.propertyAddress || y.state || "";

      let display = name;
      if (secondary) display += ` - ${secondary}`;
      if (location && location !== secondary) display += ` (${location})`;

      return display || "Unknown Yard";
    }

    if (typeof ticket.yard === 'string' && ticket.yard.trim() !== '') {
      return ticket.yard
    }

    if (ticket.yardId) {
      const yard = YARDS.find(y => y.id.toString() === ticket.yardId?.toString())
      if (yard) return `${yard.name} - ${yard.city}, ${yard.state}`
    }

    return null
  };

  // Fetch tickets
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

  // Fetch yards from backend
  const fetchYards = async () => {
    try {
      const response = await fetch("/api/yards");
      const data = await response.json();
      if (Array.isArray(data)) {
        setYards(data.filter((yard: any) => yard.isActive));
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setYards(data.data.filter((yard: any) => yard.isActive));
      } else {
        console.error("Yards data is not an array:", data);
        setYards([]);
      }
    } catch (err) {
      console.error("Failed to load yards", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchYards();
  }, []);

  // Obtener yarda seleccionada para el selector de búsqueda
  const selectedYard = useMemo(() => {
    return yards.find((y) => y.id.toString() === selectedYardId);
  }, [selectedYardId, yards]);

  // Yarda actualmente asignada al ticket seleccionado
  const currentYard = useMemo(() => {
    if (!selectedTicket?.yardId) return null
    return YARDS.find(y => y.id === selectedTicket.yardId)
  }, [selectedTicket?.yardId])

  // Yardas filtradas por la búsqueda en el modal
  const filteredYards = useMemo(() => {
    return YARDS.filter(yard => {
      const matchesSearch = yardSearch === "" ||
        yard.name.toLowerCase().includes(yardSearch.toLowerCase()) ||
        yard.commonName.toLowerCase().includes(yardSearch.toLowerCase()) ||
        yard.city.toLowerCase().includes(yardSearch.toLowerCase()) ||
        yard.state.toLowerCase().includes(yardSearch.toLowerCase())

      const matchesCategory = yardCategory === "all" ||
        yard.type === yardCategory ||
        yard.category === yardCategory

      return matchesSearch && matchesCategory
    })
  }, [yardSearch, yardCategory])

  // Filter tickets logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Safe data mapping
      const yardName = typeof ticket.yard === 'string'
        ? ticket.yard
        : (ticket.yard as any)?.name || "";
      const clientName = ticket.clientName || (ticket.customer as any)?.name || "";
      const phone = ticket.phone || (ticket.customer as any)?.phone || ticket.customerPhone || "";
      const status = (ticket.status as any)?.toString().toUpperCase();
      const priority = (ticket.priority as any)?.toString().toUpperCase();
      const assigneeName = getAssigneeName(ticket.assignedTo);

      // Search matching
      const matchesSearch =
        clientName.toLowerCase().includes(search.toLowerCase()) ||
        yardName.toLowerCase().includes(search.toLowerCase()) ||
        ticket.id.toString().includes(search) ||
        phone.toLowerCase().includes(search.toLowerCase());

      // Filter matching
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter || status === statusFilter.toUpperCase();
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter || priority === priorityFilter.toUpperCase();
      const matchesDirection =
        directionFilter === "all" || ticket.direction === directionFilter || ticket.direction?.toString().toLowerCase() === directionFilter.toLowerCase();

      // View matching
      let matchesView = true;
      if (activeView === "assigned_me") {
        matchesView = assigneeName === "Agent Smith";
      } else if (activeView === "unassigned") {
        matchesView = !ticket.assignedTo;
      } else if (activeView === "active") {
        matchesView = status === "OPEN" || status === "IN_PROGRESS" || ticket.status === "Open" || ticket.status === "In Progress";
      } else if (activeView === "assigned") {
        matchesView = !!ticket.assignedTo;
      } else if (activeView === "high_priority") {
        matchesView = priority === "HIGH" || ticket.priority === "High";
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDirection && matchesView;
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
    directionFilter,
    activeView,
  ]);

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedYardId(ticket.yardId || "");
    setIssueDetail(ticket.issueDetail || "");

    // Initialize edit data
    setEditData({
      disposition: ticket.disposition || "",
      issueDetail: ticket.issueDetail || "",
      onboardingOption: ticket.onboardingOption || "",
      status: ticket.status?.toString().toUpperCase().replace(" ", "_") || "",
      priority: ticket.priority?.toString().toUpperCase() || "",
      attachments: ticket.attachments || [],
    });

    setIsEditingIssue(false);
    setShowDetails(true);
    setYardSearch("");
    setYardCategory("all");
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);

      const updatePayload: any = {
        ...editData,
        yardId: selectedYardId ? parseInt(selectedYardId) : null,
        status: editData.status?.toUpperCase().replace(' ', '_'),
        priority: editData.priority?.toUpperCase(),
        disposition: editData.disposition || null,
        onboardingOption: editData.onboardingOption || null,
        issueDetail: editData.issueDetail || null,
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
        // Update local tickets state
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id ? { ...t, ...result.data } : t
          )
        );

        // Update selected ticket in modal
        setSelectedTicket({ ...selectedTicket, ...result.data });

        setShowDetails(false);
      } else {
        alert(result.message || "Failed to update ticket");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignYard = async () => {
    if (!selectedTicket || !selectedYardId) return;

    // Función para resaltar coincidencias en el texto
    const highlightMatch = (
      text: string,
      searchTerm: string
    ): React.ReactNode => {
      if (!searchTerm || !text) return text;

      const lowerText = text.toString().toLowerCase();
      const lowerSearch = searchTerm.toLowerCase();

      // Si no hay coincidencia, devolver el texto normal
      if (!lowerText.includes(lowerSearch)) {
        return text;
      }

      // Dividir el texto en partes que coinciden y no coinciden
      const regex = new RegExp(`(${searchTerm})`, "gi");
      const parts = text.toString().split(regex);

      return (
        <span>
          {parts.map((part, index) =>
            part.toLowerCase() === lowerSearch ? (
              <mark
                key={index}
                className="bg-yellow-200 dark:bg-yellow-800/70 text-yellow-900 dark:text-yellow-100 px-0.5 rounded font-medium"
              >
                {part}
              </mark>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </span>
      );
    };

    setIsAssigningYard(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedTicket && selectedYard) {
        const updatedYard = `${selectedYard.name} - ${selectedYard.commonName}`;

        // Update local tickets state
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

        // Update selected ticket in modal
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

  const handleSaveIssueDetail = () => {
    if (!selectedTicket) return;

    // Update local tickets state
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, issueDetail } : t))
    );

    // Update selected ticket in modal
    setSelectedTicket((prev) => (prev ? { ...prev, issueDetail } : null));

    setIsEditingIssue(false);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row gap-6 p-4">
      {/* Sidebar izquierdo */}
      <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ticketing</h2>
          <Button size="icon" variant="ghost">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

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
            <span className="ml-auto text-xs">{tickets.length}</span>
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
                  (t) => t.status === "Open" || t.status === "In Progress"
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
              {tickets.filter((t) => !!t.assignedTo).length}
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
              {tickets.filter((t) => t.assignedTo === "Agent Smith").length}
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
              {tickets.filter((t) => !t.assignedTo).length}
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
              {tickets.filter((t) => t.priority === "High").length}
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
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
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

      {/* Área principal */}
      <div className="flex-1 flex flex-col gap-4">
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

        <div className="flex-1 rounded-lg border overflow-hidden">
          <ScrollArea className="h-[calc(100vh-12rem)]">
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
                  filteredTickets.map((ticket) => {
                    const yardDisplayName = getYardDisplayName(ticket);
                    let yardType = ticket.yardType;

                    // Si no tenemos yardType pero sí yardId, buscamos en los datos locales
                    if (!yardType && ticket.yardId) {
                      const yardObj = YARDS.find((y) => y.id === ticket.yardId);
                      if (yardObj) yardType = yardObj.type;
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
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/5 text-amber-600"
                            >
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getClientPhone(ticket)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCampaignFromType(ticket.type)}
                          </Badge>
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
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.priority ? (
                            <Badge
                              variant="outline"
                              className={getPriorityColor(ticket.priority)}
                            >
                              {ticket.priority}
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
          </ScrollArea>
        </div>
      </div>

      {/* Dialog central para detalles del ticket */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">Ticket Details</DialogTitle>
                </div>
                <DialogDescription>
                  <div className="flex items-center gap-3 mt-2">
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
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Ticket Metadata - MANTIENE EL MISMO FORMATO */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Status
                        </p>
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
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Priority
                        </p>
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
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Assignee
                        </p>
                        <div className="flex items-center gap-2 h-8">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getAssigneeInitials(selectedTicket.assignedTo)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {getAssigneeName(selectedTicket.assignedTo)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Direction
                        </p>
                        <div className="flex items-center gap-2 h-8">
                          {getDirectionIcon(
                            selectedTicket.direction || "inbound"
                          )}
                          <span className="text-sm">
                            {getDirectionText(
                              selectedTicket.direction || "inbound"
                            )}
                          </span>
                        </div>
                      </div>
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
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Onboarding Option
                        </p>
                        {(selectedTicket.type as string)?.toUpperCase() ===
                          "ONBOARDING" ? (
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
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="h-8 flex items-center">
                            <span className="text-xs text-muted-foreground italic">
                              N/A for AR
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Issue Detail
                      </p>
                      <Textarea
                        placeholder="Describe the issue..."
                        value={editData.issueDetail}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            issueDetail: e.target.value,
                          }))
                        }
                        className="min-h-[100px] bg-muted/20"
                      />
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Attachments
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add attachment link or name..."
                          className="bg-muted/20"
                          id="new-attachment"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = e.currentTarget;
                              if (input.value.trim()) {
                                setEditData((prev) => ({
                                  ...prev,
                                  attachments: [
                                    ...(prev.attachments || []),
                                    input.value.trim(),
                                  ],
                                }));
                                input.value = "";
                              }
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(
                              "new-attachment"
                            ) as HTMLInputElement;
                            if (input && input.value.trim()) {
                              setEditData((prev) => ({
                                ...prev,
                                attachments: [
                                  ...(prev.attachments || []),
                                  input.value.trim(),
                                ],
                              }));
                              input.value = "";
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {(editData.attachments || []).map((att, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="pl-3 pr-1 py-1 gap-2 group"
                          >
                            <span className="truncate max-w-[200px]">
                              {att}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 hover:bg-transparent"
                              onClick={() => {
                                setEditData((prev) => ({
                                  ...prev,
                                  attachments: (prev.attachments || []).filter(
                                    (_, i) => i !== idx
                                  ),
                                }));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {(!editData.attachments ||
                          editData.attachments.length === 0) && (
                            <p className="text-xs text-muted-foreground italic">
                              No attachments added
                            </p>
                          )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Yard Assignment  */}

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Yard Assignment
                    </CardTitle>
                    {!selectedTicket.yardId && (
                      <CardDescription className="text-amber-600">
                        <AlertTriangle className="inline h-4 w-4 mr-1" />
                        Action Required: No yard assigned
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Yard actual asignado */}
                      {currentYard && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {currentYard.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {currentYard.propertyAddress || currentYard.address}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {(currentYard.yardType || currentYard.type) === "SAAS" || (currentYard.yardType || currentYard.type) === "saas"
                                    ? "SaaS"
                                    : "Full Service"}
                                </Badge>
                              </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                      )}

                      {/* Selector de yardas con búsqueda */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Yard</Label>
                          <Select
                            value={selectedYardId}
                            onValueChange={(value) => setSelectedYardId(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a yard...">
                                {selectedYard ? (
                                  <div className="flex items-center gap-2">
                                    <span className="truncate">
                                      {selectedYard.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {(selectedYard.yardType || selectedYard.type) === "SAAS" || (selectedYard.yardType || selectedYard.type) === "saas"
                                        ? "SaaS"
                                        : "Full Service"}
                                    </Badge>
                                  </div>
                                ) : (
                                  "Select a yard..."
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <div className="relative mb-2">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search yards..."
                                    className="pl-8"
                                    value={yardSearch}
                                    onChange={(e) =>
                                      setYardSearch(e.target.value)
                                    }
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
                                    <SelectItem
                                      key={yard.id}
                                      value={yard.id.toString()}
                                    >
                                      {yard.name} -{" "}
                                      {(yard.yardType || yard.type) === "SAAS" || (yard.yardType || yard.type) === "saas"
                                        ? "SaaS"
                                        : "Full Service"}
                                    </SelectItem>
                                  ))
                                )}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Mostrar yarda seleccionada */}
                        {selectedYard && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                  <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">
                                      {selectedYard.name}
                                    </p>
                                    <Badge variant="outline">
                                      {(selectedYard.yardType || selectedYard.type) === "SAAS" || (selectedYard.yardType || selectedYard.type) === "saas"
                                        ? "SaaS"
                                        : "Full Service"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedYard.propertyAddress || selectedYard.address}
                                  </p>

                                  {(selectedYard.contactInfo || selectedYard.contactPhone) && (
                                    <div className="flex items-center gap-2 mt-2 text-sm">
                                      <span className="font-medium">
                                        Contact:
                                      </span>
                                      <span>{selectedYard.contactInfo || selectedYard.contactPhone}</span>
                                    </div>
                                  )}

                                  {selectedYard.notes && (
                                    <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                                      <span className="font-medium">
                                        Note:{" "}
                                      </span>
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
                  </CardContent>
                </Card>

                {/* Issue Detail  */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Issue Detail
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditingIssue ? (
                      <div className="space-y-3">
                        <Textarea
                          value={issueDetail}
                          onChange={(e) => setIssueDetail(e.target.value)}
                          placeholder="Describe the issue in detail..."
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingIssue(false)}
                          >
                            Cancel Edit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          {issueDetail ? (
                            <p className="whitespace-pre-wrap">{issueDetail}</p>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p>No issue details added yet</p>
                              <Button
                                variant="link"
                                className="mt-1"
                                onClick={() => setIsEditingIssue(true)}
                              >
                                Add issue details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between w-full">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Changes will be saved to the database.
                  </p>
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
