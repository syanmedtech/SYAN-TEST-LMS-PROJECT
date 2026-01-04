import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  collectionGroup,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface IntegrityAttempt {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title: string;
  startTime: number;
  endTime?: number;
  score: number;
  total: number;
  percentage: number;
  integrityFlagged: boolean;
  integrityScore: number;
  integritySummary: {
    totalViolations: number;
    counts: Record<string, number>;
    integrityFlagged: boolean;
    startedAt: number;
    endedAt: number;
  };
}

export interface ProctoringEvent {
  id: string;
  type: string;
  ts: any;
  clientTimestamp: number;
  meta?: any;
}

export const fetchIntegrityAttempts = async (filters: {
  examId?: string;
  flaggedOnly?: boolean;
  days?: number;
  limit?: number;
}) => {
  try {
    let q = query(
      collectionGroup(db, "attempts"),
      orderBy("timestamp", "desc"),
      limit(filters.limit || 100)
    );

    // Apply flagged filter
    if (filters.flaggedOnly) {
      q = query(q, where("integrityFlagged", "==", true));
    }

    // Apply date filter
    if (filters.days && filters.days > 0) {
      const startTime = Date.now() - (filters.days * 24 * 60 * 60 * 1000);
      q = query(q, where("timestamp", ">=", startTime));
    }
    
    // Note: Filtering by examId (testId) in collectionGroup with other filters 
    // often requires many composite indexes. We handle exam filtering client-side for now.
    const snap = await getDocs(q);
    let results = snap.docs.map(d => ({
      id: d.id,
      userId: d.ref.parent.parent?.id,
      ...d.data()
    } as any)) as IntegrityAttempt[];

    if (filters.examId && filters.examId !== 'all') {
      results = results.filter(r => (r as any).testId === filters.examId);
    }

    return results;
  } catch (error) {
    console.error("fetchIntegrityAttempts failed:", error);
    return [];
  }
};

export const fetchProctoringTimeline = async (uid: string, attemptId: string): Promise<ProctoringEvent[]> => {
  try {
    const eventsRef = collection(db, "users", uid, "attempts", attemptId, "proctoringEvents");
    const q = query(eventsRef, orderBy("clientTimestamp", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProctoringEvent));
  } catch (error) {
    console.error("fetchProctoringTimeline failed:", error);
    return [];
  }
};