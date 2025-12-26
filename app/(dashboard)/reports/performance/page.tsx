'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Download,
  Calendar,
  Phone,
  CheckCircle,
  Timer,
  Users,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type ReportData = {
  period: {
    label: string
    start: string
    end: string
  }
  kpis: {
    totalCalls: number
    closedTickets: number
    openTickets: number
    resolutionRate: number
    avgDurationSeconds: number
    activeAgents: number
  }
  callsByDay: { date: string; day: string; total: number; closed: number }[]
  dispositionBreakdown: { name: string; value: number }[]
  campaignBreakdown: { name: string; value: number }[]
  statusBreakdown: { name: string; value: number }[]
  agentPerformance: {
    id: number
    name: string
    totalTickets: number
    closedTickets: number
    avgDurationSeconds: number
  }[]
}

const DISPOSITION_COLORS = [
  'oklch(0.65 0.18 160)',
  'oklch(0.75 0.18 85)',
  'var(--color-primary)',
  'oklch(0.65 0.22 25)',
  'oklch(0.72 0.16 250)',
]

export default function PerformancePage() {
  const [period, setPeriod] = useState('7d')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/performance?period=${period}`)
      const result = await response.json()
      if (result?.success) {
        setReport(result.data)
      } else {
        setReport(null)
        toast({
          title: 'Error',
          description: result?.message || 'Failed to load report data',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setReport(null)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load report data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [period])

  const formattedDuration = (seconds: number) => {
    if (!seconds) return '0s'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const callsChartData = report?.callsByDay || []
  const dispositionData = report?.dispositionBreakdown || []
  const topAgents = report?.agentPerformance.slice(0, 5) || []

  const totalClosed = report?.kpis.closedTickets || 0

  const exportExcel = () => {
    if (!report) return
    const wb = XLSX.utils.book_new()

    const summary = [
      ['Metric', 'Value'],
      ['Total Calls', report.kpis.totalCalls],
      ['Closed Tickets', report.kpis.closedTickets],
      ['Open Tickets', report.kpis.openTickets],
      ['Resolution Rate', `${report.kpis.resolutionRate}%`],
      ['Avg Call Duration', formattedDuration(report.kpis.avgDurationSeconds)],
      ['Active Agents', report.kpis.activeAgents],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summary)
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

    const callsSheet = XLSX.utils.json_to_sheet(
      report.callsByDay.map((row) => ({
        Date: row.date,
        Day: row.day,
        Calls: row.total,
        Closed: row.closed,
      }))
    )
    XLSX.utils.book_append_sheet(wb, callsSheet, 'Calls')

    const dispositionSheet = XLSX.utils.json_to_sheet(report.dispositionBreakdown)
    XLSX.utils.book_append_sheet(wb, dispositionSheet, 'Disposition')

    const agentSheet = XLSX.utils.json_to_sheet(
      report.agentPerformance.map((agent) => ({
        Agent: agent.name,
        Total: agent.totalTickets,
        Closed: agent.closedTickets,
        AvgDuration: formattedDuration(agent.avgDurationSeconds),
      }))
    )
    XLSX.utils.book_append_sheet(wb, agentSheet, 'Agents')

    XLSX.writeFile(wb, `performance_report_${period}.xlsx`)
  }

  const exportPdf = () => {
    if (!report) return
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Performance Report', 14, 18)
    doc.setFontSize(10)
    doc.text(`Period: ${report.period.label}`, 14, 26)
    doc.text(`Range: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`, 14, 32)

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Calls', report.kpis.totalCalls],
        ['Closed Tickets', report.kpis.closedTickets],
        ['Open Tickets', report.kpis.openTickets],
        ['Resolution Rate', `${report.kpis.resolutionRate}%`],
        ['Avg Call Duration', formattedDuration(report.kpis.avgDurationSeconds)],
        ['Active Agents', report.kpis.activeAgents],
      ],
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Date', 'Day', 'Calls', 'Closed']],
      body: report.callsByDay.map((row) => [row.date, row.day, row.total, row.closed]),
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Disposition', 'Count']],
      body: report.dispositionBreakdown.map((row) => [row.name, row.value]),
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Agent', 'Total Tickets', 'Closed', 'Avg Duration']],
      body: report.agentPerformance.map((agent) => [
        agent.name,
        agent.totalTickets,
        agent.closedTickets,
        formattedDuration(agent.avgDurationSeconds),
      ]),
    })

    doc.save(`performance_report_${period}.pdf`)
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!report) return
    if (format === 'pdf') {
      exportPdf()
    } else {
      exportExcel()
    }
  }

  const dateLabel = report
    ? `${new Date(report.period.start).toLocaleDateString()} - ${new Date(
        report.period.end
      ).toLocaleDateString()}`
    : ''

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Report</h1>
          <p className="text-sm text-muted-foreground">
            Operational metrics and campaign performance overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={!report}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> PDF
          </Button>

          <Button onClick={() => handleExport('excel')} disabled={!report} className="gap-2">
            <Download className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading report...
        </div>
      ) : !report ? (
        <div className="text-sm text-muted-foreground">
          No data available for the selected period.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{report.period.label}</span>
            <span>{dateLabel}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">
                    {report.kpis.totalCalls}
                  </h3>
                </div>
                <div className="p-2 bg-secondary/40 rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {report.kpis.openTickets} open tickets
              </div>
            </div>

            <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">
                    {report.kpis.resolutionRate}%
                  </h3>
                </div>
                <div className="p-2 bg-secondary/40 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {report.kpis.closedTickets} closed tickets
              </div>
            </div>

            <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Call Duration</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">
                    {formattedDuration(report.kpis.avgDurationSeconds)}
                  </h3>
                </div>
                <div className="p-2 bg-secondary/40 rounded-lg">
                  <Timer className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Active agents: {report.kpis.activeAgents}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-background p-6 rounded-xl border border-border/50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Call Activity
                </h3>
                <span className="text-xs text-muted-foreground">
                  Total calls: {report.kpis.totalCalls}
                </span>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callsChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      name="Total Calls"
                      fill="oklch(0.75 0.18 85)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="closed"
                      name="Closed"
                      fill="oklch(0.65 0.18 160)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Workflow Breakdown
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Disposition split by total tickets
              </p>

              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dispositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {dispositionData.map((entry, i) => (
                        <Cell key={entry.name} fill={DISPOSITION_COLORS[i % DISPOSITION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {totalClosed}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Closed tickets
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {dispositionData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: DISPOSITION_COLORS[index % DISPOSITION_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Campaign Mix</h3>
              <div className="space-y-3">
                {report.campaignBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-background p-6 rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Top Agents</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {report.kpis.activeAgents} active
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase">
                      <th className="pb-2">Agent</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-right">Closed</th>
                      <th className="pb-2 text-right">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {topAgents.length ? (
                      topAgents.map((agent) => (
                        <tr key={agent.id} className="text-sm">
                          <td className="py-3 text-foreground font-medium">
                            {agent.name}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {agent.totalTickets}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {agent.closedTickets}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {formattedDuration(agent.avgDurationSeconds)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-6 text-center text-sm text-muted-foreground" colSpan={4}>
                          No agent activity in this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
