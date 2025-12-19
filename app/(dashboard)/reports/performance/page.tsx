'use client';

import React, { useState } from 'react';
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
  Cell 
} from 'recharts';
import { Download, Filter, Calendar, Phone, CheckCircle, DollarSign } from 'lucide-react';

// --- MOCK DATA (Simulando datos reales de la API) ---
// Basado en  "Ver un listado consolidado (ej. 134 tickets de NFL)"
const CAMPAIGN_DATA = [
  { name: 'Lun', llamadas: 120, contestadas: 85, pagos: 12 },
  { name: 'Mar', llamadas: 132, contestadas: 90, pagos: 15 },
  { name: 'Mié', llamadas: 101, contestadas: 60, pagos: 8 },
  { name: 'Jue', llamadas: 154, contestadas: 110, pagos: 20 },
  { name: 'Vie', llamadas: 190, contestadas: 140, pagos: 25 }, // [cite: 82] "Identificar patrones (ej. alto volumen)"
];

// Basado en  "Resultados de las gestiones"
const DISPOSITION_DATA = [
  { name: 'Pagos Realizados (AR)', value: 45, color: '#10b981' }, // [cite: 19]
  { name: 'Promesa de Pago', value: 30, color: '#f59e0b' },
  { name: 'Registrados (Onboarding)', value: 80, color: '#3b82f6' }, // [cite: 18]
  { name: 'No Interesado', value: 20, color: '#ef4444' },
];

export default function PerformancePage() {
  const [period, setPeriod] = useState('Semana Actual');

  // [cite: 39, 40, 41] Funcionalidad de Exportación
  const handleExport = (format: 'PDF' | 'Excel') => {
    alert(`Generando reporte en ${format}... (Lógica de backend pendiente)`);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Dashboard</h1>
          <p className="text-slate-500 text-sm">Métricas operativas y resultados de campañas [cite: 31]</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de Periodo [cite: 77, 78, 79] */}
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-sm outline-none text-slate-700"
            >
              <option>Semana Actual</option>
              <option>Fin de Mes</option>
              <option>Personalizado</option>
            </select>
          </div>

          {/* Botones de Exportación [cite: 38] */}
          <button 
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition shadow-sm"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* --- KPI CARDS (Tarjetas de Métricas Clave) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Volumen de Llamadas [cite: 33] */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Llamadas</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">1,245</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-green-600 font-medium flex items-center mr-2">
              ↑ 12%
            </span> vs. semana pasada
          </div>
        </div>

        {/* Card 2: Tasa de Contestación [cite: 34] */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Tasa de Respuesta</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">68%</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            846 llamadas contestadas exitosamente
          </div>
        </div>

        {/* Card 3: Éxito en Gestión (AR/Onboarding) [cite: 86, 87] */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Conversión (Pagos/Reg)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">24%</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Objetivo mensual alcanzado al 85%
          </div>
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO PRINCIPAL: Llamadas vs Contestadas [cite: 33, 34, 36] */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Actividad de Llamadas (Campaña NFL)</h3>
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrar Campaña
            </button>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CAMPAIGN_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar dataKey="llamadas" name="Llamadas Realizadas" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="contestadas" name="Contestadas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO SECUNDARIO: Resultados de Gestión  */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Distribución de Resultados</h3>
          <p className="text-xs text-slate-500 mb-6">Desglose por tipo de cierre de ticket</p>
          
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DISPOSITION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DISPOSITION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Texto Central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-2xl font-bold text-slate-800">175</span>
              <p className="text-xs text-slate-500">Tickets Cerrados</p>
            </div>
          </div>

          {/* Leyenda Personalizada */}
          <div className="space-y-3 mt-4">
            {DISPOSITION_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}