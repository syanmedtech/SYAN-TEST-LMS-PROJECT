import { 
  collectionGroup, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface MockLeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  total: number;
  percentage: number;
  startTime: number;
  endTime: number;
  timestamp: number;
  durationSeconds: number;
}

/**
 * Fetches the top-performing students for a specific mock exam.
 * Ranked by percentage (DESC) and then duration (ASC) to reward speed in case of ties.
 */
export const fetchMockLeaderboard = async (testId: string): Promise<MockLeaderboardEntry[]> => {
  try {
    const q = query(
      collectionGroup(db, "attempts"),
      where("testId", "==", testId),
      where("mode", "==", "EXAM"),
      orderBy("percentage", "desc"),
      limit(100)
    );
    
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => {
      const data = doc.data();
      const start = data.startTime || 0;
      const end = data.endTime || data.timestamp || 0;
      const duration = Math.max(0, Math.floor((end - start) / 1000));
      
      return {
        id: doc.id,
        userId: data.userId || 'anon',
        userName: data.userName || 'Student',
        userEmail: data.userEmail || '',
        score: data.score || 0,
        total: data.total || 0,
        percentage: data.percentage || 0,
        startTime: start,
        endTime: end,
        timestamp: data.timestamp || 0,
        durationSeconds: duration
      };
    });

    // Client-side tie-breaker: Secondary sort by duration ascending
    return results.sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.durationSeconds - b.durationSeconds;
    });
  } catch (error) {
    console.error("fetchMockLeaderboard failed:", error);
    return [];
  }
};