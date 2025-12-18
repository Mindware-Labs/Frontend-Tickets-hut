"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    MoreHorizontal,
    UserPlus,
    ArrowUpCircle,
    CheckCircle,
    FileText,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface TicketActionsProps {
    ticketId: string
}

export function TicketActions({ ticketId }: TicketActionsProps) {
    const handleAction = (action: string) => {
        toast.success(`${action} initiated for ticket #${ticketId}`, {
            description: "Operation logged in system history."
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-secondary rounded-xl">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50 backdrop-blur-xl">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleAction("Assignment")} className="rounded-xl px-3 py-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
                    <UserPlus className="mr-3 h-4 w-4" />
                    <span>Assign Agent</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("Escalation")} className="rounded-xl px-3 py-2 cursor-pointer focus:bg-rose-500/10 focus:text-rose-500 transition-colors">
                    <ArrowUpCircle className="mr-3 h-4 w-4" />
                    <span>Escalate Pulse</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("Resolution")} className="rounded-xl px-3 py-2 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors">
                    <CheckCircle className="mr-3 h-4 w-4" />
                    <span>Quick Resolve</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-border/50" />
                <DropdownMenuItem onClick={() => handleAction("Report generation")} className="rounded-xl px-3 py-2 cursor-pointer transition-colors">
                    <FileText className="mr-3 h-4 w-4" />
                    <span>View Full Logs</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("System flag")} className="rounded-xl px-3 py-2 cursor-pointer transition-colors">
                    <AlertCircle className="mr-3 h-4 w-4" />
                    <span>Flag for Review</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
