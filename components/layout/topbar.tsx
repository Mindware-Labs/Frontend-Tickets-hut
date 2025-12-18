"use client"


import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

export default function Topbar() {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)
  const currentPage = pathSegments[pathSegments.length - 1] || "Dashboard"

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 bg-background/50 backdrop-blur-xl px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b border-border/40 mb-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Platform</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="capitalize font-bold">{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-96 max-w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Type to search..."
            className="h-9 w-full rounded-xl bg-secondary/50 pl-9 border-none text-xs font-medium ring-offset-background transition-all focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background shadow-none"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-secondary">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-2.5 top-2.5 flex h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-border/50">
          <span className="text-xs font-bold text-primary">JD</span>
        </div>
      </div>
    </header>
  )
}
