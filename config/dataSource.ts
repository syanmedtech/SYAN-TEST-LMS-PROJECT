
export type DataSource = 'mock' | 'firestore';

// @ts-ignore - Support Vite env if available, else default to 'mock'
const envSource = typeof process !== 'undefined' ? process.env?.VITE_DATA_SOURCE : (import.meta as any).env?.VITE_DATA_SOURCE;

export const DATA_SOURCE: DataSource = (envSource as DataSource) || 'mock';
