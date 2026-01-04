
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { VideoPlayerSettings } from "../../types";

/**
 * Platform defaults for SYAN Video Player
 * Ensures backward compatibility for older video entries.
 */
export const DEFAULT_VIDEO_SETTINGS: VideoPlayerSettings = {
  general: {
    preload: true,
    autoplay: false,
    loop: false,
    enableDownload: false,
    showTitle: true,
    allowCast: true,
    allowPiP: true,
    resumePlayback: true,
    mobilePreferFullscreen: false,
  },
  advanced: {
    disableSeek: false,
    disableControls: false,
    showProviderBranding: false,
    dynamicWatermark: true,
    autoCaptions: true
  },
  branding: {
    playerColor: "#0A8BC2", // Brand Primary
    logoPosition: 'top-right',
    logoWidth: 80
  },
  mobile: {
    enabled: true,
    dataSaver: true,
    defaultQuality: 'auto',
    allowHighQualityOnWifi: true,
    touchControlsLarge: true,
    showResumeBottomSheet: true
  },
  security: {
    enabled: false,
    blockRightClick: true,
    blockCopyPaste: true,
    blockTextSelection: true,
    blockContextMenuDownload: true,
    disablePlaybackRateChange: false,
    maxAllowedSpeed: 1.25,
    preventSeekForward: false,
    enforceWatchOrder: false,
    watermarkUserIdentity: false,
    watermarkMoveIntervalSec: 12,
    logSecurityEvents: true
  },
  version: 1
};

/**
 * Returns safe defaults for the video player settings.
 */
export const defaultSettings = (): VideoPlayerSettings => DEFAULT_VIDEO_SETTINGS;

/**
 * Fetches settings for a specific video. 
 * Reads from videos/{videoId}/playerSettings and merges with platform defaults.
 * Uses section-level merging to prevent data loss when new sections are added to schema.
 */
export const dbGetVideoPlayerSettings = async (videoId: string): Promise<VideoPlayerSettings> => {
  try {
    const docRef = doc(db, "videos", videoId);
    const snap = await getDoc(docRef);
    
    if (snap.exists() && snap.data()?.playerSettings) {
      const stored = snap.data().playerSettings;
      
      // Safe section-level merge to handle documents with missing new sections (mobile/security)
      return {
        ...DEFAULT_VIDEO_SETTINGS,
        ...stored,
        general: { ...DEFAULT_VIDEO_SETTINGS.general, ...(stored.general || {}) },
        advanced: { ...DEFAULT_VIDEO_SETTINGS.advanced, ...(stored.advanced || {}) },
        branding: { ...DEFAULT_VIDEO_SETTINGS.branding, ...(stored.branding || {}) },
        mobile: { ...DEFAULT_VIDEO_SETTINGS.mobile, ...(stored.mobile || {}) },
        security: { ...DEFAULT_VIDEO_SETTINGS.security, ...(stored.security || {}) },
        version: stored.version || 1
      };
    }
    
    return DEFAULT_VIDEO_SETTINGS;
  } catch (error) {
    console.warn(`Error fetching video settings for ${videoId}:`, error);
    return DEFAULT_VIDEO_SETTINGS;
  }
};

/**
 * Persists settings for a specific video at videos/{videoId}/playerSettings.
 * Includes field validation, server-side timestamping, and version incrementing.
 */
export const dbSaveVideoPlayerSettings = async (videoId: string, settings: VideoPlayerSettings): Promise<void> => {
  try {
    // 1. Validation Logic
    const validatedSettings = { ...settings };
    
    // Logo Width validation (min 20px)
    if (validatedSettings.branding.logoWidth !== undefined) {
      validatedSettings.branding.logoWidth = Math.max(20, validatedSettings.branding.logoWidth);
    }

    // Security constraints (only if enabled)
    if (validatedSettings.security.enabled) {
      // Max Allowed Speed (1.0 to 3.0)
      if (validatedSettings.security.maxAllowedSpeed !== undefined) {
        validatedSettings.security.maxAllowedSpeed = Math.min(3, Math.max(1, validatedSettings.security.maxAllowedSpeed));
      }
      // Watermark Move Interval (5 to 60 seconds)
      if (validatedSettings.security.watermarkMoveIntervalSec !== undefined) {
        validatedSettings.security.watermarkMoveIntervalSec = Math.min(60, Math.max(5, validatedSettings.security.watermarkMoveIntervalSec));
      }
    }

    // 2. Fetch current version to increment
    const videoRef = doc(db, "videos", videoId);
    const existing = await getDoc(videoRef);
    const currentSettings = existing.exists() ? (existing.data().playerSettings || null) : null;
    const prevVersion = currentSettings?.version || 0;

    // 3. Commit with Merge
    await setDoc(videoRef, { 
      playerSettings: {
        ...validatedSettings,
        updatedAt: serverTimestamp(),
        version: prevVersion + 1,
        previousConfig: currentSettings // Keep snapshot for rollback support
      }
    }, { merge: true });
  } catch (error) {
    console.error(`Error saving video settings for ${videoId}:`, error);
    throw error;
  }
};

/**
 * LEGACY WRAPPERS (To prevent breaking existing code during transition)
 */
export const fsGetVideoSettings = dbGetVideoPlayerSettings;
export const fsSaveVideoSettings = dbSaveVideoPlayerSettings;
