
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, updateDoc, deleteDoc, where, limit } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Entitlements {
  programs: string[]; // e.g. ["MBBS", "FCPS"]
  courses: string[]; // course IDs
  exams: string[]; // paper IDs
  fullQbankAccess: boolean;
  aiTutorAccess: boolean;
}

const PLANS_COLLECTION = "plans";
const ENTITLEMENTS_COLLECTION = "planEntitlements";

export const fetchPlans = async (): Promise<Plan[]> => {
  const q = query(collection(db, PLANS_COLLECTION), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
};

export const fetchEntitlements = async (planId: string): Promise<Entitlements | null> => {
  const d = await getDoc(doc(db, ENTITLEMENTS_COLLECTION, planId));
  if (d.exists()) return d.data() as Entitlements;
  return {
    programs: [],
    courses: [],
    exams: [],
    fullQbankAccess: false,
    aiTutorAccess: false
  };
};

export const savePlan = async (id: string | null, planData: Partial<Plan>, entitlements: Entitlements) => {
  const planId = id || doc(collection(db, PLANS_COLLECTION)).id;
  const now = Date.now();

  const planPayload = {
    ...planData,
    id: planId,
    updatedAt: now,
    createdAt: id ? (planData.createdAt || now) : now
  };

  await setDoc(doc(db, PLANS_COLLECTION, planId), planPayload, { merge: true });
  await setDoc(doc(db, ENTITLEMENTS_COLLECTION, planId), entitlements);
  
  return planId;
};

export const checkPlanInUse = async (planId: string): Promise<boolean> => {
  // Check if any active subscriptions exist for this planId
  const q = query(collection(db, "subscriptions"), where("planId", "==", planId), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
};

export const deletePlan = async (planId: string) => {
  const inUse = await checkPlanInUse(planId);
  if (inUse) {
    // Soft disable instead of hard delete
    await updateDoc(doc(db, PLANS_COLLECTION, planId), { isActive: false, updatedAt: Date.now() });
    return "DISABLED";
  } else {
    await deleteDoc(doc(db, PLANS_COLLECTION, planId));
    await deleteDoc(doc(db, ENTITLEMENTS_COLLECTION, planId));
    return "DELETED";
  }
};
