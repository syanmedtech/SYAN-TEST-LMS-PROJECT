import { 
  collectionGroup, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  getCountFromServer
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface GlobalAttempt {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  title: string;
  score: number;
  total: number;
  percentage: number;
  mode: 'TUTOR' | 'EXAM';
  timestamp: number;
  testId?: string;
  programId?: string;
}

/**
 * Fetches all attempts for a specific test across the entire platform.
 */
export const fetchAttemptsByTestId = async (testId: string): Promise<GlobalAttempt[]> => {
  try {
    const q = query(
      collectionGroup(db, "attempts"),
      where("testId", "==", testId),
      orderBy("timestamp", "desc"),
      limit(200) // Safety limit for dashboard view
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GlobalAttempt));
  } catch (error) {
    console.error("fetchAttemptsByTestId failed:", error);
    return [];
  }
};

/**
 * Fetches the total count of attempts for a specific test efficiently.
 */
export const getAttemptCountForTest = async (testId: string): Promise<number> => {
  try {
    const q = query(
      collectionGroup(db, "attempts"),
      where("testId", "==", testId)
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (e) {
    console.warn("Could not fetch attempt count for", testId, e);
    return 0;
  }
};