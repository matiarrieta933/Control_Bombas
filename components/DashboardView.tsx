import React, { useMemo, useState } from 'react';
import { ExtractionPoint, Reading } from '../types';
import { getDailyStats, calculateMetrics } from '../utils';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Zap, Droplets, Calendar } from 'lucide-react';

interface DashboardViewProps {
  config: ExtractionPoint[];
  readings: Reading[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ config, readings }) => {
  const [filter, setFilter] = useState('ALL');

  // Helper to determine active asset IDs
  const activeAssetIds = useMemo(() => {
    if (filter === 'ALL') {
        // Return all asset IDs
        return config.flatMap(g => g.assets.map(a => a.id));
    }
    const group = config.find(g => g.id === filter);
    if (group) {
        return group.assets.map(a => a.id);
    }
    return [filter];
  }, [filter, config]);

  // 1. Prepare Chart Data
  const chartData = useMemo(() => {
    return getDailyStats(readings, filter === 'ALL' ? 'ALL' : activeAssetIds);
  }, [readings, filter, activeAssetIds]);

  // 2. Prepare Summary Metrics for the Header
  const summaryMetrics = useMemo(() => {
      return calculateMetrics(readings, activeAssetIds);
  }, [readings, activeAssetIds]);

  const selectedLabel = useMemo(() => {
    if (filter === 'ALL') return 'Vista General Planta';
    const group = config.find(g => g.id === filter);
    if (group) return group.name;
    const asset = config.flatMap(g => g.assets).find(a => a.id === filter);
    return asset ? asset.name : filter;
  }, [filter, config]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 justify-between items-center no-print sticky top-20 z-20">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Seleccionar Vista / Equipo:</label>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="border-b-2 border-slate-300 bg-transparent font-bold text-slate-800 focus:outline-none pb-1 pr-8 text-sm min-w-[250px]"
          >
            <option value="ALL">VISTA GENERAL (TOTALES)</option>
            {config.map(g => (
              <optgroup key={g.id} label={g.name}>
                <option value={g.id}>⚡ {g.name} (Grupo)</option>
                {g.assets.map(a => (
                  <option key={a.id} value={a.id}>&nbsp;&nbsp;&nbsp;&nbsp;↳ {a.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-slate-700"
        >
          Imprimir Reporte
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-5 text-white shadow-lg">
             <div className="text-xs font-bold uppercase text-slate-400 mb-2">Resumen Seleccionado</div>
             <div className="text-lg font-bold leading-tight">{selectedLabel}</div>
             <div className="mt-4 flex gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1"><Calendar size={12}/> {chartData.length} Días registrados</div>
             </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-bold uppercase text-yellow-600">Energía (Total)</div>
                <Zap size={16} className="text-yellow-500"/>
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-800 font-mono">
                    {summaryMetrics.totalKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-slate-400">kWh</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    Promedio: <span className="font-bold text-slate-700">{summaryMetrics.avgKwhPerDay.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span> kWh/día
                </div>
            </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-bold uppercase text-cyan-600">Volumen (Total)</div>
                <Droplets size={16} className="text-cyan-500"/>
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-800 font-mono">
                    {summaryMetrics.totalM3.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-slate-400">m³</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    Promedio: <span className="font-bold text-slate-700">{summaryMetrics.avgM3PerDay.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span> m³/día
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 print-container">
        <div className="card bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="mb-6 flex justify-between items-end">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Tendencia Diaria</h3>
                <p className="text-xs text-slate-500">Comportamiento combinado de Energía y Volumen para la selección actual.</p>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 10}} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#3b82f6" 
                        label={{ value: 'Volumen (m³)', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fontSize: 10, fill: '#94a3b8'} }}
                        tick={{fontSize: 10}}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#f59e0b"
                        label={{ value: 'Energía (kWh)', angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fontSize: 10, fill: '#94a3b8'} }}
                        tick={{fontSize: 10}}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar yAxisId="left" dataKey="m3" name="Volumen (m³)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="kwh" name="Energía (kWh)" stroke="#f59e0b" strokeWidth={3} dot={{r: 3}} activeDot={{r: 6}} />
                </ComposedChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Calendar size={48} className="mb-2 opacity-20"/>
                    <p className="text-sm">No hay suficientes datos para generar gráficos en este periodo.</p>
                    <p className="text-xs opacity-75">Intente registrar más lecturas.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};