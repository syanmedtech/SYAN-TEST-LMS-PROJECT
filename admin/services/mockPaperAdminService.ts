import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  startAfter,
  DocumentSnapshot,
  writeBatch,
  /* Added missing imports to fix "Cannot find name" errors on lines 152 and 165 */
  addDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { syncMockPaperToExam } from "../../shared/services/mockPaperToExam";
import { Question } from "../../types";

export type PaperStatus = "draft" | "published" | "archived";

export interface PaperSection {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  questionCount: number;
  negativeMarking?: number;
  blueprint: {
    type: "fixed" | "hierarchy" | "tags";
    questionIds?: string[];
    hierarchyConfig?: {
      subjectIds: string[];
      topicIds: string[];
      subtopicIds: string[];
      difficultyMix: Record<string, number>;
    };
    tagConfig?: {
      tags: string[];
    };
  };
}

export interface MockPaper {
  id: string;
  title: string;
  description?: string;
  targetProgramId?: string;
  targetProgramName?: string;
  durationMinutes: number;
  instructions?: string;
  status: PaperStatus;
  totalSections: number;
  totalQuestions: number;
  sections: PaperSection[];
  createdAt: number;
  updatedAt: number;
  archived?: boolean;
  /* Added maxAttempts to MockPaper interface to fix error in BulkMockTestCreator.tsx */
  maxAttempts?: number;
  /* Added questionIds to MockPaper interface for better typing */
  questionIds?: string[];
  /* Added questions to MockPaper interface for better typing */
  questions?: Question[];
}

// Standardizing on 'tests' as requested
const COLLECTION = "tests";

const normalizePaper = (id: string, data: any): MockPaper => ({
  id,
  title: data.title || data.name || "Untitled Paper",
  description: data.description || "",
  targetProgramId: data.targetProgramId || data.programId || "",
  targetProgramName: data.targetProgramName || data.programName || "",
  durationMinutes: data.durationMinutes || data.duration || 0,
  instructions: data.instructions || "",
  status: data.status || (data.isPublished ? "published" : "draft"),
  totalSections: data.totalSections || data.sections?.length || 0,
  totalQuestions: data.totalQuestions || data.questionCount || 0,
  sections: data.sections || [],
  createdAt: data.createdAt || Date.now(),
  updatedAt: data.updatedAt || Date.now(),
  archived: data.archived ?? false,
  /* Added maxAttempts to normalizePaper mapping */
  maxAttempts: data.maxAttempts ?? 1,
  /* Added questionIds to normalizePaper mapping */
  questionIds: data.questionIds || [],
  /* Added questions to normalizePaper mapping */
  questions: data.questions || []
});

export const fetchMockPapers = async (options: { 
  pageSize: number; 
  lastDoc?: DocumentSnapshot;
  status?: string;
  search?: string;
}) => {
  let q = query(
    collection(db, COLLECTION), 
    where("archived", "==", false),
    orderBy("updatedAt", "desc"),
    limit(options.pageSize)
  );

  if (options.status && options.status !== 'all') {
    q = query(
      collection(db, COLLECTION),
      where("status", "==", options.status),
      where("archived", "==", false),
      orderBy("updatedAt", "desc"),
      limit(options.pageSize)
    );
  }

  if (options.lastDoc) {
    q = query(q, startAfter(options.lastDoc));
  }

  const snap = await getDocs(q);
  let items = snap.docs.map(d => normalizePaper(d.id, d.data()));

  if (options.search) {
    const s = options.search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(s));
  }

  return {
    items,
    lastDoc: snap.docs[snap.docs.length - 1]
  };
};

export const fetchMockPaperById = async (id: string): Promise<MockPaper | null> => {
  const d = await getDoc(doc(db, COLLECTION, id));
  if (d.exists()) return normalizePaper(d.id, d.data());
  return null;
};

export const saveMockPaper = async (id: string | null, data: Partial<MockPaper>) => {
  const paperId = id || doc(collection(db, COLLECTION)).id;
  const now = Date.now();
  
  const payload = {
    ...data,
    id: paperId,
    updatedAt: now,
    createdAt: data.createdAt || now,
    archived: data.archived ?? false
  };

  await setDoc(doc(db, COLLECTION, paperId), payload, { merge: true });
  
  // Bridge: Sync to student-facing collections if necessary
  const fullPaper = normalizePaper(paperId, payload);
  await syncMockPaperToExam(fullPaper);

  return paperId;
};

export const duplicateMockPaper = async (paper: MockPaper) => {
  const { id, ...rest } = paper;
  const now = Date.now();
  /* Fix: addDoc is now correctly imported from firebase/firestore */
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...rest,
    title: `${paper.title} (Copy)`,
    status: "draft",
    archived: false,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const archiveMockPaper = async (id: string) => {
  const now = Date.now();
  /* Fix: updateDoc is now correctly imported from firebase/firestore */
  await updateDoc(doc(db, COLLECTION, id), { 
    status: "archived", 
    archived: true,
    updatedAt: now 
  });
  
  const d = await getDoc(doc(db, COLLECTION, id));
  if (d.exists()) {
    await syncMockPaperToExam(normalizePaper(d.id, d.data()));
  }
};