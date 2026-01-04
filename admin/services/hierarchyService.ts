
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
  getDoc,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export type HierarchyType = 'subject' | 'topic' | 'subtopic';
export type HierarchyStatus = 'active' | 'archived';

export interface Taxonomy {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
  isLegacy?: boolean;
}

export interface HierarchyNode {
  id: string;
  parentId?: string;
  subjectId?: string; // For subtopics
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  status: HierarchyStatus;
  createdAt: number;
  updatedAt: number;
  type: HierarchyType;
  questionCount?: number;
}

// Legacy Detection logic
let LEGACY_COLLECTION_MAP = {
  subjects: 'subjects',
  topics: 'topics',
  subtopics: 'subtopics'
};

const detectLegacyCollections = async () => {
  const trials = [
    { s: 'subjects', t: 'topics', st: 'subtopics' },
    { s: 'taxonomy', t: 'taxonomy', st: 'taxonomy' },
    { s: 'structure', t: 'structure', st: 'structure' }
  ];

  for (const set of trials) {
    try {
      const q = query(collection(db, set.s), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        LEGACY_COLLECTION_MAP = { subjects: set.s, topics: set.t, subtopics: set.st };
        return true;
      }
    } catch (e) {}
  }
  return false;
};

// --- Taxonomy Management ---

export const fetchTaxonomies = async (): Promise<Taxonomy[]> => {
  const snap = await getDocs(collection(db, "taxonomies"));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Taxonomy));
  
  // Always check for legacy data to provide a "Default" if no taxonomies exist
  const hasLegacy = await detectLegacyCollections();
  if (hasLegacy || items.length === 0) {
    const legacy: Taxonomy = {
      id: 'legacy_v1',
      name: 'Default Taxonomy (Legacy)',
      isActive: items.length === 0,
      createdAt: 0,
      isLegacy: true
    };
    // Ensure active state if none are explicitly active
    if (!items.some(i => i.isActive)) legacy.isActive = true;
    return [legacy, ...items];
  }

  return items;
};

export const createTaxonomy = async (name: string) => {
  const docRef = await addDoc(collection(db, "taxonomies"), {
    name,
    isActive: false,
    createdAt: Date.now()
  });
  return docRef.id;
};

export const setTaxonomyActive = async (taxonomyId: string) => {
  if (taxonomyId === 'legacy_v1') {
    const snap = await getDocs(collection(db, "taxonomies"));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { isActive: false }));
    await batch.commit();
    return;
  }

  const snap = await getDocs(collection(db, "taxonomies"));
  const batch = writeBatch(db);
  snap.docs.forEach(d => {
    batch.update(d.ref, { isActive: d.id === taxonomyId });
  });
  await batch.commit();
};

// --- Hierarchy Node Accessors ---

const getColPath = (taxonomy: Taxonomy, type: HierarchyType) => {
  if (taxonomy.id === 'legacy_v1') {
    return type === 'subject' ? LEGACY_COLLECTION_MAP.subjects : 
           type === 'topic' ? LEGACY_COLLECTION_MAP.topics : 
           LEGACY_COLLECTION_MAP.subtopics;
  }
  const suffix = type === 'subject' ? 'subjects' : type === 'topic' ? 'topics' : 'subtopics';
  return `taxonomies/${taxonomy.id}/${suffix}`;
};

const normalizeNode = (id: string, data: any, type: HierarchyType): HierarchyNode => ({
  id,
  name: data.name || '',
  description: data.description || '',
  icon: data.icon || '',
  sortOrder: data.sortOrder ?? 0,
  status: data.status || (data.isArchived ? 'archived' : 'active'),
  parentId: data.parentId || data.topicId || data.subjectId,
  subjectId: data.subjectId,
  createdAt: data.createdAt || Date.now(),
  updatedAt: data.updatedAt || Date.now(),
  type,
  questionCount: data.questionCount || 0
});

export const fetchSubjects = async (taxonomy: Taxonomy): Promise<HierarchyNode[]> => {
  const colPath = getColPath(taxonomy, 'subject');
  const q = query(
    collection(db, colPath), 
    where("status", "==", "active"),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => normalizeNode(d.id, d.data(), 'subject'))
    .filter(n => !n.parentId || n.type === 'subject'); 
};

export const fetchTopics = async (taxonomy: Taxonomy, subjectId: string): Promise<HierarchyNode[]> => {
  const colPath = getColPath(taxonomy, 'topic');
  const q = query(
    collection(db, colPath),
    where("subjectId", "==", subjectId),
    where("status", "==", "active"),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => normalizeNode(d.id, d.data(), 'topic'));
};

export const fetchSubtopics = async (taxonomy: Taxonomy, topicId: string): Promise<HierarchyNode[]> => {
  const colPath = getColPath(taxonomy, 'subtopic');
  const q = query(
    collection(db, colPath),
    where("topicId", "==", topicId),
    where("status", "==", "active"),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => normalizeNode(d.id, d.data(), 'subtopic'));
};

export const saveNode = async (taxonomy: Taxonomy, node: Partial<HierarchyNode>) => {
  const type = node.type!;
  const colPath = getColPath(taxonomy, type);
  
  const id = node.id || doc(collection(db, colPath)).id;
  const now = Date.now();
  
  const payload = {
    ...node,
    id,
    updatedAt: now,
    createdAt: node.createdAt || now,
    status: node.status || 'active',
    sortOrder: node.sortOrder || 0
  };

  await setDoc(doc(db, colPath, id), payload, { merge: true });
  return id;
};

export const archiveNode = async (taxonomy: Taxonomy, id: string, type: HierarchyType) => {
  const colPath = getColPath(taxonomy, type);
  await updateDoc(doc(db, colPath, id), { status: 'archived', updatedAt: Date.now() });
};

export const reorderNodes = async (taxonomy: Taxonomy, nodes: HierarchyNode[]) => {
  const batch = writeBatch(db);
  nodes.forEach((node, index) => {
    const colPath = getColPath(taxonomy, node.type);
    batch.update(doc(db, colPath, node.id), { sortOrder: index, updatedAt: Date.now() });
  });
  await batch.commit();
};
