'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Download,
  Trophy,
  PhoneOutgoing,
  Users,
  Loader2,
  CheckCircle,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type AgentReport = {
  period: {
    label: string
    start: string
    end: string
  }
  kpis: {
    totalAgents: number
    totalTickets: number
    closedTickets: number
    openTickets: number
    resolutionRate: number
    avgDurationSeconds: number
  }
  topPerformers: {
    byVolume: AgentRow | null
    byResolution: AgentRow | null
    byDuration: AgentRow | null
  }
  agents: AgentRow[]
}

type AgentRow = {
  id: number
  name: string
  isActive?: boolean
  totalTickets: number
  closedTickets: number
  openTickets: number
  resolutionRate: number
  avgDurationSeconds: number
}

export default function AgentStatsPage() {
  const [period, setPeriod] = useState('7d')
  const [searchTerm, setSearchTerm] = useState('')
  const [report, setReport] = useState<AgentReport | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/agents?period=${period}`)
      const result = await response.json()
      if (result?.success) {
        setReport(result.data)
      } else {
        setReport(null)
        toast({
          title: 'Error',
          description: result?.message || 'Failed to load agent report',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setReport(null)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load agent report',
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

  const filteredAgents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!report?.agents) return []
    return report.agents.filter((agent) =>
      agent.name.toLowerCase().includes(term)
    )
  }, [report, searchTerm])

  const exportExcel = () => {
    if (!report) return
    const wb = XLSX.utils.book_new()

    const summary = [
      ['Metric', 'Value'],
      ['Total Agents', report.kpis.totalAgents],
      ['Total Tickets', report.kpis.totalTickets],
      ['Closed Tickets', report.kpis.closedTickets],
      ['Open Tickets', report.kpis.openTickets],
      ['Resolution Rate', `${report.kpis.resolutionRate}%`],
      ['Avg Duration', formattedDuration(report.kpis.avgDurationSeconds)],
    ]

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Summary')

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        report.agents.map((agent) => ({
          Agent: agent.name,
          Active: agent.isActive ? 'Yes' : 'No',
          Total: agent.totalTickets,
          Closed: agent.closedTickets,
          Open: agent.openTickets,
          Resolution: `${agent.resolutionRate}%`,
          AvgDuration: formattedDuration(agent.avgDurationSeconds),
        }))
      ),
      'Agents'
    )

    XLSX.writeFile(wb, `agents_report_${period}.xlsx`)
  }

  const exportPdf = () => {
    if (!report) return
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Agent Performance Report', 14, 18)
    doc.setFontSize(10)
    doc.text(`Period: ${report.period.label}`, 14, 26)
    doc.text(
      `Range: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(
        report.period.end
      ).toLocaleDateString()}`,
      14,
      32
    )

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Agents', report.kpis.totalAgents],
        ['Total Tickets', report.kpis.totalTickets],
        ['Closed Tickets', report.kpis.closedTickets],
        ['Open Tickets', report.kpis.openTickets],
        ['Resolution Rate', `${report.kpis.resolutionRate}%`],
        ['Avg Duration', formattedDuration(report.kpis.avgDurationSeconds)],
      ],
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [
        ['Agent', 'Active', 'Total', 'Closed', 'Open', 'Resolution', 'Avg Duration'],
      ],
      body: report.agents.map((agent) => [
        agent.name,
        agent.isActive ? 'Yes' : 'No',
        agent.totalTickets,
        agent.closedTickets,
        agent.openTickets,
        `${agent.resolutionRate}%`,
        formattedDuration(agent.avgDurationSeconds),
      ]),
    })

    doc.save(`agents_report_${period}.pdf`)
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!report) return
    if (format === 'pdf') {
      exportPdf()
    } else {
      exportExcel()
    }
  }

  const topByVolume = report?.topPerformers.byVolume
  const topByResolution = report?.topPerformers.byResolution
  const topByDuration = report?.topPerformers.byDuration

  const dateLabel = report
    ? `${new Date(report.period.start).toLocaleDateString()} - ${new Date(
        report.period.end
      ).toLocaleDateString()}`
    : ''

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Performance</h1>
          <p className="text-sm text-muted-foreground">
            Individual productivity and resolution performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-muted-foreground text-sm">
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

          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!report} className="gap-2">
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
        <div className="text-sm text-muted-foreground">No data available.</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{report.period.label}</span>
            <span>{dateLabel}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary text-primary-foreground p-5 rounded-xl shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs opacity-80 mb-1">Top Volume</p>
                  <h3 className="text-2xl font-bold">{topByVolume?.name || 'N/A'}</h3>
                  <p className="text-xs opacity-80 mt-2">
                    {topByVolume ? `${topByVolume.totalTickets} tickets handled` : 'No activity'}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
            </div>

            <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Best Resolution</p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {topByResolution?.name || 'N/A'}
                  </h3>
                  <p className="text-xs text-emerald-500 mt-2 font-medium">
                    {topByResolution ? `${topByResolution.resolutionRate}% resolution` : 'No activity'}
                  </p>
                </div>
                <div className="p-2 bg-secondary/40 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fastest Avg Duration</p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {topByDuration?.name || 'N/A'}
                  </h3>
                  <p className="text-xs text-primary mt-2 font-medium">
                    {topByDuration ? formattedDuration(topByDuration.avgDurationSeconds) : 'No data'}
                  </p>
                </div>
                <div className="p-2 bg-secondary/40 rounded-lg">
                  <Timer className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                {report.kpis.totalAgents} agents active in period
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Agent</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-right">Closed</th>
                    <th className="px-6 py-4 text-right">Open</th>
                    <th className="px-6 py-4 text-right">Resolution</th>
                    <th className="px-6 py-4 text-right">Avg Duration</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {agent.name ? agent.name.substring(0, 2).toUpperCase() : 'NA'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">ID {agent.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            agent.isActive ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-muted-foreground font-medium">
                        {agent.totalTickets}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {agent.closedTickets}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {agent.openTickets}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                        {agent.resolutionRate}%
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {formattedDuration(agent.avgDurationSeconds)}
                      </td>

                      <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <PhoneOutgoing className="w-3 h-3" />
                          {agent.totalTickets}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border/40 flex justify-between items-center text-sm text-muted-foreground">
              <span>Showing {filteredAgents.length} agents</span>
              <span>Total tickets: {report.kpis.totalTickets}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
