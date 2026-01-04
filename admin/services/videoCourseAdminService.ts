
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
  setDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "pdf" | "link";
  durationMinutes?: number;
  isFreePreview: boolean;
  videoSource?: string; // URL
  fileUrl?: string;
  externalUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface VideoCourse {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  programId?: string;
  programName?: string;
  status: "draft" | "published" | "archived";
  thumbnailUrl?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  sortOrder: number;
  totalModules: number;
  totalLessons: number;
  curriculum: Module[];
  createdAt: number;
  updatedAt: number;
}

const COLLECTIONS_TO_TRY = ["videoCourses", "courses", "courseCatalog"];

const getTargetCollection = async (): Promise<string> => {
  // Simple check for existing, default to videoCourses
  return "videoCourses";
};

export const fetchVideoCourses = async (options: { 
  pageSize: number; 
  lastDoc?: DocumentSnapshot;
  statusFilter?: string;
  searchQuery?: string;
}) => {
  const colName = await getTargetCollection();
  let q = query(
    collection(db, colName), 
    where("status", "!=", "archived"),
    orderBy("status"),
    orderBy("updatedAt", "desc"), 
    limit(options.pageSize)
  );

  if (options.statusFilter && options.statusFilter !== 'all') {
    q = query(
      collection(db, colName),
      where("status", "==", options.statusFilter),
      orderBy("updatedAt", "desc"),
      limit(options.pageSize)
    );
  }

  if (options.lastDoc) {
    q = query(q, startAfter(options.lastDoc));
  }

  const snap = await getDocs(q);
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoCourse));

  if (options.searchQuery) {
    const s = options.searchQuery.toLowerCase();
    items = items.filter(item => item.title.toLowerCase().includes(s));
  }

  return {
    items,
    lastDoc: snap.docs[snap.docs.length - 1]
  };
};

export const fetchVideoCourseById = async (id: string): Promise<VideoCourse | null> => {
  const colName = await getTargetCollection();
  const d = await getDoc(doc(db, colName, id));
  if (d.exists()) return { id: d.id, ...d.data() } as VideoCourse;
  return null;
};

export const saveVideoCourse = async (id: string | null, data: Partial<VideoCourse>) => {
  const colName = await getTargetCollection();
  const now = Date.now();
  const pkgId = id || doc(collection(db, colName)).id;

  const payload = {
    ...data,
    id: pkgId,
    updatedAt: now,
    status: data.status || "draft",
    sortOrder: data.sortOrder || 0,
    curriculum: data.curriculum || []
  };

  if (!id) (payload as any).createdAt = now;

  await setDoc(doc(db, colName, pkgId), payload, { merge: true });
  return pkgId;
};

export const updateCourseStatus = async (id: string, status: VideoCourse['status']) => {
  const colName = await getTargetCollection();
  await updateDoc(doc(db, colName, id), { 
    status, 
    updatedAt: Date.now() 
  });
};

export const duplicateVideoCourse = async (course: VideoCourse) => {
  const colName = await getTargetCollection();
  const { id, ...rest } = course;
  const now = Date.now();
  const docRef = await addDoc(collection(db, colName), {
    ...rest,
    title: `${course.title} (Copy)`,
    status: "draft",
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};
