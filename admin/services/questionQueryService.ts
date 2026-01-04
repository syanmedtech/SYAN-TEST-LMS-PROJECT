import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentSnapshot
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { QBankQuestion } from "./qbankAdminService";

/**
 * Re-using the same collection detection logic but simplified for read-only query use.
 */
const getQuestionCollection = () => "questions"; // Standardizing on the primary collection

export interface QuestionQueryParams {
  search?: string;
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  difficulty?: string;
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}

export const querySelectableQuestions = async (params: QuestionQueryParams) => {
  const colRef = collection(db, getQuestionCollection());
  // Base constraints: usually we only want to pick from published questions for exams
  let constraints: any[] = [where("status", "==", "published")];

  if (params.subjectId) constraints.push(where("subjectId", "==", params.subjectId));
  if (params.topicId) constraints.push(where("topicId", "==", params.topicId));
  if (params.subtopicId) constraints.push(where("subtopicId", "==", params.subtopicId));
  
  if (params.difficulty && params.difficulty !== 'all') {
    constraints.push(where("difficulty", "==", params.difficulty.toLowerCase()));
  }

  // Handle ordering and prefix search
  if (params.search) {
    constraints.push(orderBy("stem"));
    constraints.push(where("stem", ">=", params.search));
    constraints.push(where("stem", "<=", params.search + "\uf8ff"));
  } else {
    constraints.push(orderBy("updatedAt", "desc"));
  }

  // Apply Pagination
  constraints.push(limit(params.pageSize || 25));
  if (params.lastDoc) constraints.push(startAfter(params.lastDoc));

  try {
    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as QBankQuestion));

    return {
      items,
      lastDoc: snap.docs[snap.docs.length - 1] || null
    };
  } catch (error) {
    console.error("querySelectableQuestions failed:", error);
    // Return empty results on error to prevent UI crash
    return { items: [], lastDoc: null };
  }
};

/**
 * Fetch a batch of specific questions by IDs for display in the "Selected" list.
 */
export const fetchQuestionsByIds = async (ids: string[]): Promise<QBankQuestion[]> => {
  if (!ids || ids.length === 0) return [];
  
  // Firestore 'in' queries are limited to 30 items
  const chunks = [];
  for (let i = 0; i < ids.length; i += 30) {
    chunks.push(ids.slice(i, i + 30));
  }

  const results: QBankQuestion[] = [];
  const colRef = collection(db, getQuestionCollection());

  for (const chunk of chunks) {
    try {
      const q = query(colRef, where("__name__", "in", chunk));
      const snap = await getDocs(q);
      snap.docs.forEach(d => results.push({ id: d.id, ...d.data() } as QBankQuestion));
    } catch (e) {
      console.warn("Chunk fetch failed", e);
    }
  }

  return results;
};