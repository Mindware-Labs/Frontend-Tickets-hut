"use client"

import { useState } from "react"
import { mockCampaigns, mockTickets } from "@/lib/mock-data"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Megaphone,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Filter,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRole } from "@/components/providers/role-provider"
import { ShieldAlert } from "lucide-react"

export default function CampaignsPage() {
  const { isAdmin } = useRole()

  if (!isAdmin) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view marketing campaigns.</p>
        </div>
      </div>
    )
  }

  const [searchTerm, setSearchTerm] = useState("")

  const filteredCampaigns = mockCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
      case "Paused": return "bg-amber-500/15 text-amber-600 border-amber-500/20"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your marketing and outreach campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-9 btn-primary-modern shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-card border border-border/50">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9 bg-secondary/20 border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => {
          const campaignTickets = mockTickets.filter((t) => t.campaign === campaign.name)
          const openTickets = campaignTickets.filter((t) => t.status === "Open").length
          const closedTickets = campaignTickets.filter((t) => t.status === "Closed").length
          const progress = campaignTickets.length > 0 ? (closedTickets / campaignTickets.length) * 100 : 0

          return (
            <Card key={campaign.id} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden">
              <CardHeader className="bg-secondary/10 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">{campaign.name}</CardTitle>
                      <CardDescription className="text-xs font-mono mt-0.5">{campaign.id}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Progress Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Completion</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-secondary/30 text-center space-y-1">
                    <div className="text-lg font-bold text-foreground">{campaign.ticketCount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/5 text-center space-y-1">
                    <div className="text-lg font-bold text-blue-600">{openTickets}</div>
                    <div className="text-[10px] text-blue-500/80 uppercase tracking-wider">Open</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/5 text-center space-y-1">
                    <div className="text-lg font-bold text-emerald-600">{closedTickets}</div>
                    <div className="text-[10px] text-emerald-500/80 uppercase tracking-wider">Done</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-secondary/5 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {new Date(campaign.startDate).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs group-hover:border-primary/50 group-hover:text-primary transition-colors">
                      Details
                      <ArrowUpRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
