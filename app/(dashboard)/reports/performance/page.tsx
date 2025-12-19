'use client'

import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Download,
  Filter,
  Calendar,
  Phone,
  CheckCircle,
  DollarSign,
} from 'lucide-react'

/* --- MOCK DATA --- */
const CAMPAIGN_DATA = [
  { name: 'Lun', llamadas: 120, contestadas: 85, pagos: 12 },
  { name: 'Mar', llamadas: 132, contestadas: 90, pagos: 15 },
  { name: 'Mié', llamadas: 101, contestadas: 60, pagos: 8 },
  { name: 'Jue', llamadas: 154, contestadas: 110, pagos: 20 },
  { name: 'Vie', llamadas: 190, contestadas: 140, pagos: 25 },
]

const DISPOSITION_DATA = [
  { name: 'Pagos Realizados (AR)', value: 45, color: 'oklch(0.65 0.18 160)' },
  { name: 'Promesa de Pago', value: 30, color: 'oklch(0.75 0.18 85)' },
  { name: 'Registrados (Onboarding)', value: 80, color: 'var(--color-primary)' },
  { name: 'No Interesado', value: 20, color: 'oklch(0.65 0.22 25)' },
]

export default function PerformancePage() {
  const [period, setPeriod] = useState('Semana Actual')

  const handleExport = (format: 'PDF' | 'Excel') => {
    alert(`Generando reporte en ${format}...`)
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Performance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Métricas operativas y resultados de campañas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Periodo */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg
            bg-secondary/50 border border-border/50 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option>Semana Actual</option>
              <option>Fin de Mes</option>
              <option>Personalizado</option>
            </select>
          </div>

          {/* Export */}
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              bg-secondary/50 border border-border/50
              text-muted-foreground hover:bg-secondary transition"
          >
            <Download className="w-4 h-4" /> PDF
          </button>

          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calls */}
        <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Total Llamadas</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">1,245</h3>
            </div>
            <div className="p-2 bg-secondary/40 rounded-lg">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <span className="text-emerald-500 font-medium mr-1">↑ 12%</span>
            vs. semana pasada
          </div>
        </div>

        {/* Answer rate */}
        <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Respuesta</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">68%</h3>
            </div>
            <div className="p-2 bg-secondary/40 rounded-lg">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            846 llamadas contestadas
          </div>
        </div>

        {/* Conversion */}
        <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">
                Conversión (Pagos / Reg)
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-1">24%</h3>
            </div>
            <div className="p-2 bg-secondary/40 rounded-lg">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Objetivo mensual alcanzado al 85%
          </div>
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-background p-6 rounded-xl border border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Actividad de Llamadas (Campaña NFL)
            </h3>
            <button className="text-xs text-primary flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar Campaña
            </button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CAMPAIGN_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="llamadas"
                  name="Llamadas"
                  fill="hsl(var(--muted))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="contestadas"
                  name="Contestadas"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Distribución de Resultados
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Desglose por tipo de cierre
          </p>

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DISPOSITION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={5}
                >
                  {DISPOSITION_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">175</span>
              <span className="text-xs text-muted-foreground">
                Tickets Cerrados
              </span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {DISPOSITION_DATA.map(item => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
