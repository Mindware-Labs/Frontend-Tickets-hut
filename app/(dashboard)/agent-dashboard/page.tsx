"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import KPICard from "@/components/dashboard/kpi-card";
import { TicketActions } from "@/components/dashboard/ticket-actions";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import {
  Ticket as TicketIcon,
  Calendar,
  RotateCcw,
  TrendingUp,
  User,
  Clock,
  Target,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FiPhoneCall, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRole } from "@/components/providers/role-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

type DashboardTicket = {
  id: number;
  clientName: string;
  campaign: string;
  status: string;
  createdAt: string;
};

type DashboardData = {
  generatedAt: string;
  kpis: {
    totalCalls: number;
    totalTickets: number;
    activeTickets: number;
    openTickets: number;
    inProgressTickets: number;
    closedTickets: number;
    pendingActions: number;
    resolutionRate: number;
    callsLast7Days: number;
  };
  charts: {
    callsByDay: { day: string; calls: number }[];
    ticketsByCampaign: { name: string; count: number }[];
    ticketsByDisposition: { name: string; count: number }[];
  };
  recentTickets: DashboardTicket[];
};

const RADIAL_PALETTE = [
  "oklch(0.65 0.18 160)",
  "oklch(0.75 0.18 85)",
  "var(--color-primary)",
  "oklch(0.65 0.22 25)",
  "oklch(0.72 0.16 250)",
];

export default function AgentDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const response = await fetch("/api/dashboard/agent-stats", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const payload = await response.json();
      if (!payload?.success) {
        throw new Error(payload?.message || "Unable to load dashboard data.");
      }
      setDashboardData(payload.data);
    } catch (error: any) {
      setLoadError(error.message || "Unable to load dashboard data.");
      toast.error("Failed to load dashboard data.", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const callsData = useMemo(
    () =>
      dashboardData?.charts.callsByDay?.length
        ? dashboardData.charts.callsByDay
        : [
            { day: "Mon", calls: 0 },
            { day: "Tue", calls: 0 },
            { day: "Wed", calls: 0 },
            { day: "Thu", calls: 0 },
            { day: "Fri", calls: 0 },
            { day: "Sat", calls: 0 },
            { day: "Sun", calls: 0 },
          ],
    [dashboardData]
  );

  const typeData = useMemo(
    () =>
      dashboardData?.charts.ticketsByDisposition?.length
        ? dashboardData.charts.ticketsByDisposition
        : [{ name: "No data", count: 0 }],
    [dashboardData]
  );

  const campaignData = useMemo(
    () =>
      dashboardData?.charts.ticketsByCampaign?.length
        ? dashboardData.charts.ticketsByCampaign
        : [{ name: "No data", count: 0 }],
    [dashboardData]
  );

  const lineChartConfig = useMemo<ChartConfig>(
    () => ({
      calls: {
        label: "Calls",
        color: "oklch(0.75 0.18 85)",
      },
    }),
    []
  );

  const campaignChartConfig = useMemo<ChartConfig>(
    () => ({
      tickets: {
        label: "Tickets",
        color: "#22d3ee",
      },
      label: {
        color: "var(--background)",
      },
    }),
    []
  );

  const radialData = useMemo(
    () =>
      typeData.map((item, index) => {
        const segmentKey = `segment-${index}`;
        return {
          name: item.name,
          count: item.count,
          segmentKey,
          fill: `var(--color-${segmentKey})`,
        };
      }),
    [typeData]
  );

  const radialChartConfig = useMemo<ChartConfig>(() => {
    return radialData.reduce((acc, item, index) => {
      acc[item.segmentKey] = {
        label: item.name,
        color: RADIAL_PALETTE[index % RADIAL_PALETTE.length],
      };
      return acc;
    }, {} as ChartConfig);
  }, [radialData]);

  const totalCallsLast7Days = useMemo(
    () => callsData.reduce((sum, item) => sum + item.calls, 0),
    [callsData]
  );

  const campaignChartData = useMemo(
    () =>
      campaignData.map((campaign) => ({
        name: campaign.name,
        tickets: campaign.count,
      })),
    [campaignData]
  );

  if (isLoading && !dashboardData) return <DashboardSkeleton />;

  if (!dashboardData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <FiAlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Dashboard Unavailable
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs text-center">
          {loadError || "No dashboard data available yet."}
        </p>
        <Button onClick={loadDashboard} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  const { kpis, charts, recentTickets, generatedAt } = dashboardData;

  const statusClass = (status: string) => {
    if (status === "Open")
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
    if (status === "In Progress")
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    if (status === "Resolved")
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    if (status === "Closed")
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6 p-1 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span>My Performance Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 ml-14">
              Track your daily activity and ticket resolution progress
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            className="h-9 shadow-sm"
          >
            <RotateCcw
              className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* --- MAIN METRICS ROW --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Large KPI Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tickets
                  </CardTitle>
                  <TicketIcon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpis.totalTickets}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.totalCalls} calls handled
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Resolution Rate
                  </CardTitle>
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpis.resolutionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.closedTickets} tickets closed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.activeTickets}</div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {kpis.openTickets} open
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.inProgressTickets}</div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Being worked on
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Urgent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {kpis.pendingActions}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  High priority
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Performance Summary Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calls (7d)</span>
                <span className="font-semibold">{totalCallsLast7Days}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-semibold flex items-center gap-1">
                  {kpis.resolutionRate}%
                  {kpis.resolutionRate >= 80 ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Closed</span>
                <span className="font-semibold">{kpis.closedTickets}</span>
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(generatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Weekly Activity
                </CardTitle>
                <CardDescription className="mt-1">
                  Your call volume over the last 7 days
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                <Calendar className="h-3 w-3" />
                <span>7 Days</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={lineChartConfig}
              className="h-[200px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={callsData}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="calls"
                  type="monotone"
                  stroke="var(--color-calls)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-calls)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              By disposition type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[200px] items-center justify-center">
            <ChartContainer
              config={radialChartConfig}
              className="mx-auto aspect-square max-h-[180px] w-full"
            >
              <RadialBarChart
                data={radialData}
                innerRadius={35}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="segmentKey"
                    />
                  }
                />
                <RadialBar
                  dataKey="count"
                  background
                  cornerRadius={6}
                />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Campaign Performance
          </CardTitle>
          <CardDescription>
            Your ticket distribution across different campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={campaignChartConfig}
            className="h-[180px] w-full aspect-auto"
          >
            <BarChart
              accessibilityLayer
              data={campaignChartData}
              layout="vertical"
              barCategoryGap={12}
              margin={{
                right: 16,
                left: 8,
              }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 15)}
                className="text-xs"
              />
              <XAxis dataKey="tickets" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="tickets"
                layout="vertical"
                fill="var(--color-tickets)"
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
              >
                <LabelList
                  dataKey="tickets"
                  position="right"
                  offset={8}
                  className="fill-foreground text-xs font-medium"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* --- RECENT TICKETS --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-muted-foreground">
                Your latest ticket assignments
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-transparent text-primary hover:text-primary/80 group"
            asChild
          >
            <a href="/tickets" className="flex items-center">
              View all
              <span className="ml-1 transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </Button>
        </div>

        <div className="rounded-xl border bg-card/50 text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="w-[80px] font-semibold text-xs text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">
                  CLIENT
                </TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">
                  CAMPAIGN
                </TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">
                  STATUS
                </TableHead>
                <TableHead className="text-right font-semibold text-xs text-muted-foreground">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.length ? (
                recentTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{ticket.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                          {ticket.clientName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/50">
                        {ticket.campaign}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                        text-[10px] font-semibold px-2.5 py-0.5 border rounded-full shadow-none
                        ${statusClass(ticket.status)}
                      `}
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TicketActions ticketId={String(ticket.id)} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No recent ticket activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

