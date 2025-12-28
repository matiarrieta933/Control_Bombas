import { Reading, Asset, ExtractionPoint } from './types';

export const findAsset = (config: ExtractionPoint[], assetId: string): Asset | null => {
  for (const group of config) {
    const asset = group.assets.find(a => a.id === assetId);
    if (asset) return asset;
  }
  return null;
};

// Calculate metrics (Total Energy, Total Volume, Averages) for a list of asset IDs
export const calculateMetrics = (readings: Reading[], assetIds: string[]) => {
  // Filter readings for relevant assets and sort by date
  const relevantReadings = readings
    .filter(r => assetIds.includes(r.assetId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by Asset ID to calculate deltas per machine
  const readingsByAsset: Record<string, Reading[]> = {};
  assetIds.forEach(id => readingsByAsset[id] = []);
  
  relevantReadings.forEach(r => {
    if(readingsByAsset[r.assetId]) readingsByAsset[r.assetId].push(r);
  });

  let totalKwh = 0;
  let totalM3 = 0;
  let firstDate: number | null = null;
  let lastDate: number | null = null;

  // Calculate Deltas
  Object.values(readingsByAsset).forEach(assetReadings => {
    if (assetReadings.length < 2) return;

    for (let i = 1; i < assetReadings.length; i++) {
      const prev = assetReadings[i - 1];
      const curr = assetReadings[i];

      if (curr.kwh !== undefined && prev.kwh !== undefined) {
        totalKwh += Math.max(0, curr.kwh - prev.kwh);
      }
      if (curr.m3 !== undefined && prev.m3 !== undefined) {
        totalM3 += Math.max(0, curr.m3 - prev.m3);
      }

      const dTime = new Date(curr.date).getTime();
      if (!firstDate || dTime < firstDate) firstDate = dTime;
      if (!lastDate || dTime > lastDate) lastDate = dTime;
    }
  });

  // Calculate Averages
  let avgKwhPerDay = 0;
  let avgM3PerDay = 0;

  if (firstDate && lastDate && lastDate > firstDate) {
    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    // Avoid division by zero or extremely small numbers
    const safeDays = Math.max(daysDiff, 0.1); 
    
    avgKwhPerDay = totalKwh / safeDays;
    avgM3PerDay = totalM3 / safeDays;
  }

  return {
    totalKwh,
    totalM3,
    avgKwhPerDay,
    avgM3PerDay,
    hasData: totalKwh > 0 || totalM3 > 0
  };
};

export const getDailyStats = (readings: Reading[], assetIds: string[] | 'ALL') => {
    const stats: Record<string, { kwh: number, m3: number }> = {};
    
    // Sort all readings
    const sorted = [...readings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group by asset first to get deltas
    const byAsset: Record<string, Reading[]> = {};
    sorted.forEach(r => {
        if (!byAsset[r.assetId]) byAsset[r.assetId] = [];
        byAsset[r.assetId].push(r);
    });

    Object.keys(byAsset).forEach(aid => {
        // If filter is applied, skip if not in list
        if (assetIds !== 'ALL' && !assetIds.includes(aid)) return;

        const arr = byAsset[aid];
        for (let i = 1; i < arr.length; i++) {
            const dateKey = arr[i].date.split('T')[0];
            const prev = arr[i-1];
            const curr = arr[i];

            if (!stats[dateKey]) stats[dateKey] = { kwh: 0, m3: 0 };

            if (curr.kwh !== undefined && prev.kwh !== undefined) {
                stats[dateKey].kwh += Math.max(0, curr.kwh - prev.kwh);
            }
            if (curr.m3 !== undefined && prev.m3 !== undefined) {
                stats[dateKey].m3 += Math.max(0, curr.m3 - prev.m3);
            }
        }
    });

    return Object.entries(stats)
        .map(([date, val]) => ({ date, kwh: val.kwh, m3: val.m3 }))
        .sort((a, b) => a.date.localeCompare(b.date));
};
