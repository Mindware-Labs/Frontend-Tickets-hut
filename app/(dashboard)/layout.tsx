'use client';

import { ThemeProvider } from "next-themes";
import type React from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"  // O "data-theme" dependiendo de tu configuración
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
