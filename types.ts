export type AssetType = 'SS' | 'VDF' | 'FIT';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
}

export interface ExtractionPoint {
  id: string;
  name: string;
  assets: Asset[];
}

export interface Reading {
  id: number;
  date: string;
  assetId: string;
  kwh?: number;
  h_conn?: number;
  h_run?: number;
  m3?: number;
}

export interface ProcessedStat {
  date: string;
  kwh: number;
  m3: number;
  hours: number;
}
