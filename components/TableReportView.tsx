import React, { useMemo } from 'react';
import { ExtractionPoint, Reading } from '../types';
import { findAsset } from '../utils';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TableReportViewProps {
  config: ExtractionPoint[];
  readings: Reading[];
}

export const TableReportView: React.FC<TableReportViewProps> = ({ config, readings }) => {

  const rows = useMemo(() => {
    const computedRows: any[] = [];
    const grouped: Record<string, Reading[]> = {};
    
    // Sort ascending first to calculate deltas
    const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(r => {
      if (!grouped[r.assetId]) grouped[r.assetId] = [];
      grouped[r.assetId].push(r);
    });

    Object.keys(grouped).forEach(aid => {
      const arr = grouped[aid];
      const asset = findAsset(config, aid);
      const assetName = asset?.name || aid;

      for (let i = 1; i < arr.length; i++) {
        const curr = arr[i];
        const prev = arr[i - 1];

        const dTimeHours = (new Date(curr.date).getTime() - new Date(prev.date).getTime()) / 3600000;

        let dKwh = 0;
        let dM3 = 0;
        let power = 0;
        let norm24 = 0;

        if (curr.kwh !== undefined && prev.kwh !== undefined) {
          dKwh = Math.max(0, curr.kwh - prev.kwh);
          power = dTimeHours > 0.01 ? dKwh / dTimeHours : 0;
          norm24 = power * 24;
        }

        if (curr.m3 !== undefined && prev.m3 !== undefined) {
            dM3 = Math.max(0, curr.m3 - prev.m3);
        }

        computedRows.push({
          id: curr.id,
          date: curr.date.replace('T', ' '),
          asset: assetName,
          readKwh: curr.kwh,
          readM3: curr.m3,
          dKwh,
          dM3,
          dTimeHours,
          power,
          norm24
        });
      }
    });

    // Return sorted by date descending (newest first)
    return computedRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [readings, config]);

  const handleExportExcel = () => {
    // Transform data for clean Excel columns
    const dataToExport = rows.map(row => ({
        "Fecha/Hora": row.date,
        "Equipo": row.asset,
        "Lectura kWh": row.readKwh || 0,
        "Delta kWh": row.dKwh > 0 ? Number(row.dKwh.toFixed(2)) : 0,
        "Delta m³": row.dM3 > 0 ? Number(row.dM3.toFixed(2)) : 0,
        "Horas Reales": Number(row.dTimeHours.toFixed(2)),
        "Pot. Media (kW)": row.power > 0 ? Number(row.power.toFixed(2)) : 0,
        "Consumo 24h (Calc)": row.norm24 > 0 ? Number(row.norm24.toFixed(2)) : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Auto-width for columns
    const wscols = [
        {wch: 20}, // Date
        {wch: 25}, // Asset
        {wch: 15}, // Read
        {wch: 15}, // Delta Kwh
        {wch: 15}, // Delta m3
        {wch: 15}, // Hours
        {wch: 15}, // Power
        {wch: 20}, // Norm 24
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    XLSX.writeFile(workbook, `Reporte_Bombeo_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="animate-fade-in">
       <div className="no-print mb-4 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Reporte de Lecturas y Cálculo 24h</h2>
        <div className="flex gap-2">
            <button 
                onClick={handleExportExcel} 
                className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-green-700 flex items-center gap-2 shadow-sm"
            >
                <Download size={14} /> Exportar Excel
            </button>
            <button 
                onClick={() => window.print()} 
                className="bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-slate-700 shadow-sm"
            >
                Imprimir Tabla
            </button>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm border border-slate-200 min-h-[500px]">
        <div className="hidden print-only mb-4 border-b border-black pb-2">
            <h2 className="text-lg font-bold">Registro de Lecturas y Consumo Normalizado (24h)</h2>
            <p className="text-xs">Nota: "Potencia (kW)" representa la velocidad de consumo promedio en el periodo.</p>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 uppercase font-bold text-slate-600">
                    <tr>
                        <th className="p-2 border border-slate-300">Fecha/Hora</th>
                        <th className="p-2 border border-slate-300">Equipo</th>
                        <th className="p-2 border border-slate-300 text-right bg-slate-50">Lectura kWh</th>
                        <th className="p-2 border border-slate-300 text-right bg-blue-50">Delta kWh</th>
                        <th className="p-2 border border-slate-300 text-right bg-cyan-50">Delta m³</th>
                        <th className="p-2 border border-slate-300 text-right bg-slate-50">Horas Reales</th>
                        <th className="p-2 border border-slate-300 text-right font-bold text-slate-800 bg-yellow-50" title="Consumo Promedio por Hora (Delta kWh / Horas Reales)">Pot. Media (kW)</th>
                        <th className="p-2 border border-slate-300 text-right font-black text-black border-l-2 border-l-slate-400" title="Proyección: Potencia Media x 24h">Consumo 24h (Calc)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-slate-700">
                    {rows.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50 border-b border-slate-100">
                             <td className="p-2 border-r border-slate-200 whitespace-nowrap">{row.date}</td>
                             <td className="p-2 border-r border-slate-200 font-bold">{row.asset}</td>
                             <td className="p-2 border-r border-slate-200 text-right bg-slate-50">{row.readKwh?.toFixed(1) || '-'}</td>
                             <td className="p-2 border-r border-slate-200 text-right bg-blue-50 text-blue-800 font-bold">{row.dKwh > 0 ? row.dKwh.toFixed(1) : '-'}</td>
                             <td className="p-2 border-r border-slate-200 text-right bg-cyan-50 text-cyan-800 font-bold">{row.dM3 > 0 ? row.dM3.toFixed(0) : '-'}</td>
                             <td className="p-2 border-r border-slate-200 text-right bg-slate-50">{row.dTimeHours.toFixed(2)} h</td>
                             <td className="p-2 border-r border-slate-200 text-right font-bold bg-yellow-50 text-amber-700">{row.power > 0 ? row.power.toFixed(2) : '-'}</td>
                             <td className="p-2 text-right font-black border-l-2 border-slate-300 text-slate-900">{row.norm24 > 0 ? row.norm24.toFixed(1) : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};