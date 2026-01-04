import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

interface CacheEntry {
  data: any;
  expiry: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const fetchConfigFromFirestore = async (path: string, subPath?: string): Promise<any> => {
  const cacheKey = subPath ? `${path}/${subPath}` : path;
  const now = Date.now();

  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return cache[cacheKey].data;
  }

  try {
    const docRef = subPath ? doc(db, path, subPath) : doc(db, path);
    const snap = await getDoc(docRef);
    const data = snap.exists() ? snap.data() : null;

    cache[cacheKey] = {
      data,
      expiry: now + CACHE_TTL_MS
    };

    return data;
  } catch (e) {
    console.warn(`AdminConfigReader: Failed to fetch ${cacheKey}`, e);
    return null;
  }
};
