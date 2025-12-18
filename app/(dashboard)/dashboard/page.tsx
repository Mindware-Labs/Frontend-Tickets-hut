"use client"

import { useState, useEffect } from "react"
import KPICard from "@/components/dashboard/kpi-card"
import ChartCard from "@/components/dashboard/chart-card"
import BarChart from "@/components/dashboard/bar-chart"
import LineChart from "@/components/dashboard/line-chart"
import { TicketActions } from "@/components/dashboard/ticket-actions"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { useRealTimeSimulation } from "@/hooks/use-real-time-simulation"
import { getTicketsByCampaign, getTicketsByType, getCallsPerDay, mockTickets } from "@/lib/mock-data"
import {
  Phone,
  Ticket as TicketIcon,
  CheckCircle2,
  CircleDollarSign,
  Calendar,
  RotateCcw,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const { stats } = useRealTimeSimulation()
  const campaignData = getTicketsByCampaign()
  const typeData = getTicketsByType()
  const callsData = getCallsPerDay()
  const recentTickets = mockTickets.slice(0, 5)

  useEffect(() => {
    // Force a small delay to simulate loading or hydration smoothing
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time insights and performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground border border-border/50">
            <Calendar className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Refreshing data...")}
            className="h-9 hidden md:flex"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* --- KPIS --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Calls"
          value={stats.totalCalls}
          secondaryValue="98.2% Answer rate"
          icon={Phone}
          iconBg="bg-blue-500"
          trend="+12.5%"
          trendUp={true}
        />
        <KPICard
          title="Active Tickets"
          value={stats.ticketsCreated}
          secondaryValue="14 critical priority"
          icon={TicketIcon}
          iconBg="bg-violet-500"
          trend="+8.2%"
          trendUp={true}
        />
        <KPICard
          title="Success Rate"
          value={`${stats.ticketsCreated > 0 ? Math.round((stats.closedTickets / stats.ticketsCreated) * 100) : 0}%`}
          secondaryValue="Target: 85%"
          icon={CheckCircle2}
          iconBg="bg-emerald-500"
          trend="+5.4%"
          trendUp={true}
        />
        <KPICard
          title="Revenue Hub"
          value={`$${stats.arPayments.toLocaleString()}`}
          secondaryValue="Pending: $3,500"
          icon={CircleDollarSign}
          iconBg="bg-amber-500"
          trend="-15.3%"
          trendUp={false}
        />
      </div>

      {/* --- ANALYTICS --- */}
      <div className="space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-secondary/30 p-1">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
              <TabsTrigger value="agents" className="text-xs">Agents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <ChartCard title="Call Volume Trends">
                  <LineChart data={callsData} />
                </ChartCard>
              </div>
              <div className="col-span-3">
                <ChartCard title="Workflow Distribution">
                  <BarChart data={typeData} color="oklch(0.65 0.18 160)" />
                </ChartCard>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="campaigns">
            <div className="grid grid-cols-1">
              <ChartCard title="Campaign Performance">
                <BarChart data={campaignData} color="var(--color-primary)" />
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- RECENT TICKETS (Replaces Operation Center) --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
          <Button variant="ghost" className="text-xs text-primary hover:text-primary/80" asChild>
            <a href="/tickets">View all tickets &rarr;</a>
          </Button>
        </div>

        <div className="table-modern-wrapper">
          <Table>
            <TableHeader className="bg-muted/30 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-b border-white/5">
                <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider">ID</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Client</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map((ticket) => (
                <TableRow key={ticket.id} className="table-modern-row border-b border-white/5 last:border-0 group">
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    #{ticket.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground/90">{ticket.clientName}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-background/50 backdrop-blur-md border-border/40">
                      {ticket.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`
                                    text-[10px] font-bold px-2 py-0.5 shadow-sm
                                    ${ticket.status === 'Open' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                        ticket.status === 'In Progress' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                          'bg-emerald-500 text-white shadow-emerald-500/20'}
                                `}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TicketActions ticketId={ticket.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
