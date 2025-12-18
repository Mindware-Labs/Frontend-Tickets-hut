"use client"

import { useState } from "react"

interface BarChartProps {
  data: { name: string; count: number }[]
  color?: string
}

export default function BarChart({ data, color = "rgb(var(--primary))" }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.count))
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div style={{ padding: "1rem 0" }}>
      {data.map((item, index) => (
        <div
          key={index}
          style={{ marginBottom: "1.5rem" }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: hoveredIndex === index ? "rgb(var(--foreground))" : "rgb(var(--muted-foreground))",
                transition: "color 0.2s",
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: hoveredIndex === index ? color : "rgb(var(--foreground))",
                transition: "color 0.2s",
              }}
            >
              {item.count}
            </span>
          </div>
          <div
            style={{
              height: "10px",
              background: "rgb(var(--muted))",
              borderRadius: "9999px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(item.count / maxValue) * 100}%`,
                background: hoveredIndex === index ? `linear-gradient(90deg, ${color}, rgb(var(--chart-1)))` : color,
                borderRadius: "9999px",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hoveredIndex === index ? "scaleY(1.2)" : "scaleY(1)",
                boxShadow: hoveredIndex === index ? `0 0 20px ${color}` : "none",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
