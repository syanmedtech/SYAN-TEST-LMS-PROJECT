
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  addDoc, 
  startAfter, 
  DocumentSnapshot,
  getDoc,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export type QuestionType = "mcq" | "sba" | "truefalse";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "draft" | "published" | "archived";

export interface QBankQuestion {
  id: string;
  stem: string;
  options: { id?: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  subjectName?: string;
  topicName?: string;
  subtopicName?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

const COLLECTIONS_TO_TRY = ["questions", "qbankQuestions", "mcqs", "questionBank", "items"];
let DETECTED_COLLECTION: string | null = null;

const getTargetCollection = async (): Promise<string> => {
  if (DETECTED_COLLECTION) return DETECTED_COLLECTION;
  
  for (const col of COLLECTIONS_TO_TRY) {
    try {
      const q = query(collection(db, col), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        DETECTED_COLLECTION = col;
        return col;
      }
    } catch (e) { continue; }
  }
  
  DETECTED_COLLECTION = "questions";
  return "questions";
};

/**
 * Normalizes legacy question formats to the new QBank admin structure.
 */
const normalize = (id: string, data: any): QBankQuestion => {
  const stem = data.stem || data.text || data.questionText || data.question || "";
  let options = data.options || [];
  
  if (data.correctAnswer && typeof data.correctAnswer === 'string' && options.length > 0) {
    options = options.map((opt: any) => ({
      ...opt,
      isCorrect: opt.id === data.correctAnswer
    }));
  }

  return {
    id,
    stem,
    options,
    explanation: data.explanation || "",
    type: data.type || "mcq",
    difficulty: (data.difficulty?.toLowerCase() as QuestionDifficulty) || "medium",
    status: data.status || (data.isPublished ? "published" : "draft"),
    subjectId: data.subjectId || data.topicId?.split('-')[0] || "",
    topicId: data.topicId || "",
    subtopicId: data.subtopicId || "",
    subjectName: data.subjectName || "",
    topicName: data.topicName || "",
    subtopicName: data.subtopicName || "",
    tags: data.tags || [],
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
  };
};

export const fetchQuestions = async (options: { 
  pageSize: number; 
  lastDoc?: DocumentSnapshot;
  filters?: {
    difficulty?: string;
    status?: string;
    type?: string;
    subjectId?: string;
  };
}) => {
  const colName = await getTargetCollection();
  let q = query(collection(db, colName), orderBy("updatedAt", "desc"), limit(options.pageSize));

  if (options.filters) {
    if (options.filters.status && options.filters.status !== 'all') {
      q = query(q, where("status", "==", options.filters.status));
    }
    if (options.filters.difficulty && options.filters.difficulty !== 'all') {
      q = query(q, where("difficulty", "==", options.filters.difficulty.toLowerCase()));
    }
    if (options.filters.type && options.filters.type !== 'all') {
      q = query(q, where("type", "==", options.filters.type.toLowerCase()));
    }
  }

  if (options.lastDoc) {
    q = query(q, startAfter(options.lastDoc));
  }

  const snap = await getDocs(q);
  const items = snap.docs.map(d => normalize(d.id, d.data()));

  return {
    items,
    lastDoc: snap.docs[snap.docs.length - 1]
  };
};

export const fetchQuestionById = async (id: string): Promise<QBankQuestion | null> => {
  const colName = await getTargetCollection();
  const d = await getDoc(doc(db, colName, id));
  if (d.exists()) return normalize(d.id, d.data());
  return null;
};

export const saveQuestion = async (id: string | null, data: Partial<QBankQuestion>) => {
  const colName = await getTargetCollection();
  const now = Date.now();
  const qId = id || doc(collection(db, colName)).id;

  const payload = {
    ...data,
    updatedAt: now,
  };

  if (!id) {
    (payload as any).createdAt = now;
  }

  await setDoc(doc(db, colName, qId), payload, { merge: true });
  return qId;
};

export const updateQuestionStatus = async (id: string, status: QuestionStatus) => {
  const colName = await getTargetCollection();
  await updateDoc(doc(db, colName, id), { 
    status, 
    updatedAt: Date.now() 
  });
};

export const bulkUpdateStatus = async (ids: string[], status: QuestionStatus) => {
  const colName = await getTargetCollection();
  const batch = writeBatch(db);
  ids.forEach(id => {
    batch.update(doc(db, colName, id), { status, updatedAt: Date.now() });
  });
  await batch.commit();
};

export const duplicateQuestion = async (question: QBankQuestion) => {
  const colName = await getTargetCollection();
  const { id, ...rest } = question;
  const now = Date.now();
  const payload = {
    ...rest,
    stem: `${question.stem} (Copy)`,
    status: "draft",
    createdAt: now,
    updatedAt: now
  };
  const docRef = await addDoc(collection(db, colName), payload);
  return docRef.id;
};

/**
 * Bulk Upsert function for imports
 */
export const bulkUpsertQuestions = async (
  questions: Partial<QBankQuestion>[], 
  mode: 'create' | 'upsert', 
  chunkSize: number = 25,
  onProgress: (success: number, failed: number) => void
) => {
  const colName = await getTargetCollection();
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach(q => {
      try {
        const id = q.id || doc(collection(db, colName)).id;
        const ref = doc(db, colName, id);
        
        const payload = {
          ...q,
          id,
          updatedAt: Date.now(),
          createdAt: q.createdAt || Date.now()
        };

        if (mode === 'create') {
          batch.set(ref, payload);
        } else {
          batch.set(ref, payload, { merge: true });
        }
        successCount++;
      } catch (e) {
        console.error("Error adding to batch", e);
        failedCount++;
      }
    });

    try {
      await batch.commit();
      onProgress(successCount, failedCount);
    } catch (e) {
      console.error("Batch commit failed", e);
      // If batch fails, we count all items in this chunk as failed for progress display
      // although real partial failure handling is complex in Firestore batches
      failedCount += chunk.length;
      onProgress(successCount - chunk.length, failedCount);
    }
  }

  return { success: successCount, failed: failedCount };
};
