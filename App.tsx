import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RegisterView } from './components/RegisterView';
import { ScadaView } from './components/ScadaView';
import { DashboardView } from './components/DashboardView';
import { TableReportView } from './components/TableReportView';
import { SheetView } from './components/SheetView';
import { ConfigView } from './components/ConfigView';
import { DEFAULT_CONFIG } from './constants';
import { ExtractionPoint, Reading } from './types';

const App = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [config, setConfig] = useState<ExtractionPoint[]>(DEFAULT_CONFIG);
  const [readings, setReadings] = useState<Reading[]>([]);

  // Load data on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('bes_v3_config');
    const savedReadings = localStorage.getItem('bes_v3_readings');
    
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedReadings) setReadings(JSON.parse(savedReadings));
  }, []);

  // Persistence helpers
  const updateConfig = (newConfig: ExtractionPoint[]) => {
    setConfig(newConfig);
    localStorage.setItem('bes_v3_config', JSON.stringify(newConfig));
  };

  const addReading = (newReading: Reading) => {
    const updated = [...readings, newReading];
    setReadings(updated);
    localStorage.setItem('bes_v3_readings', JSON.stringify(updated));
  };

  const deleteReading = (id: number) => {
    if (confirm('¿Borrar registro?')) {
      const updated = readings.filter(r => r.id !== id);
      setReadings(updated);
      localStorage.setItem('bes_v3_readings', JSON.stringify(updated));
    }
  };

  // Header actions
  const handleReset = () => {
    if (confirm('ADVERTENCIA: ¿Borrar TODOS los datos y configuración? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleBackup = () => {
    const data = JSON.stringify({ config, readings });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BES_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.config && data.readings && confirm('¿Sobrescribir los datos actuales con este respaldo?')) {
          setConfig(data.config);
          setReadings(data.readings);
          localStorage.setItem('bes_v3_config', JSON.stringify(data.config));
          localStorage.setItem('bes_v3_readings', JSON.stringify(data.readings));
          alert('Sistema restaurado con éxito.');
        }
      } catch (err) {
        alert('Error al leer el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  // Simulation Logic
  const handleLoadDemoData = () => {
    const newReadings: Reading[] = [];
    const now = new Date();
    // Start 30 days ago at 08:00 AM
    const startDate = new Date();
    startDate.setDate(now.getDate() - 30);
    startDate.setHours(8, 0, 0, 0);

    // Initial base values for counters
    const accumulators: Record<string, { kwh: number, m3: number, hours: number }> = {};
    
    // Initialize random start values for all configured assets
    config.forEach(group => {
        group.assets.forEach(asset => {
            accumulators[asset.id] = {
                kwh: Math.floor(Math.random() * 50000) + 10000,
                m3: Math.floor(Math.random() * 500000) + 50000,
                hours: Math.floor(Math.random() * 5000) + 1000
            };
        });
    });

    // Simulate 30 days
    for (let d = 0; d <= 30; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + d);
        
        // Add some noise to the exact time (e.g., +/- 30 mins)
        const timeNoise = Math.floor(Math.random() * 60) - 30;
        currentDate.setMinutes(currentDate.getMinutes() + timeNoise);
        
        const dateStr = currentDate.toISOString().slice(0, 16);

        config.forEach(group => {
            group.assets.forEach(asset => {
                const acc = accumulators[asset.id];
                
                // --- Simulation Profiles ---
                let dailyHours = 0;
                let kwRating = 0;
                let flowRate = 0;

                // TBO 3 Profile
                if (asset.id.includes('tbo_3')) {
                    dailyHours = 18 + (Math.random() * 4); // 18-22h
                    kwRating = 35; // 35 kW
                    flowRate = 110; // 110 m3/h
                } 
                // TBO 4/5 Profile
                else if (asset.id.includes('tbo_4') || asset.id.includes('tbo_5')) {
                    dailyHours = 10 + (Math.random() * 4); // 10-14h
                    kwRating = 45; 
                    flowRate = 130;
                }
                // Piles 42/50/64 Profile
                else if (asset.id.includes('42') || asset.id.includes('50') || asset.id.includes('64')) {
                    dailyHours = 20 + (Math.random() * 4); // Almost constant
                    kwRating = 20;
                    flowRate = 60;
                }
                // BES Profile
                else if (asset.id.includes('bes')) {
                    dailyHours = 24;
                    flowRate = 250; 
                }
                // Default fallback
                else {
                    dailyHours = 12;
                    kwRating = 10;
                    flowRate = 50;
                }

                // Cap hours at 24 max per interval
                dailyHours = Math.min(24, dailyHours);

                // Increment Counters
                if (asset.type === 'VDF' || asset.type === 'SS') {
                    // Pumps consume Energy and add Hours
                    const kwhDelta = dailyHours * kwRating * (0.9 + Math.random() * 0.2); // +/- 10% efficiency var
                    acc.kwh += kwhDelta;
                    acc.hours += dailyHours;
                    
                    newReadings.push({
                        id: Date.now() + Math.random(),
                        date: dateStr,
                        assetId: asset.id,
                        kwh: Number(acc.kwh.toFixed(2)),
                        h_run: Number(acc.hours.toFixed(1)),
                        h_conn: Number((acc.hours * 1.05).toFixed(1)) // conn slightly higher than run
                    });
                } else if (asset.type === 'FIT') {
                    // Flow meters count Volume
                    const m3Delta = dailyHours * flowRate * (0.8 + Math.random() * 0.4); // flow variation
                    acc.m3 += m3Delta;

                    newReadings.push({
                        id: Date.now() + Math.random(),
                        date: dateStr,
                        assetId: asset.id,
                        m3: Number(acc.m3.toFixed(0))
                    });
                }
            });
        });
    }

    setReadings(newReadings);
    localStorage.setItem('bes_v3_readings', JSON.stringify(newReadings));
    alert('Datos de prueba generados exitosamente (30 días). Revise los dashboards.');
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setTab={setActiveTab}
      onReset={handleReset}
      onBackup={handleBackup}
      onRestore={handleRestore}
    >
      {activeTab === 'input' && (
        <RegisterView 
          config={config} 
          readings={readings} 
          onAddReading={addReading} 
          onDeleteReading={deleteReading}
        />
      )}
      
      {activeTab === 'scada' && (
        <ScadaView config={config} readings={readings} />
      )}
      
      {activeTab === 'dashboard' && (
        <DashboardView config={config} readings={readings} />
      )}
      
      {activeTab === 'table-report' && (
        <TableReportView config={config} readings={readings} />
      )}

      {activeTab === 'sheet' && (
        <SheetView config={config} />
      )}

      {activeTab === 'config' && (
        <ConfigView 
            config={config} 
            onUpdateConfig={updateConfig} 
            onLoadDemoData={handleLoadDemoData}
        />
      )}
    </Layout>
  );
};

export default App;