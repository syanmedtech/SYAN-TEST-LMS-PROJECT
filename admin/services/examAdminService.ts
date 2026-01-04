
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
  updateDoc,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Paper } from "../../types";

export interface AdminPaper extends Paper {
  isPublished: boolean;
  category: string;
  instructions: string;
  startAt?: number;
  endAt?: number;
  attemptsAllowed: number;
  createdAt: number;
  updatedAt: number;
  questionSource: {
    type: 'hierarchy' | 'manual' | 'set';
    config: any;
  };
}

const COLLECTION = "papers";

export const getAdminExams = async (): Promise<AdminPaper[]> => {
  try {
    const q = query(collection(db, COLLECTION), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as AdminPaper));
  } catch (error) {
    console.error("Error fetching admin exams:", error);
    throw error;
  }
};

export const getAdminExamById = async (id: string): Promise<AdminPaper | null> => {
  try {
    const d = await getDoc(doc(db, COLLECTION, id));
    if (d.exists()) {
      return { id: d.id, ...d.data() } as AdminPaper;
    }
    return null;
  } catch (error) {
    console.error("Error fetching exam details:", error);
    throw error;
  }
};

export const saveAdminExam = async (id: string | null, data: Partial<AdminPaper>) => {
  try {
    const payload = {
      ...data,
      updatedAt: Date.now(),
    };

    if (id) {
      await updateDoc(doc(db, COLLECTION, id), payload);
      return id;
    } else {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...payload,
        createdAt: Date.now(),
        isPublished: false,
        questionCount: data.questionCount || 0
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving exam:", error);
    throw error;
  }
};

export const togglePublishExam = async (id: string, status: boolean) => {
  try {
    await updateDoc(doc(db, COLLECTION, id), { 
      isPublished: status,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error toggling publish status:", error);
    throw error;
  }
};

export const deleteAdminExam = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

export const duplicateAdminExam = async (exam: AdminPaper) => {
  try {
    const { id, ...rest } = exam;
    const newExam = {
      ...rest,
      title: `${exam.title} (Copy)`,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const docRef = await addDoc(collection(db, COLLECTION), newExam);
    return docRef.id;
  } catch (error) {
    console.error("Error duplicating exam:", error);
    throw error;
  }
};
