import React, { useState, useEffect } from 'react';
import { Asset, ExtractionPoint, Reading } from '../types';
import { findAsset } from '../utils';
import { Zap, Droplets, Clock, Plus, RefreshCw, Trash2, Gauge } from 'lucide-react';

interface RegisterViewProps {
  config: ExtractionPoint[];
  readings: Reading[];
  onAddReading: (reading: Reading) => void;
  onDeleteReading: (id: number) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ config, readings, onAddReading, onDeleteReading }) => {
  const [date, setDate] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [kwh, setKwh] = useState('');
  const [hConn, setHConn] = useState('');
  const [hRun, setHRun] = useState('');
  const [m3, setM3] = useState('');
  
  // Set default date to now on mount
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDate(now.toISOString().slice(0, 16));
  }, []);

  const selectedAsset = selectedAssetId ? findAsset(config, selectedAssetId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    const newReading: Reading = {
      id: Date.now(),
      date,
      assetId: selectedAssetId,
    };

    // Only add fields if they have values
    if (kwh !== '') newReading.kwh = parseFloat(kwh);
    if (hConn !== '') newReading.h_conn = parseFloat(hConn);
    if (hRun !== '') newReading.h_run = parseFloat(hRun);
    if (m3 !== '') newReading.m3 = parseFloat(m3);

    onAddReading(newReading);

    // Reset fields except date
    setKwh('');
    setHConn('');
    setHRun('');
    setM3('');
    
    // Reset date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDate(now.toISOString().slice(0, 16));
  };

  const recentHistory = [...readings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Form Column */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 border-t-4 border-t-blue-600 sticky top-32">
          <h2 className="text-sm font-bold uppercase text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center rounded-full text-xs">
              <Plus size={14} />
            </span>
            Nueva Lectura
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Fecha y Hora</label>
              <input 
                type="datetime-local" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                required 
                className="w-full border border-slate-300 p-2 rounded text-sm bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Punto de Medición</label>
              <select 
                value={selectedAssetId} 
                onChange={e => setSelectedAssetId(e.target.value)}
                required 
                className="w-full border border-slate-300 p-2 rounded text-sm bg-white font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Seleccionar --</option>
                {config.map(group => (
                  <optgroup key={group.id} label={group.name}>
                    {group.assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedAsset && (
              <div className="space-y-3 animate-fade-in">
                {selectedAsset.type !== 'FIT' && (
                  <>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                        <Zap size={12} className="text-yellow-600" /> Energía Acumulada (kWh)
                      </label>
                      <input 
                        type="number" step="0.01" 
                        value={kwh} onChange={e => setKwh(e.target.value)}
                        placeholder="Lectura medidor kWh" 
                        className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                      />
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                        <Clock size={12} className="text-green-600" /> Horas Conexión
                      </label>
                      <input 
                        type="number" step="0.1" 
                        value={hConn} onChange={e => setHConn(e.target.value)}
                        placeholder="Horas Totales" 
                        className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                      />
                    </div>
                  </>
                )}
                
                {selectedAsset.type === 'VDF' && (
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                      <RefreshCw size={12} className="text-blue-600" /> Horas Marcha (Run)
                    </label>
                    <input 
                      type="number" step="0.1" 
                      value={hRun} onChange={e => setHRun(e.target.value)}
                      placeholder="Horas Totales" 
                      className="w-full border border-slate-300 p-2 rounded text-sm font-mono"
                    />
                  </div>
                )}

                {selectedAsset.type === 'FIT' && (
                  <div className="bg-cyan-50 p-3 rounded border border-cyan-200">
                    <label className="block text-[10px] font-bold uppercase text-cyan-800 mb-1 flex items-center gap-1">
                      <Droplets size={12} className="text-cyan-600" /> Flujo Acumulado (m³)
                    </label>
                    <input 
                      type="number" step="1" 
                      value={m3} onChange={e => setM3(e.target.value)}
                      placeholder="Totalizador m³" 
                      className="w-full border border-cyan-300 p-2 rounded text-sm font-mono focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition text-sm uppercase tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedAssetId}
            >
              Guardar Registro
            </button>
          </form>
        </div>
      </div>

      {/* History Column */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-slate-600">Historial Reciente</h3>
            <span className="text-[10px] text-slate-400">Últimos 10 registros ingresados</span>
          </div>
          <div className="overflow-auto flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 font-bold text-[10px] uppercase sticky top-0 shadow-sm z-10 border-b border-slate-100">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Equipo</th>
                  <th className="p-3">Valores Guardados</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">No hay registros aún.</td>
                  </tr>
                ) : (
                  recentHistory.map((r) => {
                    const asset = findAsset(config, r.assetId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-xs text-slate-500 whitespace-nowrap align-top">
                          {r.date.replace('T', ' ')}
                        </td>
                        <td className="p-3 font-bold text-xs text-slate-700 align-top">
                          {asset?.name || 'Equipo Eliminado'}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {r.kwh !== undefined && (
                              <div className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                                <Zap size={12} />
                                <span className="font-mono font-bold">{r.kwh.toLocaleString()}</span> kWh
                              </div>
                            )}
                            {r.m3 !== undefined && (
                              <div className="flex items-center gap-1 text-xs bg-cyan-50 text-cyan-800 px-2 py-1 rounded border border-cyan-200">
                                <Droplets size={12} />
                                <span className="font-mono font-bold">{r.m3.toLocaleString()}</span> m³
                              </div>
                            )}
                            {r.h_run !== undefined && (
                              <div className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                <RefreshCw size={12} />
                                <span className="font-mono">{r.h_run.toLocaleString()}</span> h.Run
                              </div>
                            )}
                            {r.h_conn !== undefined && (
                              <div className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                <Clock size={12} />
                                <span className="font-mono">{r.h_conn.toLocaleString()}</span> h.Conn
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center align-top">
                          <button 
                            onClick={() => onDeleteReading(r.id)} 
                            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded transition"
                            title="Eliminar registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};