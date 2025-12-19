'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  User, 
  PhoneOutgoing, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  Trophy,
  AlertCircle
} from 'lucide-react';

// --- MOCK DATA (Datos simulados basados en los ejemplos del PDF) ---
// Agentes mencionados en el documento: Mateo, Vanessa, etc. [cite: 55, 153]
const AGENTS_DATA = [
  { 
    id: 1, 
    name: 'Mateo', 
    role: 'Support Agent', 
    status: 'online',
    callsMade: 145, 
    callsAnswered: 98, 
    conversionOnboarding: 12, // Registros exitosos
    conversionAR: 5,          // Pagos recuperados
    avgDuration: '4m 12s',
    ticketsOpen: 3
  },
  { 
    id: 2, 
    name: 'Vanessa Bravo', 
    role: 'AR Specialist', 
    status: 'busy',
    callsMade: 210, 
    callsAnswered: 165, 
    conversionOnboarding: 4, 
    conversionAR: 28,         // Alto rendimiento en cobros
    avgDuration: '3m 45s',
    ticketsOpen: 8
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
    ticketsOpen: 1
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
    ticketsOpen: 5
  },
];

export default function AgentStatsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado simple de agentes
  const filteredAgents = AGENTS_DATA.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Statistics</h1>
          <p className="text-slate-500 text-sm">Desempeño individual por operativo y campaña </p>
        </div>
        
        {/* Acciones Globales */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition shadow-sm">
            <Download className="w-4 h-4" /> Exportar Reporte 
          </button>
        </div>
      </div>

      {/* --- TOP PERFORMERS (Resumen Rápido) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Top Performer (AR)</p>
              <h3 className="text-2xl font-bold">Vanessa Bravo</h3>
              <p className="text-xs text-blue-100 mt-2">28 Pagos recuperados esta semana</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Mayor Volumen Llamadas</p>
              <h3 className="text-2xl font-bold text-slate-900">Vanessa Bravo</h3>
              <p className="text-xs text-green-600 mt-2 font-medium">210 Llamadas realizadas</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <PhoneOutgoing className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Líder Onboarding</p>
              <h3 className="text-2xl font-bold text-slate-900">Sebastian Lopez</h3>
              <p className="text-xs text-blue-600 mt-2 font-medium">15 Registros completados</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLA DE AGENTES --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Barra de Herramientas de la Tabla */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar agente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition">
              <Filter className="w-4 h-4" /> Filtros
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Agente</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Llamadas (Total)</th>
                <th className="px-6 py-4 text-right">Contestadas</th>
                <th className="px-6 py-4 text-right text-blue-600">Onboarding (Reg)</th>
                <th className="px-6 py-4 text-right text-green-600">AR (Pagos)</th>
                <th className="px-6 py-4 text-right">Tickets Activos</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent) => (
                <tr 
                  key={agent.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => alert(`Navegar a detalles de: ${agent.name}`)} // Acción para ver detalle [cite: 71]
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {agent.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${agent.status === 'online' ? 'bg-green-100 text-green-800' : 
                        agent.status === 'busy' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600 font-medium">
                    {agent.callsMade}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    {agent.callsAnswered} <span className="text-slate-400 text-xs">({Math.round((agent.callsAnswered/agent.callsMade)*100)}%)</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                    {agent.conversionOnboarding}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                    {agent.conversionAR}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {agent.ticketsOpen > 5 ? (
                      <span className="text-amber-600 flex items-center justify-end gap-1">
                        <AlertCircle className="w-3 h-3" /> {agent.ticketsOpen}
                      </span>
                    ) : (
                      <span className="text-slate-600">{agent.ticketsOpen}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer de la Tabla (Paginación simple) */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <span>Mostrando {filteredAgents.length} agentes</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}