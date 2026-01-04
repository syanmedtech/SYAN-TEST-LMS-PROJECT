import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface VideoProgressData {
  lastTimeSeconds: number;
  durationSeconds: number;
  updatedAt: any;
  device: 'mobile' | 'desktop';
  lastPlaybackRate: number;
  courseId: string;
  completed: boolean;
}

/**
 * Fetches saved progress for a specific video and user.
 */
export const fsGetVideoProgress = async (uid: string, videoId: string): Promise<VideoProgressData | null> => {
  try {
    const progressRef = doc(db, "users", uid, "videoProgress", videoId);
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      return snap.data() as VideoProgressData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching video progress:", error);
    return null;
  }
};

/**
 * Persists current playback metadata to Firestore.
 * Standard path: users/{uid}/videoProgress/{videoId}
 */
export const fsSaveVideoProgress = async (
  uid: string, 
  videoId: string, 
  payload: Omit<VideoProgressData, 'updatedAt'>
): Promise<void> => {
  try {
    const progressRef = doc(db, "users", uid, "videoProgress", videoId);
    await setDoc(progressRef, {
      ...payload,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    // Fail silently to not interrupt playback
    console.warn("Failed to save video progress:", error);
  }
}