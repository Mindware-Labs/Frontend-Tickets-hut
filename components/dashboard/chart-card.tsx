import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="glass-card border-none overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/5 space-y-0">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-6 px-6">
        {children}
      </CardContent>
    </Card>
  )
}
