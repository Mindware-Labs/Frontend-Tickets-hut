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
  CardTitle,
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
  Users,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
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
      case "Active":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      case "Paused":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getCampaignStats = (campaignName: string) => {
    const tickets = mockTickets.filter(t => t.campaign === campaignName)
    
    return {
      total: tickets.length,
      onboarding: tickets.filter(t => t.type === "Onboarding").length,
      ar: tickets.filter(t => t.type === "AR").length,
      open: tickets.filter(t => t.status === "Open").length,
      closed: tickets.filter(t => t.status === "Closed").length,
      inbound: tickets.filter(t => t.direction === "inbound").length,
      outbound: tickets.filter(t => t.direction === "outbound").length,
      missed: tickets.filter(t => t.direction === "missed").length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your marketing and outreach campaigns
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => {
          const stats = getCampaignStats(campaign.name)
          const progress = stats.total > 0 ? (stats.closed / stats.total) * 100 : 0

          return (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {campaign.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(campaign.status)} border`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                {/* Progress Bar */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total Tickets</p>
                      </div>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="space-y-1">
                      <p className="text-lg font-bold">
                        {stats.open} / {stats.closed}
                      </p>
                      <p className="text-xs text-muted-foreground">Open / Closed</p>
                    </div>
                  </div>
                </div>

                {/* Type Breakdown */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-500">
                        {stats.onboarding}
                      </p>
                      <p className="text-xs font-medium text-blue-600/80 dark:text-blue-500/80">
                        Onboarding
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/20">
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-500">
                        {stats.ar}
                      </p>
                      <p className="text-xs font-medium text-purple-600/80 dark:text-purple-500/80">
                        AR
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(campaign.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                      <DropdownMenuItem>View Analytics</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete Campaign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline">
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

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Megaphone className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold">No campaigns found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by creating a new campaign"}
            </p>
            {!searchTerm && (
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}