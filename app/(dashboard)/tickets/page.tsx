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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
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
  Building
} from "lucide-react"
import {
  mockTickets,
  type Ticket
} from "@/lib/mock-data"
import { YARDS, YARD_CATEGORIES, type Yard, type YardType } from "@/lib/yard-data"

// Extender el tipo Ticket
declare module "@/lib/mock-data" {
  interface Ticket {
    issueDetail?: string
    yard?: string
    yardId?: string
    yardType?: YardType
  }
}

export default function TicketsPage() {
  const [search, setSearch] = useState("")
  const [activeView, setActiveView] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [directionFilter, setDirectionFilter] = useState("all")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [selectedYardId, setSelectedYardId] = useState<string>("")
  const [isAssigningYard, setIsAssigningYard] = useState(false)
  const [issueDetail, setIssueDetail] = useState("")
  const [isEditingIssue, setIsEditingIssue] = useState(false)
  const [yardSearch, setYardSearch] = useState("")
  const [yardCategory, setYardCategory] = useState<string>("all")

  // Obtener yarda seleccionada
  const selectedYard = useMemo(() => {
    return YARDS.find(y => y.id === selectedYardId)
  }, [selectedYardId])

  // Obtener yarda actual del ticket
  const currentYard = useMemo(() => {
    if (!selectedTicket?.yardId) return null
    return YARDS.find(y => y.id === selectedTicket.yardId)
  }, [selectedTicket?.yardId])

  // Filtrar yardas
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
    return mockTickets.filter(ticket => {
      const matchesSearch =
        (ticket.clientName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (ticket.yard?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
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
    })
  }, [search, statusFilter, priorityFilter, directionFilter, activeView])

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setSelectedYardId(ticket.yardId || "")
    setIssueDetail(ticket.issueDetail || "")
    setIsEditingIssue(false)
    setShowDetails(true)
    setYardSearch("")
    setYardCategory("all")
  }

  const handleAssignYard = async () => {
    if (!selectedTicket || !selectedYardId) return

    // Función para resaltar coincidencias en el texto
const highlightMatch = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  const lowerText = text.toString().toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  
  // Si no hay coincidencia, devolver el texto normal
  if (!lowerText.includes(lowerSearch)) {
    return text;
  }
  
  // Dividir el texto en partes que coinciden y no coinciden
  const regex = new RegExp(`(${searchTerm})`, 'gi');
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

    setIsAssigningYard(true)

    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Actualizar el ticket localmente
    if (selectedTicket && selectedYard) {
      selectedTicket.yardId = selectedYardId
      selectedTicket.yard = `${selectedYard.name} - ${selectedYard.city}, ${selectedYard.state}`
      selectedTicket.yardType = selectedYard.type
    }

    setIsAssigningYard(false)
  }

  const handleSaveIssueDetail = () => {
    if (!selectedTicket) return

    // Actualizar el ticket localmente
    if (selectedTicket) {
      selectedTicket.issueDetail = issueDetail
    }

    setIsEditingIssue(false)
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
    }
    else {
      return <PhoneIncoming className="h-3 w-3 text-emerald-500" />
    }
  }

  const getDirectionText = (direction: string) => {
    return direction === "outbound" ? "Outbound" : "Inbound"
  }

  const getCampaignFromType = (type: string) => {
    return type === "Onboarding" ? "Onboarding" : "AR"
  }

  const getYardTypeColor = (type?: YardType) => {
    switch (type) {
      case 'full_service':
        return 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
      case 'saas':
        return 'border-purple-500/20 bg-purple-500/5 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400'
      default:
        return 'border-gray-500/20 bg-gray-500/5 text-gray-600'
    }
  }

  const getYardTypeIcon = (type?: YardType) => {
    switch (type) {
      case 'full_service':
        return <Users className="h-3 w-3" />
      case 'saas':
        return <Sparkles className="h-3 w-3" />
      default:
        return <Building className="h-3 w-3" />
    }
  }

  // Obtener yard display name para la tabla
  const getYardDisplayName = (ticket: Ticket) => {
    if (!ticket.yardId) return null
    const yard = YARDS.find(y => y.id === ticket.yardId)
    return yard ? `${yard.name} - ${yard.city}, ${yard.state}` : ticket.yard
  }

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
            variant={activeView === 'all' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('all')}
          >
            <Inbox className="mr-2 h-4 w-4" />
            All Tickets
            <span className="ml-auto text-xs">{mockTickets.length}</span>
          </Button>
          <Button
            variant={activeView === 'active' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('active')}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Open
            <span className="ml-auto text-xs">
              {mockTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length}
            </span>
          </Button>
          <Button
            variant={activeView === 'assigned' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('assigned')}
          >
            <User className="mr-2 h-4 w-4" />
            Assigned
            <span className="ml-auto text-xs">
              {mockTickets.filter(t => !!t.assignedTo).length}
            </span>
          </Button>
          <Button
            variant={activeView === 'assigned_me' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('assigned_me')}
          >
            <User className="mr-2 h-4 w-4" />
            My Tickets
            <span className="ml-auto text-xs">
              {mockTickets.filter(t => t.assignedTo === 'Agent Smith').length}
            </span>
          </Button>
          <Button
            variant={activeView === 'unassigned' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('unassigned')}
          >
            <Hash className="mr-2 h-4 w-4" />
            Unassigned
            <span className="ml-auto text-xs">
              {mockTickets.filter(t => !t.assignedTo).length}
            </span>
          </Button>
          <Button
            variant={activeView === 'high_priority' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('high_priority')}
          >
            <Star className="mr-2 h-4 w-4" />
            High Priority
            <span className="ml-auto text-xs">
              {mockTickets.filter(t => t.priority === 'High').length}
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
            <RefreshCw className="h-4 w-4" />
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
                {filteredTickets.map((ticket) => {
                  const yardDisplayName = getYardDisplayName(ticket)
                  const yard = YARDS.find(y => y.id === ticket.yardId)

                  return (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(ticket)}
                    >
                      <TableCell className="font-mono text-xs">
                        #{ticket.id.split('-')[1]}
                      </TableCell>
                      <TableCell>
                        {ticket.clientName || '-'}
                      </TableCell>
                      <TableCell>
                        {yard ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={`${getYardTypeColor(yard.type)}`}>
                              <div className="flex items-center gap-1">
                                {getYardTypeIcon(yard.type)}
                                <span className="truncate max-w-[100px]">
                                  {yard.name}
                                </span>
                              </div>
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate">
                              {yard.city}, {yard.state}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-600">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.phone}
                      </TableCell>
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
                                {ticket.assignedTo.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ticket.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.priority ? (
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDirectionIcon(ticket.direction || 'inbound')}
                          <span className="text-xs">
                            {getDirectionText(ticket.direction || 'inbound')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
            <DialogTitle className="text-xl">
              Ticket Details
            </DialogTitle>
          </div>
          <DialogDescription>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedTicket.clientName ?
                    selectedTicket.clientName.substring(0, 2).toUpperCase() :
                    'UC'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedTicket.clientName || 'Unknown Caller'}</div>
                <div className="text-sm text-muted-foreground">{selectedTicket.phone}</div>
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
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="outline" className={getStatusBadgeColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority || 'Not set'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Assignee</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {selectedTicket.assignedTo ?
                          selectedTicket.assignedTo.substring(0, 2).toUpperCase() :
                          'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedTicket.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Direction</p>
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(selectedTicket.direction || 'inbound')}
                    <span>{getDirectionText(selectedTicket.direction || 'inbound')}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Campaign</p>
                  <Badge variant="outline">{getCampaignFromType(selectedTicket.type)}</Badge>
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
                        <div className={`p-2 rounded-lg ${getYardTypeColor(currentYard.type)}`}>
                          {getYardTypeIcon(currentYard.type)}
                        </div>
                        <div>
                          <p className="font-medium">{currentYard.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {currentYard.city}, {currentYard.state}
                          </p>
                          <Badge variant="outline" className={`mt-1 ${getYardTypeColor(currentYard.type)}`}>
                            {currentYard.type === 'full_service' ? 'Full Service' : 'SAAS'}
                          </Badge>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                )}

                {/* Buscador de yardas */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Yard</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, address, city, state, phone, or zip..."
                        className="pl-9"
                        value={yardSearch}
                        onChange={(e) => {
                          const newSearch = e.target.value;
                          setYardSearch(newSearch);
                          
                          // Si el usuario empieza a escribir de nuevo, limpiamos la selección
                          if (newSearch && selectedYardId && !newSearch.toLowerCase().includes(selectedYard?.name?.toLowerCase() || '')) {
                            setSelectedYardId("");
                          }
                        }}
                        onKeyDown={(e) => {
                          // Si presiona Escape, limpia la búsqueda
                          if (e.key === 'Escape') {
                            setYardSearch("");
                            setSelectedYardId("");
                          }
                        }}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge variant="outline" className="text-xs">
                          {selectedYardId ? "1 selected" : `${filteredYards.length} found`}
                        </Badge>
                      </div>
                      
                    
                    </div>
                  </div>

                  {/* MOSTRAR SOLO LA YARDA SELECCIONADA */}
                  {selectedYard && !yardSearch && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getYardTypeColor(selectedYard.type)}`}>
                            {getYardTypeIcon(selectedYard.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{selectedYard.name}</p>
                              <Badge variant="outline" className={getYardTypeColor(selectedYard.type)}>
                                {selectedYard.type === 'full_service' ? 'Full Service' : 'SAAS'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {selectedYard.address ? `${selectedYard.address}, ` : ''}
                              {selectedYard.city}, {selectedYard.state} {selectedYard.zip}
                            </p>
                            
                            {selectedYard.contactPhone && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <span className="font-medium">Contact:</span>
                                <span>{selectedYard.contactPhone}</span>
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

                  {/* MOSTRAR OPCIONES SOLO CUANDO HAY BÚSQUEDA Y NO HAY YARDA SELECCIONADA */}
                  {yardSearch && !selectedYardId && filteredYards.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Select a Yard</Label>
                      <ScrollArea className="h-64 rounded-md border">
                        <div className="p-2">
                          {filteredYards.map((yard) => (
                            <div
                              key={yard.id}
                              className="p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-muted/50 bg-card border"
                              onClick={() => {
                                // Al hacer clic, selecciona la yarda y limpia la búsqueda
                                setSelectedYardId(yard.id);
                                setYardSearch("");
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${getYardTypeColor(yard.type)}`}>
                                  {getYardTypeIcon(yard.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{yard.name}</p>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${getYardTypeColor(yard.type)}`}
                                    >
                                      {yard.type === 'full_service' ? 'FS' : 'SAAS'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {yard.address ? `${yard.address}, ` : ''}
                                    {yard.city}, {yard.state} {yard.zip}
                                  </p>
                                  {yard.contactPhone && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      📞 {yard.contactPhone}
                                    </p>
                                  )}
                                  {yard.features && yard.features.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {yard.features.slice(0, 2).map((feature, index) => (
                                        <span
                                          key={index}
                                          className="text-[10px] px-1.5 py-0.5 bg-muted rounded"
                                        >
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* MENSAJE CUANDO NO HAY RESULTADOS */}
                  {yardSearch && !selectedYardId && filteredYards.length === 0 && (
                    <div className="p-6 text-center border rounded-lg">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-muted-foreground">No yards found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}

                  {/* Botón para resetear (solo para visualización, no guarda) */}
                  {selectedTicket.yardId && selectedYardId !== selectedTicket.yardId && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedYardId(selectedTicket.yardId || "");
                          setYardSearch("");
                        }}
                        className="w-full"
                      >
                        Reset to Current Yard
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
               {/* Issue Detail  */}
        
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button 
            onClick={async () => {
              // 1. Guardar issue detail si está en modo edición
              if (isEditingIssue && selectedTicket) {
                selectedTicket.issueDetail = issueDetail;
                setIsEditingIssue(false);
              }
              
              // 2. Guardar yard assignment si hay una yarda seleccionada
              if (selectedYardId && selectedTicket && selectedYardId !== selectedTicket.yardId) {
                setIsAssigningYard(true);
                
                // Simular llamada a API
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Actualizar el ticket
                if (selectedYard) {
                  selectedTicket.yardId = selectedYardId;
                  selectedTicket.yard = `${selectedYard.name} - ${selectedYard.city}, ${selectedYard.state}`;
                  selectedTicket.yardType = selectedYard.type;
                }
                
                setIsAssigningYard(false);
              }
              
              // 3. Cerrar el diálogo
              setShowDetails(false);
            }}
            disabled={isAssigningYard}
          >
            {isAssigningYard ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  )
}