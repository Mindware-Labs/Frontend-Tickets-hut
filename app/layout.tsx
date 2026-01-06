import type React from "react";
import type { Metadata } from "next";
import { RoleProvider } from "@/components/providers/role-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
// 1. IMPORTAR EL COMPONENTE
import { TicketSocketProvider } from "@/components/providers/TicketSocketProvider"; 
import "./globals.css";

export const metadata: Metadata = {
  title: "Rig Hut Support Center",
  description: "Call Center Ticket Management System",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* 2. AGREGARLO AQUÍ (antes de children) */}
            <TicketSocketProvider />
            
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </RoleProvider>
  );
}