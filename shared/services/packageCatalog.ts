
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { FEATURES } from "../../config/features";

export interface NormalizedPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  entitlements: any;
  badge?: string;
  description?: string;
  sortOrder: number;
}

/**
 * Standardizes inconsistent Firestore schemas (plans vs packages vs pricing)
 * into a single interface for the checkout UI.
 */
const normalize = (id: string, data: any): NormalizedPackage => {
  return {
    id: id,
    name: data.name || data.title || data.planName || 'Standard Plan',
    price: data.price !== undefined ? data.price : (data.monthlyPrice || 0),
    currency: data.currency || 'PKR',
    durationDays: data.durationDays || (data.billingCycle === 'yearly' ? 365 : 30),
    entitlements: data.entitlements || data.includes || data.features || {},
    badge: data.badge || (data.isPopular ? 'Popular' : undefined),
    description: data.description || '',
    sortOrder: data.sortOrder || 0
  };
};

/**
 * Sequentially checks potential collection names for subscription metadata.
 * Useful for migrating from legacy 'plans' collection to 'packages'.
 */
export const fetchActivePackages = async (): Promise<NormalizedPackage[]> => {
  if (!FEATURES.packagesEnabled) return [];

  const collections = ["packages", "plans", "products", "subscriptionPlans"];
  
  for (const colName of collections) {
    try {
      const ref = collection(db, colName);
      // Limited search to avoid cost/perf issues with large datasets
      const snap = await getDocs(query(ref, limit(50)));
      
      if (!snap.empty) {
        // Client-side filtering to handle various "active" field names (status, isActive, etc)
        // without requiring pre-defined composite indices for every possible combination.
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(d => d.status === 'active' || d.isActive === true || d.active === true || d.status === undefined)
          .map(d => normalize(d.id, d))
          .sort((a, b) => a.sortOrder - b.sortOrder);

        if (items.length > 0) return items;
      }
    } catch (e) {
      console.warn(`PackageCatalog: Sequential check failed for [${colName}]`, e);
    }
  }

  return [];
};
