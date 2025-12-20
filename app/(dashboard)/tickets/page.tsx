"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  mockTickets,
  type Ticket
} from "@/lib/mock-data"
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Ticket as TicketIcon,
  Inbox,
  User,
  Hash,
  Star,
  Archive,
  SlidersHorizontal,
  PhoneOutgoing,
  PhoneIncoming,
  PhoneMissed,
} from "lucide-react"

export default function TicketsPage() {
  const [search, setSearch] = useState("")
  const [activeView, setActiveView] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [directionFilter, setDirectionFilter] = useState("all")
  const [sortBy, setSortBy] = useState<keyof Ticket>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  // Filter and Sort Logic
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      const matchesSearch =
        (ticket.clientName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        ticket.id.toLowerCase().includes(search.toLowerCase()) ||
        ticket.phone.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
      const matchesDirection = directionFilter === "all" || ticket.direction === directionFilter

      let matchesView = true;
      if (activeView === "assigned_me") {
        matchesView = ticket.assignedTo === "Agent Smith";
      } else if (activeView === "unassigned") {
        matchesView = !ticket.assignedTo;
      } else if (activeView === "active") {
        matchesView = ticket.status === "Open" || ticket.status === "In Progress";
      } else if (activeView === "assigned") {
        matchesView = !!ticket.assignedTo;
      } else if (activeView === "high_priority") {
        matchesView = ticket.priority === "High";
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesView && matchesDirection
    }).sort((a, b) => {
      const aValue = a[sortBy] ?? ""
      const bValue = b[sortBy] ?? ""

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [search, statusFilter, priorityFilter, directionFilter, sortBy, sortOrder, activeView])

  const toggleSort = (field: keyof Ticket) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowDetails(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-emerald-500 text-white shadow-emerald-500/20"
      case "In Progress": return "bg-amber-500 text-white shadow-amber-500/20"
      case "Closed": return "bg-rose-500 text-white shadow-rose-500/20"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Open": return "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      case "In Progress": return "border-amber-500/20 bg-amber-500/5 text-amber-600"
      case "Closed": return "border-rose-500/20 bg-rose-500/5 text-rose-600"
      default: return ""
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High": return "text-rose-500 bg-rose-500/10 border-rose-500/20"
      case "Medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
      case "Low": return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      default: return "text-muted-foreground bg-secondary/50"
    }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === "outbound") {
      return <PhoneOutgoing className="h-3 w-3 text-blue-500" />
    } else if (direction === "missed") {
      return <PhoneMissed className="h-3 w-3 text-rose-500" />
    } else {
      return <PhoneIncoming className="h-3 w-3 text-emerald-500" />
    }
  }
  
  const getDirectionText = (direction: string) => {
    return direction === "outbound" ? "Outbound" : 
           direction === "missed" ? "Missed" : 
           "Inbound"
  }

  // Función para determinar si es Onboarding basado en el número (simulado)
  // En producción, esto vendría de tu lógica de negocio
  const getCampaignFromType = (type: string) => {
    return type === "Onboarding" ? "Onboarding" : "AR"
  }

  // Función para obtener el color de la campaña
 /* const getCampaignColor = (campaign: string) => {
    return campaign === "Onboarding" 
      ? "text-blue-600 bg-blue-50 border-blue-200" 
      : "text-purple-600 bg-purple-50 border-purple-200"
  }*/

  return (
    <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">

      {/* --- LEFT SIDEBAR (FILTERS & VIEWS) --- */}
      <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold tracking-tight">Ticketing</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="glass-card rounded-xl p-3 space-y-1">
          <Button
            variant={activeView === 'all' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm font-medium"
            onClick={() => setActiveView('all')}
          >
            <Inbox className="mr-2 h-4 w-4" />
            All Tickets
            <span className="ml-auto text-xs text-muted-foreground">{mockTickets.length}</span>
          </Button>
          <Button
            variant={activeView === 'active' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm font-medium"
            onClick={() => setActiveView('active')}
          >
            <AlertCircle className="mr-2 h-4 w-4 text-emerald-500" />
            Open
            <span className="ml-auto text-xs text-muted-foreground">
              {mockTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}
            </span>
          </Button>
          <Button
            variant={activeView === 'assigned' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm font-medium"
            onClick={() => setActiveView('assigned')}
          >
            <User className="mr-2 h-4 w-4 text-emerald-500" />
            Assigned
            <span className="ml-auto text-xs text-muted-foreground">
              {mockTickets.filter(t => !!t.assignedTo).length}
            </span>
          </Button>
          <Button
            variant={activeView === 'assigned_me' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm font-medium"
            onClick={() => setActiveView('assigned_me')}
          >
            <User className="mr-2 h-4 w-4" />
            My Tickets
            <span className="ml-auto text-xs text-muted-foreground">
              {mockTickets.filter(t => t.assignedTo === 'Agent Smith').length}
            </span>
          </Button>
          <Button
            variant={activeView === 'unassigned' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm font-medium"
            onClick={() => setActiveView('unassigned')}
          >
            <Hash className="mr-2 h-4 w-4" />
            Unassigned
            <span className="ml-auto text-xs text-muted-foreground">
              {mockTickets.filter(t => !t.assignedTo).length}
            </span>
          </Button>
          <Button
            variant={activeView === 'high_priority' ? 'secondary' : 'ghost'}
            className="w-full justify-start text-sm font-medium"
            onClick={() => setActiveView('high_priority')}
          >
            <Star className="mr-2 h-4 w-4 text-rose-500" />
            High Priority
            <span className="ml-auto text-xs text-muted-foreground">
              {mockTickets.filter(t => t.priority === 'High').length}
            </span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm font-medium text-muted-foreground">
            <Archive className="mr-2 h-4 w-4" />
            Archived
          </Button>
        </div>

        <div className="glass-card rounded-xl p-4 space-y-4 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Filters</h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-8 text-xs bg-background/50">
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full h-8 text-xs bg-background/50">
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Direction</label>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-full h-8 text-xs bg-background/50">
                  <SelectValue placeholder="All Directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden pt-1">

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets by ID, name, or phone number..."
              className="pl-9 bg-background border-border/50 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
       
        </div>

        {/* Table Content */}
        <div className="flex-1 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="w-[80px] font-bold text-xs uppercase tracking-wider pl-4">ID</TableHead>
                  <TableHead className="w-[150px] font-bold text-xs uppercase tracking-wider">Name</TableHead>
                  <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider">Number</TableHead>
                  <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider">Campaign</TableHead>
                  <TableHead className="w-[140px] font-bold text-xs uppercase tracking-wider">Assignee</TableHead>
                  <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider">Priority</TableHead>
                  <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider">Created</TableHead>
                  <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider text-right pr-4">Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-[400px] text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="h-12 w-12 opacity-10" />
                        <p>No tickets found in this view.</p>
                        <Button variant="link" onClick={() => { 
                          setSearch(''); 
                          setStatusFilter('all'); 
                          setPriorityFilter('all');
                          setDirectionFilter('all');
                        }}>Clear filters</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="border-b border-border/40 hover:bg-muted/30 cursor-pointer transition-colors group"
                      onClick={() => handleViewDetails(ticket)}
                    >
                      <TableCell className="font-mono text-xs font-medium text-muted-foreground group-hover:text-primary pl-4">
                        #{ticket.id.split('-')[1]}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground/90">
                          {ticket.clientName || <span className="text-muted-foreground italic">-</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground/90">{ticket.phone}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                        //  className={`text-xs ${getCampaignColor(getCampaignFromType(ticket.type))}`}
                        >
                          {getCampaignFromType(ticket.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 border border-border/50">
                              <AvatarImage src={`/avatars/${ticket.assignedTo.toLowerCase().replace(' ', '-')}.jpg`} />
                              <AvatarFallback className="text-[8px]">{ticket.assignedTo.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-foreground/70">{ticket.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.priority === 'High' && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5">High</Badge>
                        )}
                        {ticket.priority === 'Medium' && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Medium</Badge>
                        )}
                        {ticket.priority === 'Low' && (
                          <span className="text-xs text-muted-foreground">Low</span>
                        )}
                        {!ticket.priority && (
                          <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {getDirectionIcon(ticket.direction || 'inbound')}
                          <span className={`text-xs font-medium ${
                            (ticket.direction || 'inbound') === 'missed' 
                              ? 'text-rose-600' 
                              : (ticket.direction || 'inbound') === 'outbound'
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}>
                            {getDirectionText(ticket.direction || 'inbound')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Simple Footer Pagination for Table */}
          <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {filteredTickets.length} tickets</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILS SHEET --- */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-l border-border/50">
          {selectedTicket ? (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{selectedTicket.id}</Badge>
                    <div className="flex items-center gap-1">
                      {getDirectionIcon(selectedTicket.direction || 'inbound')}
                      <span className={`text-xs font-medium ${
                        (selectedTicket.direction || 'inbound') === 'missed' 
                          ? 'text-rose-600' 
                          : (selectedTicket.direction || 'inbound') === 'outbound'
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                      }`}>
                        {getDirectionText(selectedTicket.direction || 'inbound')}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold">
                  {selectedTicket.clientName || 'Unknown Caller'}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <span className="font-medium">{selectedTicket.phone}</span>
                  <span>•</span>
                  <Badge 
                    variant="outline" 
                  //  className={`${getCampaignColor(getCampaignFromType(selectedTicket.type))}`}
                  >
                    {getCampaignFromType(selectedTicket.type)}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="py-8 space-y-8">
                {/* Primary Actions */}
  
                {/* Metadata Card */}
                <div className="glass-card rounded-xl p-4 border border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Ticket Metadata</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Assignee</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">
                            {selectedTicket.assignedTo ? selectedTicket.assignedTo.substring(0, 2).toUpperCase() : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{selectedTicket.assignedTo || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Priority</span>
                      <div className="flex items-center">
                        <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority || 'Not set'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Direction</span>
                      <div className="flex items-center gap-1">
                        {getDirectionIcon(selectedTicket.direction || 'inbound')}
                        <span className={`text-sm font-medium ${
                          (selectedTicket.direction || 'inbound') === 'missed' 
                            ? 'text-rose-600' 
                            : (selectedTicket.direction || 'inbound') === 'outbound'
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }`}>
                          {getDirectionText(selectedTicket.direction || 'inbound')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Campaign</span>
                      <Badge 
                        variant="outline" 
                      // className={`${getCampaignColor(getCampaignFromType(selectedTicket.type))}`}
                      >
                        {getCampaignFromType(selectedTicket.type)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Opened</span>
                      <p className="text-sm">
                        {new Date(selectedTicket.createdAt).toLocaleString("en-US", { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Duration</span>
                      <p className="text-sm font-mono tracking-tight">{selectedTicket.callDuration || '0:00'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-medium">Aircall ID</span>
                      <p className="text-sm font-mono">{selectedTicket.aircallId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Placeholder Activity Stream */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Activity Stream
                  </h4>
                  <div className="relative pl-4 border-l-2 border-border/40 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-blue-500"></div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">System</span> created this ticket via {getDirectionText(selectedTicket.direction || 'inbound')} call
                        </p>
                        <p className="text-xs text-muted-foreground text-[10px]">
                          {new Date(selectedTicket.createdAt).toLocaleString("en-US")}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-zinc-400"></div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">{selectedTicket.assignedTo || 'Agent'}</span> viewed details
                        </p>
                        <p className="text-xs text-muted-foreground text-[10px]">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-auto">
                <Button variant="ghost" className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                  Archive Ticket
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}