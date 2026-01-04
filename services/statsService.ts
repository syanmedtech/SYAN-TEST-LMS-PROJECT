
import { fsGetGlobalStats } from './db/firestore';

export interface GlobalStats {
  totalAttempts: number;
  avgScore: number;
  totalUsers: number;
  topPapers: { title: string, count: number }[];
  recentAttempts: any[];
}

export const getMockGlobalStats = (): GlobalStats => ({
  totalAttempts: 12540,
  avgScore: 68,
  totalUsers: 12450,
  topPapers: [
    { title: 'NEET PG 2024 - Mock 1', count: 450 },
    { title: 'USMLE Step 1 - Anatomy', count: 320 },
    { title: 'Physiology Grand Test', count: 280 }
  ],
  recentAttempts: []
});

export const fetchGlobalStats = async (mode: 'mock' | 'live', days: number = 7): Promise<GlobalStats> => {
  if (mode === 'live') {
    try {
      return await fsGetGlobalStats(days);
    } catch (e) {
      console.warn("Falling back to mock stats due to error", e);
      return getMockGlobalStats();
    }
  }
  return getMockGlobalStats();
};
