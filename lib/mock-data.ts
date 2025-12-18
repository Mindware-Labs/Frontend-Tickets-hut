export interface Ticket {
  id: string
  clientName: string
  phone: string
  type: "Onboarding" | "AR"
  campaign: string
  status: "Open" | "In Progress" | "Closed"
  createdAt: string
  assignedTo?: string
  priority?: "Low" | "Medium" | "High"
  description?: string
  callDuration?: string
  aircallId?: string
}

export interface Campaign {
  id: string
  name: string
  ticketCount: number
  status: "Active" | "Paused" | "Completed"
  startDate: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "Admin" | "Supervisor" | "Agent"
  avatar?: string
  ticketsAssigned: number
  status: "Active" | "Inactive"
}

export const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    clientName: "John Smith",
    phone: "+1 (555) 123-4567",
    type: "Onboarding",
    campaign: "Spring Campaign 2024",
    status: "Open",
    createdAt: "2024-01-15T10:30:00",
    priority: "High",
    callDuration: "5:34",
    aircallId: "CALL-12345",
  },
  {
    id: "TKT-002",
    clientName: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    type: "AR",
    campaign: "Q1 Collections",
    status: "In Progress",
    createdAt: "2024-01-15T09:15:00",
    assignedTo: "Agent Smith",
    priority: "Medium",
    callDuration: "3:22",
    aircallId: "CALL-12346",
  },
  {
    id: "TKT-003",
    clientName: "Michael Brown",
    phone: "+1 (555) 345-6789",
    type: "Onboarding",
    campaign: "New Customer Outreach",
    status: "Closed",
    createdAt: "2024-01-14T14:20:00",
    assignedTo: "Agent Davis",
    priority: "Low",
    callDuration: "8:15",
    aircallId: "CALL-12347",
  },
  {
    id: "TKT-004",
    clientName: "Emily Davis",
    phone: "+1 (555) 456-7890",
    type: "AR",
    campaign: "Q1 Collections",
    status: "Open",
    createdAt: "2024-01-14T11:45:00",
    priority: "High",
    callDuration: "2:45",
    aircallId: "CALL-12348",
  },
  {
    id: "TKT-005",
    clientName: "Robert Wilson",
    phone: "+1 (555) 567-8901",
    type: "Onboarding",
    campaign: "Spring Campaign 2024",
    status: "In Progress",
    createdAt: "2024-01-13T16:30:00",
    assignedTo: "Agent Smith",
    priority: "Medium",
    callDuration: "6:10",
    aircallId: "CALL-12349",
  },
]

export const mockCampaigns: Campaign[] = [
  {
    id: "CMP-001",
    name: "Spring Campaign 2024",
    ticketCount: 45,
    status: "Active",
    startDate: "2024-01-01",
  },
  {
    id: "CMP-002",
    name: "Q1 Collections",
    ticketCount: 32,
    status: "Active",
    startDate: "2024-01-01",
  },
  {
    id: "CMP-003",
    name: "New Customer Outreach",
    ticketCount: 28,
    status: "Active",
    startDate: "2024-01-05",
  },
  {
    id: "CMP-004",
    name: "Holiday Follow-up",
    ticketCount: 15,
    status: "Completed",
    startDate: "2023-12-01",
  },
]

export const mockUsers: User[] = [
  {
    id: "USR-001",
    name: "Agent Smith",
    email: "agent.smith@callcenter.com",
    role: "Agent",
    ticketsAssigned: 12,
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Agent Davis",
    email: "agent.davis@callcenter.com",
    role: "Agent",
    ticketsAssigned: 8,
    status: "Active",
  },
  {
    id: "USR-003",
    name: "Supervisor Jones",
    email: "supervisor.jones@callcenter.com",
    role: "Supervisor",
    ticketsAssigned: 5,
    status: "Active",
  },
  {
    id: "USR-004",
    name: "Admin Taylor",
    email: "admin.taylor@callcenter.com",
    role: "Admin",
    ticketsAssigned: 0,
    status: "Active",
  },
]

export const getDashboardStats = () => {
  const totalCalls = 342
  const ticketsCreated = mockTickets.length
  const onboardingCompleted = mockTickets.filter((t) => t.type === "Onboarding" && t.status === "Closed").length
  const arPayments = mockTickets.filter((t) => t.type === "AR" && t.status === "Closed").length
  const openTickets = mockTickets.filter((t) => t.status === "Open").length
  const closedTickets = mockTickets.filter((t) => t.status === "Closed").length

  return {
    totalCalls,
    ticketsCreated,
    onboardingCompleted,
    arPayments,
    openTickets,
    closedTickets,
  }
}

export const getTicketsByCampaign = () => {
  const campaignData: Record<string, number> = {}
  mockTickets.forEach((ticket) => {
    campaignData[ticket.campaign] = (campaignData[ticket.campaign] || 0) + 1
  })
  return Object.entries(campaignData).map(([name, count]) => ({ name, count }))
}

export const getTicketsByType = () => {
  const typeData: Record<string, number> = {}
  mockTickets.forEach((ticket) => {
    typeData[ticket.type] = (typeData[ticket.type] || 0) + 1
  })
  return Object.entries(typeData).map(([name, count]) => ({ name, count }))
}

export const getCallsPerDay = () => {
  return [
    { day: "Mon", calls: 45 },
    { day: "Tue", calls: 52 },
    { day: "Wed", calls: 48 },
    { day: "Thu", calls: 61 },
    { day: "Fri", calls: 55 },
    { day: "Sat", calls: 38 },
    { day: "Sun", calls: 43 },
  ]
}
