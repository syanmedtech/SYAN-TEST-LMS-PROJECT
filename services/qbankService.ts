import { fsUpsert, fsDelete } from "./db/firestore";
import { DATA_SOURCE } from "../config/dataSource";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collectionGroup, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { MockTest, Question, Option } from "../types";

/**
 * Generic CRUD handler for dual-write (LocalStorage + Firestore)
 */
const handleWrite = async (collectionName: string, id: string, data: any, operation: 'UPSERT' | 'DELETE') => {
  // 1. LocalStorage Update (Always primary)
  const localData = localStorage.getItem(collectionName);
  let items = localData ? JSON.parse(localData) : [];

  if (operation === 'UPSERT') {
    const existingIndex = items.findIndex((item: any) => item.id === id);
    if (existingIndex > -1) {
      items[existingIndex] = { ...items[existingIndex], ...data };
    } else {
      items.push({ id, ...data });
    }
  } else {
    items = items.filter((item: any) => item.id !== id);
  }
  
  localStorage.setItem(collectionName, JSON.stringify(items));

  // 2. Firestore Update (If enabled)
  if (DATA_SOURCE === 'firestore') {
    try {
      if (operation === 'UPSERT') {
        await fsUpsert(collectionName, id, data);
      } else {
        await fsDelete(collectionName, id);
      }
    } catch (error) {
      console.error(`Firestore dual-write failed for ${collectionName}/${id}. Local storage is still updated.`, error);
    }
  }
};

/**
 * Check if an item has children to maintain referential integrity
 */
const hasChildren = (id: string, childCollection: string, parentIdField: string): boolean => {
  const localData = localStorage.getItem(childCollection);
  if (!localData) return false;
  try {
    const items = JSON.parse(localData);
    return items.some((item: any) => item[parentIdField] === id);
  } catch (e) {
    return false;
  }
};

// --- SUBJECTS ---
export const saveSubject = (id: string, data: any) => handleWrite('subjects', id, data, 'UPSERT');
export const deleteSubject = (id: string) => {
  if (hasChildren(id, 'topics', 'subjectId')) {
    alert("Cannot delete Subject: It contains topics. Please delete them first.");
    return false;
  }
  return handleWrite('subjects', id, null, 'DELETE');
};

// --- TOPICS ---
export const saveTopic = (id: string, data: any) => handleWrite('topics', id, data, 'UPSERT');
export const deleteTopic = (id: string) => {
  if (hasChildren(id, 'subtopics', 'topicId')) {
    alert("Cannot delete Topic: It contains subtopics. Please delete them first.");
    return false;
  }
  return handleWrite('topics', id, null, 'DELETE');
};

// --- SUBTOPICS ---
export const saveSubtopic = (id: string, data: any) => handleWrite('subtopics', id, data, 'UPSERT');
export const deleteSubtopic = (id: string) => {
  if (hasChildren(id, 'questions', 'subtopicId')) {
    alert("Cannot delete Subtopic: It contains questions. Please delete or reassign them first.");
    return false;
  }
  return handleWrite('subtopics', id, null, 'DELETE');
};

// --- PAPERS / TESTS ---
export const savePaper = (id: string, data: any) => handleWrite('papers', id, data, 'UPSERT');
export const deletePaper = (id: string) => {
  if (hasChildren(id, 'questions', 'paperId')) {
    alert("Cannot delete Paper: It contains questions. Please delete or reassign them first.");
    return false;
  }
  return handleWrite('papers', id, null, 'DELETE');
};

// --- STANDARDIZED MOCK TESTS (COLLECTION: tests) ---

export const getTests = async (programId?: string): Promise<MockTest[]> => {
  if (DATA_SOURCE === 'firestore') {
    try {
      const colRef = collection(db, "tests");
      let q = query(colRef, where("archived", "==", false), orderBy("updatedAt", "desc"));
      
      if (programId) {
        q = query(colRef, where("programId", "==", programId), where("archived", "==", false), orderBy("updatedAt", "desc"));
      }
      
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTest));
    } catch (error) {
      console.error("Firestore getTests failed", error);
      return [];
    }
  }
  
  const local = localStorage.getItem('tests');
  let items: MockTest[] = local ? JSON.parse(local) : [];
  if (programId) items = items.filter(t => t.programId === programId);
  return items.filter(t => !t.archived);
};

export const getTestById = async (testId: string): Promise<MockTest | null> => {
  if (DATA_SOURCE === 'firestore') {
    const docRef = doc(db, "tests", testId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() } as MockTest;
  }
  
  const local = localStorage.getItem('tests');
  if (local) {
    const items: MockTest[] = JSON.parse(local);
    return items.find(t => t.id === testId) || null;
  }
  return null;
};

export const saveTest = async (id: string | null, data: Partial<MockTest>): Promise<string> => {
  const testId = id || doc(collection(db, "tests")).id;
  const now = new Date().toISOString();
  
  const payload = {
    ...data,
    id: testId,
    updatedAt: now,
    archived: data.archived ?? false,
  };

  // Local write
  const localData = localStorage.getItem('tests');
  let items = localData ? JSON.parse(localData) : [];
  const idx = items.findIndex((i: any) => i.id === testId);
  if (idx > -1) items[idx] = { ...items[idx], ...payload };
  else items.push(payload);
  localStorage.setItem('tests', JSON.stringify(items));

  if (DATA_SOURCE === 'firestore') {
    const docRef = doc(db, "tests", testId);
    await setDoc(docRef, payload, { merge: true });
  }

  return testId;
};

export const publishTest = async (testId: string, isPublished: boolean): Promise<void> => {
  await saveTest(testId, { status: isPublished ? 'published' : 'draft' });
};

export const archiveTest = async (testId: string): Promise<void> => {
  await saveTest(testId, { archived: true, status: 'draft' });
};

export const duplicateTest = async (testId: string): Promise<string> => {
  const original = await getTestById(testId);
  if (!original) throw new Error("Original test not found.");

  const newId = `test_${Date.now()}`;
  const { id, ...rest } = original;
  
  const copy: Partial<MockTest> = {
    ...rest,
    title: `${original.title} (Copy)`,
    status: 'draft',
    archived: false,
    /* Removed 'as any' as createdAt is now a valid property of Partial<MockTest> after types.ts update */
    createdAt: new Date().toISOString()
  };

  return await saveTest(newId, copy);
};

/**
 * Deletes a test permanently ONLY if no student attempts reference it.
 */
export const deleteTestPermanently = async (testId: string): Promise<boolean> => {
  if (DATA_SOURCE === 'firestore') {
    // Safety check for attempts
    const attemptsQuery = query(
      collectionGroup(db, "attempts"),
      where("testId", "==", testId),
      limit(1)
    );
    const snap = await getDocs(attemptsQuery);
    if (!snap.empty) {
      throw new Error("Cannot delete test: Existing student attempts found. Archive the test instead.");
    }

    await deleteDoc(doc(db, "tests", testId));
  }

  const localData = localStorage.getItem('tests');
  if (localData) {
    const items: MockTest[] = JSON.parse(localData);
    const filtered = items.filter(t => t.id !== testId);
    localStorage.setItem('tests', JSON.stringify(filtered));
  }
  
  return true;
};

/**
 * Resolves full question objects if the test only contains IDs.
 */
export const resolveTestQuestions = async (test: MockTest): Promise<Question[]> => {
  if (test.questions && test.questions.length > 0) return test.questions;
  if (!test.questionIds || test.questionIds.length === 0) return [];

  if (DATA_SOURCE === 'firestore') {
    const questions: Question[] = [];
    const qIds = test.questionIds;
    
    // Firestore "in" query limit is 30 IDs
    for (let i = 0; i < qIds.length; i += 30) {
      const chunk = qIds.slice(i, i + 30);
      const qQuery = query(collection(db, "questions"), where("__name__", "in", chunk));
      const qSnap = await getDocs(qQuery);
      qSnap.docs.forEach(doc => {
        const data = doc.data();
        // Minimal mapping to UI Question type
        questions.push({
          id: doc.id,
          text: data.questionText || data.text || '',
          options: (data.options || []).map((text: string, idx: number) => ({
            id: ['a', 'b', 'c', 'd'][idx] || 'a',
            text
          })),
          correctAnswer: (['a', 'b', 'c', 'd'][data.correctOptionIndex ?? 0] as any) || 'a',
          explanation: data.explanation || '',
          topicId: data.subtopicId || data.topicId || 'unknown',
          communityStats: data.communityStats || { a: 25, b: 25, c: 25, d: 25 },
          difficulty: data.difficulty || 'Medium'
        });
      });
    }
    return questions;
  }

  // Fallback for local
  const localQuestions = localStorage.getItem('questions');
  if (localQuestions) {
    const all: Question[] = JSON.parse(localQuestions);
    return all.filter(q => test.questionIds?.includes(q.id));
  }

  return [];
};

// --- QUESTIONS ---
export const saveQuestion = (id: string, data: any) => handleWrite('questions', id, data, 'UPSERT');
export const deleteQuestion = (id: string) => handleWrite('questions', id, null, 'DELETE');