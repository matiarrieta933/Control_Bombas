import React, { useRef } from 'react';
import { 
  Factory, 
  PenTool, 
  Activity, 
  BarChart3, 
  Table, 
  FileText, 
  Settings, 
  Download, 
  Upload, 
  Trash2 
} from 'lucide-react';
import { ExtractionPoint, Reading } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setTab: (tab: string) => void;
  onReset: () => void;
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setTab, onReset, onBackup, onRestore 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const NavButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`
        px-6 py-3 border-b-2 font-medium text-xs uppercase tracking-widest flex items-center gap-2 transition-colors whitespace-nowrap
        ${activeTab === id 
          ? 'border-blue-600 text-blue-700 bg-slate-50' 
          : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 no-print shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded flex items-center justify-center shadow-lg">
              <Factory className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight uppercase">Control Operativo de Bombeo</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gestión de Motores & Flujos - Planta BES</p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button onClick={onBackup} className="text-xs px-3 py-2 hover:bg-slate-700 rounded text-slate-300 transition flex items-center gap-2">
              <Download size={14} /> Backup
            </button>
            <label className="text-xs px-3 py-2 hover:bg-slate-700 rounded text-slate-300 cursor-pointer transition flex items-center gap-2">
              <Upload size={14} /> Restaurar
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json"
                onChange={onRestore} 
              />
            </label>
            <div className="w-px bg-slate-600 my-1"></div>
            <button onClick={onReset} className="text-xs px-3 py-2 hover:bg-rose-900 text-rose-400 rounded transition flex items-center gap-2">
              <Trash2 size={14} /> Reset
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-20 z-40 no-print overflow-x-auto">
        <div className="max-w-7xl mx-auto flex min-w-max">
          <NavButton id="input" icon={PenTool} label="1. Registro" />
          <NavButton id="scada" icon={Activity} label="2. Proceso / Flujo" />
          <NavButton id="dashboard" icon={BarChart3} label="3. KPI & Gráficos" />
          <NavButton id="table-report" icon={Table} label="4. Reporte Tabular" />
          <NavButton id="sheet" icon={FileText} label="5. Planilla Campo" />
          <div className="flex-grow"></div>
          <NavButton id="config" icon={Settings} label="Config" />
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 pb-24">
        {children}
      </main>
    </div>
  );
};
