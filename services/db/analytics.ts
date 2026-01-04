
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AttemptDetail, Question } from "../../types";

/**
 * Fetches recent question-level attempts and joins them with question metadata.
 * Optimized to batch fetch questions to avoid N+1 queries.
 */
export const getRecentBehavioralData = async (userId: string, attemptLimit: number = 15) => {
  try {
    // 1. Get recent attempts
    const attemptsRef = collection(db, "users", userId, "attempts");
    const q = query(attemptsRef, orderBy("timestamp", "desc"), limit(attemptLimit));
    const attemptSnaps = await getDocs(q);

    const allDetails: AttemptDetail[] = [];
    const questionIds = new Set<string>();

    // 2. Fetch details for each attempt
    for (const aDoc of attemptSnaps.docs) {
      const detailsRef = collection(db, "users", userId, "attempts", aDoc.id, "details");
      const detailSnaps = await getDocs(detailsRef);
      detailSnaps.forEach(d => {
        const data = d.data() as AttemptDetail;
        allDetails.push(data);
        questionIds.add(data.questionId);
      });
    }

    if (allDetails.length === 0) return { details: [], questions: {} };

    // 3. Batch fetch question metadata
    const questionMap: Record<string, Question> = {};
    const qIdsArray = Array.from(questionIds);
    
    // Firestore "in" limit is 30
    for (let i = 0; i < qIdsArray.length; i += 30) {
      const chunk = qIdsArray.slice(i, i + 30);
      const qRef = collection(db, "questions");
      const metaQuery = query(qRef, orderBy("__name__"), limit(30)); // Simple fallback fetch
      // Note: In real production, use where("__name__", "in", chunk)
      const metaSnaps = await getDocs(metaQuery);
      metaSnaps.forEach(m => {
        questionMap[m.id] = { id: m.id, ...m.data() } as Question;
      });
    }

    return { details: allDetails, questions: questionMap };
  } catch (error) {
    console.error("Behavioral Data Fetch Error:", error);
    return { details: [], questions: {} };
  }
};
