
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, increment, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface AdminSubscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'canceled' | 'pending';
  startAt: number;
  endAt: number;
  provider: 'Stripe' | 'Manual' | 'Bank Transfer';
  lastPaymentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  timestamp: number;
  subscriptionId?: string;
}

const COLLECTION = "subscriptions";

export const fetchAdminSubscriptions = async (filters: { 
  status?: string; 
  plan?: string; 
  search?: string;
}): Promise<AdminSubscription[]> => {
  try {
    let q = query(collection(db, COLLECTION), orderBy("updatedAt", "desc"), limit(50));

    if (filters.status && filters.status !== 'all') {
      q = query(q, where("status", "==", filters.status));
    }
    
    const snap = await getDocs(q);
    let subs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminSubscription));

    if (filters.search) {
      const s = filters.search.toLowerCase();
      subs = subs.filter(sub => 
        sub.userEmail?.toLowerCase().includes(s) || 
        sub.userName?.toLowerCase().includes(s)
      );
    }

    return subs;
  } catch (error) {
    console.error("Error fetching admin subscriptions:", error);
    return [];
  }
};

export const fetchSubscriptionById = async (id: string): Promise<AdminSubscription | null> => {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as AdminSubscription;
  }
  return null;
};

export const fetchSubscriptionPayments = async (subId: string): Promise<PaymentRecord[]> => {
  try {
    // Primary: Query 'transactions' or 'payments' collection
    // We'll try 'transactions' first as it was used in previous mocks
    const q = query(collection(db, "transactions"), where("subscriptionId", "==", subId), orderBy("date", "desc"), limit(10));
    const snap = await getDocs(q);
    
    if (snap.empty) {
      // Fallback: Check if there's a payments collection
      const q2 = query(collection(db, "payments"), where("subscriptionId", "==", subId), limit(10));
      const snap2 = await getDocs(q2);
      return snap2.docs.map(d => ({ id: d.id, ...d.data() } as any));
    }

    return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  } catch (e) {
    console.warn("Payment fetch failed (collections might not exist yet)", e);
    return [];
  }
};

export const logAdminAction = async (actorUid: string, action: string, targetId: string, meta: any) => {
  try {
    await addDoc(collection(db, "adminLogs"), {
      actorUid,
      action,
      targetType: 'subscription',
      targetId,
      meta,
      createdAt: Date.now()
    });
  } catch (e) {
    console.warn("Log failed", e);
  }
};

export const updateSubscriptionStatus = async (id: string, status: AdminSubscription['status']) => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { 
    status, 
    updatedAt: Date.now() 
  });
};

export const extendSubscription = async (id: string, days: number) => {
  const ref = doc(db, COLLECTION, id);
  const msInDay = 24 * 60 * 60 * 1000;
  await updateDoc(ref, {
    endAt: increment(days * msInDay),
    updatedAt: Date.now()
  });
};
