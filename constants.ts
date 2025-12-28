import { ExtractionPoint } from './types';

export const DEFAULT_CONFIG: ExtractionPoint[] = [
  {
    id: 'pe_tbo_3', 
    name: 'TBO 3 (Planta Química)',
    assets: [
        { id: 'b_tbo_3', name: 'Bomba TBO 3', type: 'VDF' }, 
        { id: 'fit_tbo_3', name: 'FIT TBO 3', type: 'FIT' }
    ]
  },
  {
    id: 'pe_tbo_4_5', 
    name: 'TBO 4/5 (Planta Química)',
    assets: [
        { id: 'b_tbo_4', name: 'Bomba TBO 4', type: 'VDF' },
        { id: 'b_tbo_5', name: 'Bomba TBO 5', type: 'VDF' },
        { id: 'fit_tbo_4_5', name: 'FIT TBO 4/5', type: 'FIT' }
    ]
  },
  {
    id: 'pe_42_50', 
    name: 'Pilas 42/50',
    assets: [
        { id: 'b_42', name: 'Bomba Pila 42', type: 'SS' }, 
        { id: 'b_50', name: 'Bomba Pila 50', type: 'SS' }, 
        { id: 'fit_42_50', name: 'FIT 42/50', type: 'FIT' }
    ]
  },
  {
    id: 'pe_64', 
    name: 'Pila 64',
    assets: [
        { id: 'b_64', name: 'Bomba Pila 64', type: 'SS' }, 
        { id: 'fit_64', name: 'FIT 64', type: 'FIT' }
    ]
  },
  {
    id: 'pe_osmosis', 
    name: 'Osmosis / Ingreso BES',
    assets: [
        { id: 'fit_bes_in', name: 'FIT Ingreso BES', type: 'FIT' }
    ]
  }
];
