import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { RoleProvider } from "@/components/providers/role-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Call Center Dashboard",
  description: "Call Center Ticket Management System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <RoleProvider>
        <html lang="en" suppressHydrationWarning>
          <body>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </body>
        </html>
      </RoleProvider>
    </ClerkProvider>
  )
}
