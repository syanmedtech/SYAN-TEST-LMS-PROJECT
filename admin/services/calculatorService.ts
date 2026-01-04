import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface CalculatorInput {
  key: string;
  label: string;
  unit?: string;
  type: "number" | "select";
  required?: boolean;
  options?: string[];
}

export interface CalculatorDef {
  id: string;
  name: string;
  slug: string;
  description?: string;
  inputs: CalculatorInput[];
  formula: string;
  result: {
    label: string;
    unit?: string;
    precision?: number;
  };
  references?: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

const COLLECTION = "calculators";

export const fetchCalculators = async () => {
  const q = query(collection(db, COLLECTION), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CalculatorDef));
};

export const fetchCalculatorById = async (id: string): Promise<CalculatorDef | null> => {
  const d = await getDoc(doc(db, COLLECTION, id));
  return d.exists() ? ({ id: d.id, ...d.data() } as CalculatorDef) : null;
};

export const saveCalculator = async (id: string | null, data: Partial<CalculatorDef>) => {
  const calcId = id || doc(collection(db, COLLECTION)).id;
  const now = Date.now();
  const payload = {
    ...data,
    id: calcId,
    updatedAt: now,
    createdAt: data.createdAt || now,
    isActive: data.isActive ?? false
  };
  await setDoc(doc(db, COLLECTION, calcId), payload, { merge: true });
  return calcId;
};

export const archiveCalculator = async (id: string) => {
  await updateDoc(doc(db, COLLECTION, id), { isActive: false, updatedAt: Date.now() });
};

export const duplicateCalculator = async (calc: CalculatorDef) => {
  const { id, ...rest } = calc;
  const newRef = doc(collection(db, COLLECTION));
  const payload = {
    ...rest,
    id: newRef.id,
    name: `${calc.name} (Copy)`,
    slug: `${calc.slug}-copy`,
    isActive: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await setDoc(newRef, payload);
  return newRef.id;
};
