import React, { useMemo } from 'react';
import { ExtractionPoint, Reading } from '../types';
import { calculateMetrics } from '../utils';
import { ArrowRight, Activity, Droplets, Zap, Layers, Factory } from 'lucide-react';

interface ScadaViewProps {
  config: ExtractionPoint[];
  readings: Reading[];
}

export const ScadaView: React.FC<ScadaViewProps> = ({ config, readings }) => {

  // Logic to identify specific groups requested by user
  // We search by name or ID pattern to be robust
  const tboAssets = useMemo(() => {
    return config.filter(g => 
        g.name.toUpperCase().includes('TBO') || 
        g.id.toLowerCase().includes('tbo')
    ).flatMap(g => g.assets.map(a => a.id));
  }, [config]);

  const pileAssets = useMemo(() => {
    return config.filter(g => 
        g.name.toUpperCase().includes('PILA') || 
        g.id.includes('42') || 
        g.id.includes('64')
    ).flatMap(g => g.assets.map(a => a.id));
  }, [config]);

  const pesAssets = useMemo(() => {
    return config.filter(g => 
        g.name.toUpperCase().includes('BES') || 
        g.name.toUpperCase().includes('OSMOSIS') ||
        g.name.toUpperCase().includes('PES')
    ).flatMap(g => g.assets.map(a => a.id));
  }, [config]);

  // Calculate Metrics
  const tboMetrics = useMemo(() => calculateMetrics(readings, tboAssets), [readings, tboAssets]);
  const pileMetrics = useMemo(() => calculateMetrics(readings, pileAssets), [readings, pileAssets]);
  const pesMetrics = useMemo(() => calculateMetrics(readings, pesAssets), [readings, pesAssets]);

  // Card Component
  const StatCard = ({ title, icon: Icon, metrics, colorClass, bgClass, borderClass }: any) => (
    <div className={`rounded-xl border-t-4 ${borderClass} bg-white shadow-lg flex flex-col h-full`}>
      <div className={`p-4 border-b border-slate-100 ${bgClass} flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white ${colorClass}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 leading-tight">{title}</h3>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Estado: {metrics.hasData ? 'Activo' : 'Sin Datos'}</p>
          </div>
        </div>
      </div>
      
      <div className="p-5 grid grid-cols-2 gap-4 flex-1">
        {/* Energy Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">
            <Zap size={12} /> Energía
          </div>
          <div>
             <span className="block text-2xl font-bold text-slate-700 font-mono tracking-tight">
                {metrics.totalKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
             </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Total Consumido (kWh)</span>
          </div>
           <div>
             <span className="block text-lg font-bold text-yellow-600 font-mono">
                {metrics.avgKwhPerDay.toLocaleString(undefined, { maximumFractionDigits: 1 })}
             </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Promedio / Día (kWh)</span>
          </div>
        </div>

        {/* Volume Column */}
        <div className="space-y-3 pl-4 border-l border-slate-100">
           <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1">
            <Droplets size={12} /> Volumen
          </div>
           <div>
             <span className="block text-2xl font-bold text-slate-700 font-mono tracking-tight">
                {metrics.totalM3.toLocaleString(undefined, { maximumFractionDigits: 0 })}
             </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Total Enviado (m³)</span>
          </div>
           <div>
             <span className="block text-lg font-bold text-cyan-600 font-mono">
                {metrics.avgM3PerDay.toLocaleString(undefined, { maximumFractionDigits: 1 })}
             </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase">Promedio / 24h (m³)</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800">Flujo de Proceso & Balance</h2>
        <p className="text-sm text-slate-500">Visualización del ciclo completo: Origen, Almacenamiento y Destino Final.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-center relative">
        
        {/* 1. SOURCE: TBO */}
        <div className="flex-1 min-w-[300px] z-10">
            <div className="mb-2 text-center text-xs font-bold uppercase text-slate-400 tracking-widest">Origen</div>
            <StatCard 
                title="Planta Química (TBO 3, 4, 5)" 
                icon={Factory} 
                metrics={tboMetrics}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
                borderClass="border-amber-500"
            />
        </div>

        {/* CONNECTION 1 */}
        <div className="flex lg:flex-col items-center justify-center p-2 relative lg:w-32">
             <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 hidden lg:block"></div>
             
             {/* Bypass Path Visual */}
             <div className="absolute top-[-20px] left-0 w-full h-[20px] border-t-2 border-slate-300 border-dashed rounded-t-full hidden lg:block" title="Ruta Bypass"></div>
             <div className="lg:absolute lg:top-[-30px] bg-white px-2 py-1 text-[10px] font-bold text-slate-400 uppercase border border-slate-200 rounded shadow-sm whitespace-nowrap z-20">
                Bypass Directo
             </div>

             <div className="bg-white p-2 rounded-full border-2 border-slate-200 text-slate-400 z-10">
                <ArrowRight size={20} className="lg:rotate-0 rotate-90"/>
             </div>
        </div>

        {/* 2. MIDDLE: PILES */}
        <div className="flex-1 min-w-[300px] z-10">
             <div className="mb-2 text-center text-xs font-bold uppercase text-slate-400 tracking-widest">Acumulación</div>
             <StatCard 
                title="Pilas 42, 50, 64" 
                icon={Layers} 
                metrics={pileMetrics}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
                borderClass="border-blue-500"
            />
        </div>

        {/* CONNECTION 2 */}
        <div className="flex lg:flex-col items-center justify-center p-2 relative lg:w-24">
             <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 hidden lg:block"></div>
             <div className="bg-white p-2 rounded-full border-2 border-slate-200 text-slate-400 z-10">
                <ArrowRight size={20} className="lg:rotate-0 rotate-90"/>
             </div>
        </div>

        {/* 3. DESTINATION: PES */}
        <div className="flex-1 min-w-[300px] z-10">
             <div className="mb-2 text-center text-xs font-bold uppercase text-slate-400 tracking-widest">Destino Final</div>
             <StatCard 
                title="Ingreso a PES" 
                icon={Droplets} 
                metrics={pesMetrics}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
                borderClass="border-emerald-500"
            />
        </div>

      </div>
      
      {/* Legend / Info */}
      <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-500 flex justify-center gap-8">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span> Origen (Bombas/Flujo)
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Pilas (Intermedio)
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Destino (Procesado)
        </div>
      </div>

    </div>
  );
};