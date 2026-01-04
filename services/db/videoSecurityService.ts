
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export type VideoSecurityEventType = 'TAB_HIDDEN' | 'BLUR' | 'RATE_CHANGE' | 'FREQUENT_PAUSE';

/**
 * Logs a soft anti-piracy event to Firestore.
 * Path: users/{uid}/videoSecurityLogs/{videoId}/events
 */
export const fsLogVideoSecurityEvent = async (
  uid: string,
  videoId: string,
  event: { 
    type: VideoSecurityEventType; 
    videoTime: number;
    meta?: any;
  }
) => {
  try {
    // collection(db, "users", uid, "videoSecurityLogs", videoId, "events") 
    // satisfies the "log to users/{uid}/videoSecurityLogs/{videoId}" requirement
    // by creating a timestamped event subcollection for that specific video log.
    const logsRef = collection(db, "users", uid, "videoSecurityLogs", videoId, "events");
    await addDoc(logsRef, {
      ...event,
      ts: serverTimestamp(),
      clientTs: Date.now()
    });
  } catch (error) {
    // Fail silently to avoid interrupting the student's learning experience
    console.warn("Security monitor logged a silent failure:", error);
  }
};
