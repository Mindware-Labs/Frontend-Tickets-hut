'use client'

import React, { useState } from 'react'
import {
  Search,
  Download,
  Filter,
  User,
  PhoneOutgoing,
  ChevronRight,
  Trophy,
  AlertCircle,
} from 'lucide-react'

/* --- MOCK DATA --- */
const AGENTS_DATA = [
  {
    id: 1,
    name: 'Mateo',
    role: 'Support Agent',
    status: 'online',
    callsMade: 145,
    callsAnswered: 98,
    conversionOnboarding: 12,
    conversionAR: 5,
    avgDuration: '4m 12s',
    ticketsOpen: 3,
  },
  {
    id: 2,
    name: 'Vanessa Bravo',
    role: 'AR Specialist',
    status: 'busy',
    callsMade: 210,
    callsAnswered: 165,
    conversionOnboarding: 4,
    conversionAR: 28,
    avgDuration: '3m 45s',
    ticketsOpen: 8,
  },
  {
    id: 3,
    name: 'Sebastian Lopez',
    role: 'Onboarding',
    status: 'offline',
    callsMade: 85,
    callsAnswered: 40,
    conversionOnboarding: 15,
    conversionAR: 1,
    avgDuration: '6m 20s',
    ticketsOpen: 1,
  },
  {
    id: 4,
    name: 'John Smith',
    role: 'Support Agent',
    status: 'online',
    callsMade: 120,
    callsAnswered: 90,
    conversionOnboarding: 8,
    conversionAR: 4,
    avgDuration: '4m 50s',
    ticketsOpen: 5,
  },
]

export default function AgentStatsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAgents = AGENTS_DATA.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Statistics</h1>
          <p className="text-sm text-muted-foreground">
            Desempeño individual por operativo y campaña
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
          bg-secondary/50 border border-border/50
          text-muted-foreground hover:bg-secondary transition">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      {/* --- TOP PERFORMERS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top AR */}
        <div className="bg-primary text-primary-foreground p-5 rounded-xl shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs opacity-80 mb-1">Top Performer (AR)</p>
              <h3 className="text-2xl font-bold">Vanessa Bravo</h3>
              <p className="text-xs opacity-80 mt-2">
                28 Pagos recuperados esta semana
              </p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        {/* Mayor volumen */}
        <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Mayor Volumen Llamadas
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                Vanessa Bravo
              </h3>
              <p className="text-xs text-emerald-500 mt-2 font-medium">
                210 Llamadas realizadas
              </p>
            </div>
            <div className="p-2 bg-secondary/40 rounded-lg">
              <PhoneOutgoing className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Líder onboarding */}
        <div className="bg-background p-5 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Líder Onboarding
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                Sebastian Lopez
              </h3>
              <p className="text-xs text-primary mt-2 font-medium">
                15 Registros completados
              </p>
            </div>
            <div className="p-2 bg-secondary/40 rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar agente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm
                bg-background text-foreground
                border border-border/40
                focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button className="flex items-center gap-2 px-3 py-2 text-sm
            text-muted-foreground rounded-lg
            hover:bg-secondary/40 transition">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Agente</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Llamadas</th>
                <th className="px-6 py-4 text-right">Contestadas</th>
                <th className="px-6 py-4 text-right text-primary">Onboarding</th>
                <th className="px-6 py-4 text-right text-emerald-500">AR</th>
                <th className="px-6 py-4 text-right">Tickets</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {filteredAgents.map(agent => (
                <tr
                  key={agent.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                  onClick={() => alert(`Navegar a detalles de: ${agent.name}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {agent.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {agent.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {agent.role}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                        ${
                          agent.status === 'online'
                            ? 'bg-emerald-500 text-white'
                            : agent.status === 'busy'
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {agent.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-muted-foreground font-medium">
                    {agent.callsMade}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {agent.callsAnswered}{' '}
                    <span className="text-xs opacity-60">
                      ({Math.round(
                        (agent.callsAnswered / agent.callsMade) * 100
                      )}
                      %)
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-bold">
                    {agent.conversionOnboarding}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-bold">
                    {agent.conversionAR}
                  </td>

                  <td className="px-6 py-4 text-right text-sm">
                    {agent.ticketsOpen > 5 ? (
                      <span className="text-amber-500 flex items-center justify-end gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {agent.ticketsOpen}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {agent.ticketsOpen}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 flex justify-between items-center text-sm text-muted-foreground">
          <span>Mostrando {filteredAgents.length} agentes</span>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 border border-border/40 rounded opacity-50">
              Anterior
            </button>
            <button disabled className="px-3 py-1 border border-border/40 rounded opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
