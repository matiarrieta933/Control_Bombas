import React from 'react';
import { ExtractionPoint } from '../types';

export const SheetView: React.FC<{ config: ExtractionPoint[] }> = ({ config }) => {
  return (
    <div className="animate-fade-in">
        <div className="no-print text-right mb-4">
            <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-slate-700">
                Imprimir Planilla
            </button>
        </div>

        <div className="bg-white p-8 shadow-xl max-w-[21cm] mx-auto min-h-[29.7cm] text-black border border-slate-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-xl font-black uppercase">Hoja de Control Diario</h1>
                    <p className="text-sm font-bold">CONTROL OPERATIVO DE BOMBEO & ENERGÍA</p>
                </div>
                <div className="text-right text-xs font-bold">
                    <div className="mb-2">FECHA: ___________________</div>
                    <div>RESPONSABLE: ___________________</div>
                </div>
            </div>

            <div className="space-y-4">
                {config.map(pe => (
                     <div key={pe.id} className="mb-4 break-inside-avoid">
                        <div className="bg-black text-white text-xs font-bold px-2 py-1 uppercase">{pe.name}</div>
                        <table className="w-full border-collapse border border-black text-xs">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-black p-1 w-1/4">Equipo</th>
                                    <th className="border border-black p-1 w-20">Hora</th>
                                    <th className="border border-black p-1">Lectura kWh</th>
                                    <th className="border border-black p-1">Hrs Conex.</th>
                                    <th className="border border-black p-1">Hrs Marcha</th>
                                    <th className="border border-black p-1">Lectura m³</th>
                                    <th className="border border-black p-1 w-1/4">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pe.assets.map(a => {
                                    const isFIT = a.type === 'FIT';
                                    const isVDF = a.type === 'VDF';
                                    
                                    return (
                                        <tr key={a.id}>
                                            <td className="border border-black p-2 font-bold">{a.name} ({a.type})</td>
                                            <td className="border border-black p-2"></td>
                                            <td className={`border border-black p-2 ${isFIT ? 'bg-gray-200' : ''}`}></td>
                                            <td className={`border border-black p-2 ${isFIT ? 'bg-gray-200' : ''}`}></td>
                                            <td className={`border border-black p-2 ${!isVDF ? 'bg-gray-200' : ''}`}></td>
                                            <td className={`border border-black p-2 ${!isFIT ? 'bg-gray-200' : ''}`}></td>
                                            <td className="border border-black p-2"></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                ))}
            </div>

             <div className="mt-8 border border-black p-4 h-24">
                <p className="text-xs font-bold mb-2">NOVEDADES / OBSERVACIONES GENERALES:</p>
            </div>
        </div>
    </div>
  );
};
