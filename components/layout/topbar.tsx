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
          
        </div>


        <Separator orientation="vertical" className="h-4" />

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-border/50">
          <span className="text-xs font-bold text-primary">YA</span>
        </div>
      </div>
    </header>
  )
}
