
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  collectionGroup,
  limit,
  writeBatch,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Topic, Paper, Question, Option, AppSettings, User, QuizSession, AttemptDetailMap, AttemptDetail, FlashcardRecord } from "../../types";
import { QuizControls } from "../../shared/config/adminRulesTypes";
import { calculateNextReview, SRRating } from "../../shared/services/spacedRepetition";

/**
 * Proctoring: Log specific granular integrity event
 */
export const fsLogProctoringEvent = async (params: {
  uid: string;
  examId: string;
  attemptId: string;
  event: {
    type:
      | 'SESSION_START'
      | 'SESSION_END'
      | 'FULLSCREEN_EXIT'
      | 'TAB_HIDDEN'
      | 'WINDOW_BLUR'
      | 'COPY_ATTEMPT'
      | 'PASTE_ATTEMPT'
      | 'RIGHT_CLICK'
      | 'TEXT_SELECTION'
      | 'BACK_NAV_ATTEMPT'
      | 'FOCUS_LOST'
      | 'FOCUS_GAINED'
      | 'THRESHOLD_REACHED'
      | 'USER_SCREENSHOT'
      | 'NETWORK_CHANGE'
      | 'CLOCK_SKEW'
      | 'DEVTOOLS_SUSPECTED';
    meta?: Record<string, any>;
  }
}) => {
  try {
    const eventsRef = collection(db, "users", params.uid, "attempts", params.attemptId, "proctoringEvents");
    await addDoc(eventsRef, {
      ...params.event,
      examId: params.examId,
      ts: serverTimestamp(),
      clientTimestamp: Date.now()
    });

    await addDoc(collection(db, "violations"), {
      userId: params.uid,
      examId: params.examId,
      attemptId: params.attemptId,
      type: params.event.type,
      meta: params.event.meta || {},
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("fsLogProctoringEvent failed", e);
  }
};

/**
 * Proctoring: Update attempt document with integrity result
 */
export const fsSetAttemptIntegrity = async (
  uid: string, 
  attemptId: string, 
  payload: { 
    integrityFlagged: boolean; 
    integrityScore: number; 
    integritySummary: any 
  }
) => {
  try {
    const attemptRef = doc(db, "users", uid, "attempts", attemptId);
    await updateDoc(attemptRef, {
      integrityFlagged: payload.integrityFlagged,
      integrityScore: payload.integrityScore,
      integritySummary: payload.integritySummary,
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("fsSetAttemptIntegrity failed", e);
  }
};

/**
 * Proctoring: Log specific integrity violation (Legacy wrapper)
 */
export const fsLogViolation = async (userId: string, examId: string, attemptId: string, payload: {
  type: string;
  meta?: any;
  severity?: 'low' | 'medium' | 'high';
}) => {
  try {
    const violationsRef = collection(db, "violations");
    await addDoc(violationsRef, {
      userId: userId || 'anonymous',
      examId: examId || 'unknown',
      attemptId: attemptId || 'unknown',
      type: payload.type,
      severity: payload.severity || 'low',
      meta: {
        ...(payload.meta || {}),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        page: window.location.pathname
      },
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn("fsLogViolation failed", e);
  }
};

/**
 * Maps correctOptionIndex (0-3) to 'a'-'d'
 */
const mapIndexToId = (index: number): 'a' | 'b' | 'c' | 'd' => {
  return (['a', 'b', 'c', 'd'][index] as 'a' | 'b' | 'c' | 'd') || 'a';
};

/**
 * Maps Firestore question data to UI Question type
 */
const mapFsQuestion = (id: string, data: any): Question => ({
  id,
  text: data.questionText || '',
  options: (data.options || []).map((text: string, i: number): Option => ({
    id: mapIndexToId(i),
    text
  })),
  correctAnswer: mapIndexToId(data.correctOptionIndex ?? 0),
  explanation: data.explanation || '',
  topicId: data.subtopicId || data.topicId || data.subjectId || 'unknown',
  communityStats: data.communityStats || { a: 25, b: 25, c: 25, d: 25 },
  difficulty: data.difficulty || 'Medium',
  totalAttempts: data.totalAttempts || 0,
  isAiGenerated: data.isAiGenerated ?? false
});

/**
 * Global Admin Stats: Fetch aggregated attempts across all users
 */
export const fsGetGlobalStats = async (days: number = 7) => {
  try {
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const q = query(
      collectionGroup(db, "attempts"),
      where("timestamp", ">=", startTime),
      orderBy("timestamp", "desc")
    );
    
    const snap = await getDocs(q);
    const attempts = snap.docs.map(doc => doc.data());
    
    // Aggregation
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
    
    // Top Papers
    const paperCounts: Record<string, number> = {};
    attempts.forEach(a => {
      const title = a.title || 'Unknown Quiz';
      paperCounts[title] = (paperCounts[title] || 0) + 1;
    });
    
    const topPapers = Object.entries(paperCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get Total Users
    const usersSnap = await getDocs(collection(db, "users"));
    const totalUsers = usersSnap.size;

    return {
      totalAttempts,
      avgScore,
      totalUsers,
      topPapers,
      recentAttempts: attempts.slice(0, 10)
    };
  } catch (error) {
    console.error("Firestore Global Stats Error:", error);
    throw error;
  }
};

/**
 * Granular Stats: Fetches question-level details for behavioral analysis
 */
export const fsGetDetailedStats = async (days: number = 7, maxDocs: number = 5000): Promise<AttemptDetail[]> => {
  try {
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const q = query(
      collectionGroup(db, "details"),
      where("updatedAt", ">=", startTime),
      limit(maxDocs)
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as AttemptDetail);
  } catch (error) {
    console.error("Firestore Detailed Stats Error:", error);
    return [];
  }
};

/**
 * Silent Logging: Upsert User Profile
 */
export const fsLogUser = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.id);
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      lastLogin: Date.now(),
      updatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn("Silent Log User failed", e);
  }
};

/**
 * Silent Logging: Record Quiz Attempt
 */
export const fsLogAttempt = async (userId: string, session: QuizSession, sourceId?: string, sourceType?: string) => {
  try {
    const attemptsRef = collection(db, "users", userId, "attempts");
    await addDoc(attemptsRef, {
      title: session.title || 'Untitled Quiz',
      score: session.score,
      total: session.questions.length,
      percentage: Math.round((session.score / (session.questions.length || 1)) * 100),
      startTime: session.startTime,
      endTime: session.endTime || Date.now(),
      mode: session.mode,
      answers: session.answers,
      flaggedCount: session.flagged?.size || 0,
      timestamp: Date.now(),
      testId: session.testId || sourceId || null,
      programId: session.programId || null,
      sourceType: sourceType || session.sourceType || (session.mode === 'EXAM' ? 'exam' : 'practice'),
      
      // Extended Metadata (V2)
      correctCount: session.correctCount ?? null,
      wrongCount: session.wrongCount ?? null,
      skippedCount: session.skippedCount ?? null,
      negativeMarkingEnabled: session.scoring?.negativeMarkingEnabled ?? session.negativeMarkingEnabled ?? false,
      negativeMarkPerWrong: session.scoring?.negativeMarkPerWrong ?? session.negativeMarkingValue ?? null,
      negativeMarkPerSkipped: session.scoring?.negativeMarkPerSkipped ?? null,
      
      // Integrity metadata
      integrityFlagged: (session as any).integrityFlagged ?? false,
      integrityScore: (session as any).proctoringSummary?.totalViolations ?? 0,
      integritySummary: (session as any).proctoringSummary || null
    });
  } catch (e) {
    console.warn("Silent Log Attempt failed", e);
  }
};

/**
 * Creates an attempt document and returns its ID
 */
export const fsCreateAttempt = async (userId: string, session: QuizSession, sourceId?: string, sourceType?: string): Promise<string | null> => {
  if (!userId) return null;
  try {
    const attemptsRef = collection(db, "users", userId, "attempts");
    const docRef = await addDoc(attemptsRef, {
      title: session.title || 'Untitled Quiz',
      score: session.score,
      total: session.questions.length,
      percentage: Math.round((session.score / (session.questions.length || 1)) * 100),
      startTime: session.startTime,
      endTime: session.endTime || Date.now(),
      mode: session.mode,
      answers: session.answers,
      flaggedCount: session.flagged?.size || 0,
      timestamp: Date.now(),
      testId: session.testId || sourceId || null,
      programId: session.programId || null,
      sourceType: sourceType || session.sourceType || (session.mode === 'EXAM' ? 'exam' : 'practice'),

      // Extended Metadata (V2)
      correctCount: session.correctCount ?? null,
      wrongCount: session.wrongCount ?? null,
      skippedCount: session.skippedCount ?? null,
      negativeMarkingEnabled: session.scoring?.negativeMarkingEnabled ?? session.negativeMarkingEnabled ?? false,
      negativeMarkPerWrong: session.scoring?.negativeMarkPerWrong ?? session.negativeMarkingValue ?? null,
      negativeMarkPerSkipped: session.scoring?.negativeMarkPerSkipped ?? null,
      
      // Integrity metadata
      integrityFlagged: (session as any).integrityFlagged ?? false,
      integrityScore: (session as any).proctoringSummary?.totalViolations ?? 0,
      integritySummary: (session as any).proctoringSummary || null
    });
    return docRef.id;
  } catch (e) {
    console.warn("fsCreateAttempt failed", e);
    return null;
  }
};

/**
 * Fetches recent attempts for a specific user, optionally filtered by examId
 */
export const fsGetRecentAttempts = async (userId: string, examId?: string, limitN = 50) => {
  try {
    const attemptsRef = collection(db, "users", userId, "attempts");
    const q = query(attemptsRef, orderBy("timestamp", "desc"), limit(limitN));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    
    if (examId) {
      return all.filter(a => a.testId === examId || a.sourceId === examId);
    }
    return all;
  } catch (e) {
    console.warn("fsGetRecentAttempts failed", e);
    return [];
  }
};

/**
 * Fetches all question IDs attempted in the last N sessions.
 */
export const fsGetRecentAttemptedQuestionIds = async (userId: string, limitAttempts = 30): Promise<Set<string>> => {
  try {
    const recent = await fsGetRecentAttempts(userId, undefined, limitAttempts);
    const ids = new Set<string>();
    recent.forEach((attempt: any) => {
      if (attempt.answers) {
        Object.keys(attempt.answers).forEach(qId => ids.add(qId));
      }
    });
    return ids;
  } catch (e) {
    console.warn("fsGetRecentAttemptedQuestionIds failed", e);
    return new Set();
  }
};

/**
 * Verifies if a user can start an attempt based on admin controls
 */
export const fsCanStartAttempt = async (
  userId: string, 
  examId: string | undefined, 
  controls: QuizControls
): Promise<{ allowed: boolean; reason?: string; nextAllowedAt?: number }> => {
  try {
    // If no limits are set, allow immediately
    if (controls.attemptsAllowedDefault === 0 && controls.cooldownMinutesBetweenAttempts === 0) {
      return { allowed: true };
    }

    const recent = await fsGetRecentAttempts(userId, examId);
    
    // 1. Check total attempt limit
    if (controls.attemptsAllowedDefault > 0) {
      if (recent.length >= controls.attemptsAllowedDefault) {
        return { 
          allowed: false, 
          reason: `Maximum attempt limit reached (${controls.attemptsAllowedDefault}). Please contact support if you need more attempts.` 
        };
      }
    }

    // 2. Check cooldown
    if (controls.cooldownMinutesBetweenAttempts > 0 && recent.length > 0) {
      const lastAttempt = recent[0];
      const lastTimestamp = lastAttempt.timestamp || lastAttempt.endTime || Date.now();
      const cooldownMs = controls.cooldownMinutesBetweenAttempts * 60 * 1000;
      const elapsed = Date.now() - lastTimestamp;
      
      if (elapsed < cooldownMs) {
        const nextAt = lastTimestamp + cooldownMs;
        const minutesLeft = Math.ceil((nextAt - Date.now()) / 60000);
        return { 
          allowed: false, 
          reason: `Cooldown period active. Please wait ${minutesLeft} more minute(s) before starting a new attempt.`,
          nextAllowedAt: nextAt
        };
      }
    }

    return { allowed: true };
  } catch (e) {
    console.warn("fsCanStartAttempt failed, falling back to allow.", e);
    return { allowed: true };
  }
};

/**
 * Saves granular attempt details for each question
 */
export const fsSaveAttemptDetails = async (userId: string, attemptId: string, details: AttemptDetailMap): Promise<void> => {
  if (!userId || !attemptId) return;
  try {
    const detailIds = Object.keys(details);
    if (detailIds.length === 0) return;

    // Chunk size 450 per request
    const CHUNK_SIZE = 450;
    for (let i = 0; i < detailIds.length; i += CHUNK_SIZE) {
      const chunk = detailIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      chunk.forEach(qId => {
        const item = details[qId];
        const detailRef = doc(db, "users", userId, "attempts", attemptId, "details", qId);
        
        // Validation and Clamping
        const timeSpent = Math.max(0, Math.min(3600, item.timeSpentSeconds || 0));
        const confidence = (item.confidenceLevel !== undefined) 
          ? Math.max(0, Math.min(3, Math.round(item.confidenceLevel))) 
          : 0;

        batch.set(detailRef, {
          questionId: qId,
          selectedOption: item.selectedOption || null,
          isCorrect: item.isCorrect ?? null,
          timeSpentSeconds: timeSpent,
          confidenceLevel: confidence,
          topicId: item.topicId || null,
          difficulty: item.difficulty || null,
          updatedAt: Date.now(),
          flashcardRating: item.flashcardRating ?? null
        });
      });

      await batch.commit();
    }
  } catch (e) {
    console.warn("fsSaveAttemptDetails failed", e);
  }
};

/**
 * Spaced Repetition: Get cards due for review
 */
export const fsGetDueFlashcards = async (userId: string, limitN: number): Promise<{ questionId: string, dueAt: number }[]> => {
  try {
    const now = Date.now();
    const flashcardsRef = collection(db, "users", userId, "flashcards");
    const q = query(
      flashcardsRef,
      where("dueAt", "<=", now),
      orderBy("dueAt", "asc"),
      limit(limitN)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ questionId: d.id, ...d.data() } as any));
  } catch (e) {
    console.warn("fsGetDueFlashcards failed", e);
    return [];
  }
};

/**
 * Spaced Repetition: Record a card review and update SR state
 */
export const fsUpsertFlashcardReview = async (
  userId: string, 
  questionId: string, 
  rating: SRRating, 
  timeSpentSeconds: number
) => {
  try {
    const cardRef = doc(db, "users", userId, "flashcards", questionId);
    const cardSnap = await getDoc(cardRef);
    const prev = cardSnap.exists() ? (cardSnap.data() as FlashcardRecord) : null;
    
    const nextState = calculateNextReview(prev, rating);
    await setDoc(cardRef, nextState, { merge: true });

    // Also log a specific review event for granular stats
    const reviewsRef = collection(db, "users", userId, "flashcardReviews");
    await addDoc(reviewsRef, {
      questionId,
      rating,
      timeSpentSeconds,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn("fsUpsertFlashcardReview failed", e);
  }
};

/**
 * Learner Profile: Fetch Mastery Data
 */
export interface LearnerProfile {
  topicMastery: Record<string, number>;
  updatedAt: number;
}

export const fsGetLearnerProfile = async (userId: string): Promise<LearnerProfile | null> => {
  try {
    const profileRef = doc(db, "users", userId, "learnerProfile", "mastery");
    const snap = await getDoc(profileRef);
    return snap.exists() ? (snap.data() as LearnerProfile) : null;
  } catch (e) {
    console.warn("fsGetLearnerProfile failed", e);
    return null;
  }
};

/**
 * Learner Profile: Update mastery based on a finished quiz session
 */
export const fsUpdateLearnerProfileFromAttempt = async (userId: string, details: AttemptDetailMap) => {
  try {
    const profileRef = doc(db, "users", userId, "learnerProfile", "mastery");
    const snap = await getDoc(profileRef);
    const profile = snap.exists() ? (snap.data() as LearnerProfile) : { topicMastery: {}, updatedAt: 0 };
    
    const mastery = { ...profile.topicMastery };

    Object.values(details).forEach(item => {
      if (!item.topicId) return;
      
      const prev = mastery[item.topicId] || 0.2; // Start at 0.2 base mastery
      let delta = 0;

      if (item.isCorrect) {
        // Correct + High Confidence (Sure=3) gives more boost
        const conf = item.confidenceLevel || 0;
        delta = 0.05 + (conf * 0.033); // max boost ~0.15
      } else if (item.selectedOption) {
        // Wrong answer
        delta = -0.1;
      }

      mastery[item.topicId] = Math.max(0, Math.min(1, prev + delta));
    });

    await setDoc(profileRef, {
      topicMastery: mastery,
      updatedAt: Date.now()
    }, { merge: true });

  } catch (e) {
    console.error("fsUpdateLearnerProfile failed", e);
  }
};

/**
 * Convenience wrapper for logging attempt with question details
 */
export const fsLogAttemptWithDetails = async (userId: string, session: QuizSession, details: AttemptDetailMap, sourceId?: string, sourceType?: string): Promise<void> => {
  if (!userId) return;
  try {
    const attemptId = await fsCreateAttempt(userId, session, sourceId, sourceType);
    if (attemptId) {
      await fsSaveAttemptDetails(userId, attemptId, details);
      // Synchronously trigger mastery update
      await fsUpdateLearnerProfileFromAttempt(userId, details);
    }
  } catch (e) {
    console.warn("fsLogAttemptWithDetails failed", e);
  }
};

/**
 * Performs an upsert operation on a specific document in Firestore
 */
export const fsUpsert = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.error(`Firestore Upsert Error [${collectionName}]:`, error);
    throw error;
  }
};

/**
 * Deletes a document from Firestore
 */
export const fsDelete = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Firestore Delete Error [${collectionName}]:`, error);
    throw error;
  }
};

/**
 * Fetches global app settings
 */
export const fsGetAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const docRef = doc(db, "settings", "app");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AppSettings;
    }
    return null;
  } catch (error) {
    console.error("Firestore Get App Settings Error:", error);
    throw error;
  }
};

/**
 * Saves global app settings
 */
export const fsSaveAppSettings = async (settings: AppSettings) => {
  try {
    const docRef = doc(db, "settings", "app");
    await setDoc(docRef, { ...settings, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.error("Firestore Save App Settings Error:", error);
    throw error;
  }
};

/**
 * Fetches and builds the nested hierarchy: Subject -> Topic -> Subtopic
 */
export const fsGetHierarchy = async (): Promise<Topic[]> => {
  try {
    const subjectsSnap = await getDocs(query(collection(db, "subjects"), orderBy("orderIndex", "asc")));
    const topicsSnap = await getDocs(query(collection(db, "topics"), orderBy("orderIndex", "asc")));
    const subtopicsSnap = await getDocs(query(collection(db, "subtopics"), orderBy("orderIndex", "asc")));

    const subtopics = subtopicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    const topics = topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    const subjects = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    return subjects.map(s => ({
      id: s.id,
      name: s.name,
      questionCount: s.questionCount || 0,
      children: topics
        .filter(t => t.subjectId === s.id)
        .map(t => ({
          id: t.id,
          name: t.name,
          parentId: s.id,
          questionCount: t.questionCount || 0,
          children: subtopics
            .filter(st => st.topicId === t.id)
            .map(st => ({
              id: st.id,
              name: st.name,
              parentId: t.id,
              questionCount: st.questionCount || 0
            }))
        }))
    }));
  } catch (error) {
    console.error("Firestore Hierarchy Error:", error);
    throw error;
  }
};

/**
 * Fetches available mock papers that are published
 */
export const fsGetPapers = async (): Promise<Paper[]> => {
  try {
    const q = query(
      collection(db, "tests"), 
      where("status", "==", "published"),
      where("archived", "==", false),
      orderBy("updatedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Paper',
        description: data.description || '',
        durationMins: data.durationMins || data.durationMinutes || 60,
        questionCount: data.totalQuestions || 0,
        difficulty: data.difficulty || 'Medium'
      };
    });
  } catch (error) {
    console.error("Firestore Papers Error:", error);
    throw error;
  }
};

/**
 * Fetches questions for a specific mock paper, verifying it is published
 */
export const fsGetQuestionsByPaper = async (paperId: string): Promise<Question[]> => {
  try {
    const paperRef = doc(db, "tests", paperId);
    const paperSnap = await getDoc(paperRef);
    
    if (!paperSnap.exists() || paperSnap.data()?.status !== 'published') {
      return [];
    }

    const data = paperSnap.data();
    // Support embedded questions
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }

    // Support question IDs
    const qIds = data.questionIds || [];
    if (qIds.length > 0) {
      const qRef = collection(db, "questions");
      const chunks = [];
      for (let i = 0; i < qIds.length; i += 30) {
        chunks.push(qIds.slice(i, i + 30));
      }
      const questions: Question[] = [];
      for (const chunk of chunks) {
        const q = query(qRef, where("__name__", "in", chunk));
        const snap = await getDocs(q);
        snap.docs.forEach(doc => questions.push(mapFsQuestion(doc.id, doc.data())));
      }
      return questions;
    }

    return [];
  } catch (error) {
    console.error("Firestore Paper Questions Error:", error);
    throw error;
  }
};

/**
 * Fetches questions based on topic filters (supports subtopicId, topicId, or subjectId)
 */
export const fsGetQuestionsByFilters = async (topicIds: string[]): Promise<Question[]> => {
  if (!topicIds || topicIds.length === 0) return [];
  
  try {
    const chunks = [];
    for (let i = 0; i < topicIds.length; i += 30) {
      chunks.push(topicIds.slice(i, i + 30));
    }

    const results: Question[] = [];

    for (const chunk of chunks) {
      const q = query(collection(db, "questions"), where("subtopicId", "in", chunk));
      const snap = await getDocs(q);
      snap.docs.forEach(doc => results.push(mapFsQuestion(doc.id, doc.data())));
    }

    if (results.length === 0) {
      for (const chunk of chunks) {
        const q = query(collection(db, "questions"), where("topicId", "in", chunk));
        const snap = await getDocs(q);
        snap.docs.forEach(doc => results.push(mapFsQuestion(doc.id, doc.data())));
      }
    }

    return results;
  } catch (error) {
    console.error("Firestore Filtered Questions Error:", error);
    throw error;
  }
};
