"use client"

import type React from "react"
import { AppSidebar } from "./sidebar"
import Topbar from "./topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
