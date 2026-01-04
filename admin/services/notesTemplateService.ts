import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export type SectionFormat = "paragraph" | "bullets" | "table" | "mixed";

export interface NoteSection {
  id: string;
  heading: string;
  format: SectionFormat;
  isRequired?: boolean;
}

export interface NoteTemplate {
  id: string;
  title: string;
  templateType: "clinical" | "notes";
  sections: NoteSection[];
  isActive: boolean;
  version: number;
  rootId?: string; // Links versions of the same template
  createdAt: number;
  updatedAt: number;
}

const COLLECTION = "noteTemplates";

export const fetchTemplates = async () => {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("updatedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NoteTemplate));
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
};

export const saveTemplate = async (data: Partial<NoteTemplate>) => {
  const now = Date.now();
  const batch = writeBatch(db);

  if (data.id && data.isActive) {
    // Versioning logic: 
    // 1. Deactivate old version
    const oldRef = doc(db, COLLECTION, data.id);
    batch.update(oldRef, { isActive: false, updatedAt: now });

    // 2. Create new version doc
    const newRef = doc(collection(db, COLLECTION));
    const newVersion = {
      ...data,
      id: newRef.id,
      rootId: data.rootId || data.id,
      version: (data.version || 1) + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    batch.set(newRef, newVersion);
    await batch.commit();
    return newRef.id;
  } else {
    // New template or updating a draft
    const id = data.id || doc(collection(db, COLLECTION)).id;
    const payload = {
      ...data,
      id,
      version: data.version || 1,
      isActive: data.isActive ?? false,
      updatedAt: now,
      createdAt: data.createdAt || now
    };
    await setDoc(doc(db, COLLECTION, id), payload, { merge: true });
    return id;
  }
};

export const duplicateTemplate = async (template: NoteTemplate) => {
  const { id, ...rest } = template;
  const newRef = doc(collection(db, COLLECTION));
  const payload = {
    ...rest,
    id: newRef.id,
    title: `${template.title} (Copy)`,
    isActive: false,
    version: 1,
    rootId: newRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await setDoc(newRef, payload);
  return newRef.id;
};

export const archiveTemplate = async (id: string) => {
  await updateDoc(doc(db, COLLECTION, id), { 
    isActive: false, 
    updatedAt: Date.now() 
  });
};

export const setTemplateActive = async (id: string, rootId: string) => {
  const batch = writeBatch(db);
  
  // 1. Find all active versions for this rootId and deactivate them
  const q = query(
    collection(db, COLLECTION),
    where("rootId", "==", rootId),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  snap.docs.forEach(d => batch.update(d.ref, { isActive: false }));

  // 2. Set the target doc to active
  batch.update(doc(db, COLLECTION, id), { isActive: true, updatedAt: Date.now() });
  
  await batch.commit();
};
