"use client"

import { useState } from "react"

interface LineChartProps {
  data: { day: string; calls: number }[]
}

export default function LineChart({ data }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.calls))
  const height = 180
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = height - (item.calls / maxValue) * (height - 40)
      return `${x},${y}`
    })
    .join(" ")

  const areaPoints = `0,${height} ${points} 100,${height}`

  return (
    <div style={{ position: "relative", height: `${height}px`, padding: "1rem 0" }}>
      <svg width="100%" height={height} style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={(height / 4) * i}
            x2="100%"
            y2={(height / 4) * i}
            stroke="rgb(var(--border))"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <polygon fill="url(#lineGradient)" points={areaPoints} />

        {/* Line */}
        <polyline
          fill="none"
          stroke="rgb(var(--primary))"
          strokeWidth="3"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: "drop-shadow(0 4px 6px rgb(var(--primary) / 0.3))",
          }}
        />

        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = height - (item.calls / maxValue) * (height - 40)
          const isHovered = hoveredPoint === index

          return (
            <g key={index}>
              <circle
                cx={`${x}%`}
                cy={y}
                r={isHovered ? "8" : "5"}
                fill="rgb(var(--primary))"
                stroke="rgb(var(--card))"
                strokeWidth="3"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  filter: isHovered ? "drop-shadow(0 0 8px rgb(var(--primary)))" : "none",
                }}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <title>
                  {item.day}: {item.calls} calls
                </title>
              </circle>
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={`${x}%`}
                    y={y - 45}
                    width="80"
                    height="35"
                    rx="6"
                    fill="rgb(var(--card))"
                    stroke="rgb(var(--border))"
                    strokeWidth="1"
                    style={{ transform: "translateX(-40px)" }}
                  />
                  <text
                    x={`${x}%`}
                    y={y - 30}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="rgb(var(--foreground))"
                  >
                    {item.day}
                  </text>
                  <text
                    x={`${x}%`}
                    y={y - 15}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill="rgb(var(--primary))"
                  >
                    {item.calls} calls
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* X-axis labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.75rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid rgb(var(--border))",
        }}
      >
        {data.map((item, index) => (
          <span
            key={index}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: hoveredPoint === index ? "rgb(var(--primary))" : "rgb(var(--muted-foreground))",
              transition: "color 0.2s",
            }}
          >
            {item.day}
          </span>
        ))}
      </div>
    </div>
  )
}
