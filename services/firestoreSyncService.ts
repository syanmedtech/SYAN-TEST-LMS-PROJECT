
import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  message: string;
  percent: number;
}

/**
 * Syncs all local data to Firestore.
 * Performs upserts using stable IDs from localStorage.
 */
export const syncAllToFirestore = async (onProgress: (p: SyncProgress) => void) => {
  const collections = ['subjects', 'topics', 'subtopics', 'papers', 'questions'];
  let totalOps = 0;
  let currentOps = 0;

  onProgress({ status: 'syncing', message: 'Preparing data...', percent: 0 });

  // Calculate total operations for progress bar
  collections.forEach(key => {
    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) totalOps += parsed.length;
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
      }
    }
  });

  if (totalOps === 0) {
    onProgress({ status: 'completed', message: 'No local data found to sync.', percent: 100 });
    return;
  }

  try {
    for (const collectionName of collections) {
      const localData = localStorage.getItem(collectionName);
      if (!localData) continue;

      const items = JSON.parse(localData);
      if (!Array.isArray(items)) continue;

      // Firestore Batch limit is 500
      const CHUNK_SIZE = 500;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((item: any) => {
          if (!item.id) return; // Skip items without ID
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item, { merge: true });
        });

        await batch.commit();
        currentOps += chunk.length;
        
        onProgress({ 
          status: 'syncing', 
          message: `Syncing ${collectionName}...`, 
          percent: Math.round((currentOps / totalOps) * 100) 
        });
      }
    }

    onProgress({ status: 'completed', message: 'All data synced successfully to Firestore!', percent: 100 });
  } catch (error: any) {
    console.error("Firestore Sync Error:", error);
    onProgress({ status: 'error', message: `Sync failed: ${error.message}`, percent: 0 });
  }
};
