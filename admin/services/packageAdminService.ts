
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
  startAfter,
  DocumentSnapshot,
  setDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface PackageEntitlements {
  programs: string[];
  videoCourses: string[];
  exams: string[];
  qbank: {
    enabled: boolean;
    scope?: {
      subjects?: string[];
      topics?: string[];
    }
  }
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  badge?: string;
  price: number;
  currency: string;
  durationDays?: number;
  startAt?: number;
  endAt?: number;
  status: "active" | "inactive" | "archived";
  sortOrder: number;
  entitlements: PackageEntitlements;
  createdAt: number;
  updatedAt: number;
}

const COLLECTION_NAME = "packages";

export const fetchPackages = async (options: { 
  statusFilter?: string; 
  searchQuery?: string;
  pageSize: number;
  lastDoc?: DocumentSnapshot;
}) => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where("status", "!=", "archived"),
      orderBy("status"),
      orderBy("updatedAt", "desc"),
      limit(options.pageSize)
    );

    if (options.statusFilter && options.statusFilter !== 'all') {
      q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", options.statusFilter),
        orderBy("updatedAt", "desc"),
        limit(options.pageSize)
      );
    }

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const snap = await getDocs(q);
    let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Package));

    if (options.searchQuery) {
      const s = options.searchQuery.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(s));
    }

    return {
      items,
      lastDoc: snap.docs[snap.docs.length - 1]
    };
  } catch (error) {
    console.error("Error fetching packages:", error);
    return { items: [], lastDoc: null };
  }
};

export const fetchPackageById = async (id: string): Promise<Package | null> => {
  const d = await getDoc(doc(db, COLLECTION_NAME, id));
  if (d.exists()) return { id: d.id, ...d.data() } as Package;
  return null;
};

export const savePackage = async (id: string | null, data: Partial<Package>) => {
  const now = Date.now();
  const pkgId = id || doc(collection(db, COLLECTION_NAME)).id;
  
  const payload = {
    ...data,
    id: pkgId,
    updatedAt: now,
    createdAt: id ? (data.createdAt || now) : now,
    status: data.status || "inactive",
    currency: data.currency || "PKR",
    entitlements: data.entitlements || {
      programs: [],
      videoCourses: [],
      exams: [],
      qbank: { enabled: false }
    }
  };

  await setDoc(doc(db, COLLECTION_NAME, pkgId), payload, { merge: true });
  return pkgId;
};

export const updatePackageStatus = async (id: string, status: Package['status']) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), { 
    status, 
    updatedAt: Date.now() 
  });
};

export const duplicatePackage = async (pkg: Package) => {
  const { id, ...rest } = pkg;
  const now = Date.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...rest,
    name: `${pkg.name} (Copy)`,
    status: "inactive",
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};
