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
  deleteDoc, 
  writeBatch,
  getDoc,
  startAfter,
  DocumentSnapshot
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface LabValue {
  id: string;
  region: string; // "Pakistan" | "MiddleEast" | "International"
  category: string; // "CBC" | "LFT" | "RFT" | "Electrolytes" | "Lipids" | "Thyroid" | "Others"
  testName: string;
  normalRange: string;
  unit: string;
  notes?: string;
  sex: "male" | "female" | "all";
  ageGroup: "adult" | "child" | "neonate" | "all";
  sortOrder: number;
  updatedAt: number;
  createdAt: number;
  isArchived?: boolean;
}

const COLLECTION = "labValues";

export const fetchLabValues = async (filters: { 
  region?: string; 
  category?: string; 
  search?: string;
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}) => {
  let q = query(
    collection(db, COLLECTION), 
    where("isArchived", "==", false),
    orderBy("category"),
    orderBy("sortOrder", "asc"),
    // Fix: Replaced undefined variable 'options' with 'filters' parameter
    limit(filters.pageSize)
  );

  // Note: Compound queries in Firestore require indexes. 
  // For simplicity and resilience, we filter region/category in query if possible, or client-side if complex.
  if (filters.region && filters.region !== 'all') {
    q = query(q, where("region", "==", filters.region));
  }
  if (filters.category && filters.category !== 'all') {
    q = query(q, where("category", "==", filters.category));
  }

  if (filters.lastDoc) {
    q = query(q, startAfter(filters.lastDoc));
  }

  const snap = await getDocs(q);
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as LabValue));

  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter(i => i.testName.toLowerCase().includes(s));
  }

  return {
    items,
    lastDoc: snap.docs[snap.docs.length - 1]
  };
};

export const saveLabValue = async (id: string | null, data: Partial<LabValue>) => {
  const labId = id || doc(collection(db, COLLECTION)).id;
  const now = Date.now();
  const payload = {
    ...data,
    id: labId,
    updatedAt: now,
    createdAt: data.createdAt || now,
    isArchived: false,
    sortOrder: data.sortOrder || 0
  };
  await setDoc(doc(db, COLLECTION, labId), payload, { merge: true });
  return labId;
};

export const deleteLabValueSoft = async (id: string) => {
  await updateDoc(doc(db, COLLECTION, id), { isArchived: true, updatedAt: Date.now() });
};

export const bulkUpsertLabValues = async (items: Partial<LabValue>[], onProgress: (count: number) => void) => {
  const batchLimit = 25;
  let processed = 0;

  for (let i = 0; i < items.length; i += batchLimit) {
    const chunk = items.slice(i, i + batchLimit);
    const batch = writeBatch(db);

    chunk.forEach(item => {
      const id = item.id || doc(collection(db, COLLECTION)).id;
      const ref = doc(db, COLLECTION, id);
      batch.set(ref, {
        ...item,
        id,
        isArchived: false,
        updatedAt: Date.now(),
        createdAt: item.createdAt || Date.now()
      }, { merge: true });
    });

    await batch.commit();
    processed += chunk.length;
    onProgress(processed);
  }
};

export const seedPakistaniLabValues = async () => {
  const seeds: Partial<LabValue>[] = [
    { region: "Pakistan", category: "CBC", testName: "Hemoglobin (Male)", normalRange: "13.5–17.5", unit: "g/dL", sex: "male", ageGroup: "adult", sortOrder: 1 },
    { region: "Pakistan", category: "CBC", testName: "Hemoglobin (Female)", normalRange: "12.0–15.5", unit: "g/dL", sex: "female", ageGroup: "adult", sortOrder: 2 },
    { region: "Pakistan", category: "CBC", testName: "WBC Count", normalRange: "4,000–11,000", unit: "/µL", sex: "all", ageGroup: "all", sortOrder: 3 },
    { region: "Pakistan", category: "CBC", testName: "Platelets", normalRange: "150,000–450,000", unit: "/µL", sex: "all", ageGroup: "all", sortOrder: 4 },
    { region: "Pakistan", category: "LFT", testName: "Bilirubin (Total)", normalRange: "0.1–1.2", unit: "mg/dL", sex: "all", ageGroup: "adult", sortOrder: 1 },
    { region: "Pakistan", category: "LFT", testName: "ALT (SGPT)", normalRange: "up to 40", unit: "U/L", sex: "all", ageGroup: "adult", sortOrder: 2 },
    { region: "Pakistan", category: "RFT", testName: "Creatinine", normalRange: "0.6–1.2", unit: "mg/dL", sex: "all", ageGroup: "adult", sortOrder: 1 },
    { region: "Pakistan", category: "RFT", testName: "Urea", normalRange: "15–45", unit: "mg/dL", sex: "all", ageGroup: "adult", sortOrder: 2 },
    { region: "Pakistan", category: "Electrolytes", testName: "Sodium (Na+)", normalRange: "135–145", unit: "mEq/L", sex: "all", ageGroup: "all", sortOrder: 1 },
    { region: "Pakistan", category: "Electrolytes", testName: "Potassium (K+)", normalRange: "3.5–5.0", unit: "mEq/L", sex: "all", ageGroup: "all", sortOrder: 2 },
  ];
  await bulkUpsertLabValues(seeds, () => {});
};