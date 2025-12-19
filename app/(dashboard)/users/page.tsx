"use client"

import { useState } from "react"
import { mockUsers } from "@/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreHorizontal,
  UserPlus,
  Shield,
  Mail,
  UserCheck,
  MoreVertical,
  Pencil,
  Trash2,
  Key
} from "lucide-react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin": return "default"
      case "Supervisor": return "secondary"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles, access, and specific permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-9 btn-primary-modern shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border border-border/50">
          <div>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Users</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border border-border/50">
          <div>
            <div className="text-2xl font-bold text-emerald-600">{mockUsers.filter(u => u.status === 'Active').length}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border border-border/50">
          <div>
            <div className="text-2xl font-bold text-blue-600">{mockUsers.filter(u => u.role === 'Agent').length}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Agents</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Shield className="h-5 w-5" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl flex items-center justify-between border border-border/50">
          <div>
            <div className="text-2xl font-bold text-amber-600">{mockUsers.filter(u => u.role === 'Supervisor').length}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Supervisors</div>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9 max-w-sm bg-background/50 border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-white/5">
                <TableHead className="w-[300px] font-bold text-xs uppercase tracking-wider pl-6">User</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Assigned</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-b border-white/5 last:border-0 hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarFallback className="text-xs font-medium bg-primary/5 text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role) as any} className="shadow-none">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>
                      <div className={`mr-1.5 h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {user.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{user.ticketsAssigned}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-500 focus:text-rose-500">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
