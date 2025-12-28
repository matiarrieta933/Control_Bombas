import React from 'react';
import { ExtractionPoint, AssetType } from '../types';
import { Plus, Trash2, Database } from 'lucide-react';

interface ConfigViewProps {
  config: ExtractionPoint[];
  onUpdateConfig: (newConfig: ExtractionPoint[]) => void;
  onLoadDemoData: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ config, onUpdateConfig, onLoadDemoData }) => {

  const addPoint = () => {
    const newPoint: ExtractionPoint = {
      id: `pe_${Date.now()}`,
      name: 'Nuevo Punto de Extracción',
      assets: []
    };
    onUpdateConfig([...config, newPoint]);
  };

  const removePoint = (id: string) => {
    if (confirm('¿Eliminar este grupo y todos sus equipos?')) {
      onUpdateConfig(config.filter(c => c.id !== id));
    }
  };

  const updatePointName = (id: string, name: string) => {
    onUpdateConfig(config.map(c => c.id === id ? { ...c, name } : c));
  };

  const addAsset = (pointId: string) => {
    const typeStr = prompt('Tipo de equipo (SS, VDF, FIT):', 'SS');
    if (!typeStr) return;
    
    const type = typeStr.toUpperCase() as AssetType;
    if (!['SS', 'VDF', 'FIT'].includes(type)) {
      alert('Tipo inválido. Use SS, VDF o FIT.');
      return;
    }

    const newAsset = {
      id: `as_${Date.now()}`,
      name: 'Nuevo Equipo',
      type
    };

    onUpdateConfig(config.map(c => {
      if (c.id === pointId) {
        return { ...c, assets: [...c.assets, newAsset] };
      }
      return c;
    }));
  };

  const removeAsset = (pointId: string, assetId: string) => {
    onUpdateConfig(config.map(c => {
      if (c.id === pointId) {
        return { ...c, assets: c.assets.filter(a => a.id !== assetId) };
      }
      return c;
    }));
  };

  const updateAssetName = (pointId: string, assetId: string, name: string) => {
    onUpdateConfig(config.map(c => {
      if (c.id === pointId) {
        const newAssets = c.assets.map(a => a.id === assetId ? { ...a, name } : a);
        return { ...c, assets: newAssets };
      }
      return c;
    }));
  };

  return (
    <div className="card p-6 border-l-4 border-slate-500 bg-white shadow-sm rounded-lg animate-fade-in">
      <div className="flex justify-between mb-6">
        <h2 className="font-bold text-lg text-slate-800">Configuración de Activos</h2>
        <div className="flex gap-2">
            <button 
            onClick={() => {
                if(confirm('Esto generará datos aleatorios para el último mes y BORRARÁ los datos actuales. ¿Continuar?')) {
                    onLoadDemoData();
                }
            }} 
            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2 hover:bg-indigo-700"
            >
            <Database size={14} /> Generar Datos Prueba (1 Mes)
            </button>
            <button 
            onClick={addPoint} 
            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2 hover:bg-green-700"
            >
            <Plus size={14} /> Agregar Punto
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {config.map(pe => (
          <div key={pe.id} className="bg-slate-50 p-4 rounded border border-slate-200">
             <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                <input 
                  value={pe.name} 
                  onChange={(e) => updatePointName(pe.id, e.target.value)}
                  className="font-bold bg-transparent outline-none w-2/3 text-slate-700 focus:border-b focus:border-blue-500"
                />
                <div className="flex gap-2">
                    <button onClick={() => addAsset(pe.id)} className="text-xs border px-2 py-1 bg-white rounded shadow-sm hover:bg-slate-100">
                        + Equipo
                    </button>
                    <button onClick={() => removePoint(pe.id)} className="text-rose-500 p-1 hover:bg-rose-100 rounded">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="pl-4 space-y-2">
              {pe.assets.map(a => (
                <div key={a.id} className="flex items-center gap-2 text-sm bg-white p-2 border border-slate-200 rounded">
                   <span className={`
                     text-[10px] font-bold px-1.5 py-0.5 rounded
                     ${a.type === 'FIT' ? 'bg-cyan-100 text-cyan-700' : 
                       a.type === 'VDF' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}
                   `}>
                     {a.type}
                   </span>
                   <input 
                     value={a.name} 
                     onChange={(e) => updateAssetName(pe.id, a.id, e.target.value)}
                     className="flex-1 outline-none text-slate-600 focus:text-black"
                   />
                   <button onClick={() => removeAsset(pe.id, a.id)} className="text-slate-400 hover:text-rose-500">
                     <Trash2 size={12} />
                   </button>
                </div>
              ))}
              {pe.assets.length === 0 && <div className="text-xs text-slate-400 italic">Sin equipos asignados</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};