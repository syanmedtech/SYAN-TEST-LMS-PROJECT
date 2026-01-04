
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface ResolvedHierarchy {
  subjectId: string | null;
  topicId: string | null;
  subtopicId: string | null;
  subjectName: string | null;
  topicName: string | null;
  subtopicName: string | null;
}

let subjectsCache: any[] = [];
let topicsCache: any[] = [];
let subtopicsCache: any[] = [];

const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');

const loadCache = async () => {
  if (subjectsCache.length > 0) return;
  
  // Sequential fetch to avoid memory spikes
  const sSnap = await getDocs(collection(db, "subjects"));
  subjectsCache = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const tSnap = await getDocs(collection(db, "topics"));
  topicsCache = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const stSnap = await getDocs(collection(db, "subtopics"));
  subtopicsCache = stSnap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Resolves name-based hierarchy to IDs using exact and normalized matching.
 * Never overwrites existing IDs if provided.
 */
export const resolveHierarchyLinks = async (data: {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  subjectName?: string;
  topicName?: string;
  subtopicName?: string;
}): Promise<ResolvedHierarchy> => {
  await loadCache();

  const result: ResolvedHierarchy = {
    subjectId: data.subjectId || null,
    topicId: data.topicId || null,
    subtopicId: data.subtopicId || null,
    subjectName: data.subjectName || null,
    topicName: data.topicName || null,
    subtopicName: data.subtopicName || null,
  };

  // 1. Resolve Subject
  if (!result.subjectId && result.subjectName) {
    const norm = normalize(result.subjectName);
    const match = subjectsCache.find(s => normalize(s.name) === norm);
    if (match) result.subjectId = match.id;
  }

  // 2. Resolve Topic (scoped to Subject if known)
  if (!result.topicId && result.topicName) {
    const norm = normalize(result.topicName);
    const match = topicsCache.find(t => {
      const nameMatch = normalize(t.name) === norm;
      const subjectMatch = result.subjectId ? t.subjectId === result.subjectId : true;
      return nameMatch && subjectMatch;
    });
    if (match) {
      result.topicId = match.id;
      if (!result.subjectId) result.subjectId = match.subjectId; // Back-fill parent
    }
  }

  // 3. Resolve Subtopic (scoped to Topic if known)
  if (!result.subtopicId && result.subtopicName) {
    const norm = normalize(result.subtopicName);
    const match = subtopicsCache.find(st => {
      const nameMatch = normalize(st.name) === norm;
      const topicMatch = result.topicId ? st.topicId === result.topicId : true;
      return nameMatch && topicMatch;
    });
    if (match) {
      result.subtopicId = match.id;
      if (!result.topicId) result.topicId = match.topicId; // Back-fill parent
    }
  }

  return result;
};

export const clearHierarchyCache = () => {
  subjectsCache = [];
  topicsCache = [];
  subtopicsCache = [];
};
