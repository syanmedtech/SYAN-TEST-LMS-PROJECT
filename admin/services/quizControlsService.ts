
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface QuizControls {
  // Timer controls
  defaultTimeLimitMinutes: number;
  perSectionTimingEnabled: boolean;
  autoSubmitOnTimeUp: boolean;
  
  // Navigation controls
  allowBackNavigation: boolean;
  allowQuestionSkipping: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  randomizeOptions: boolean;
  
  // Attempts & access
  attemptsAllowedDefault: number; 
  cooldownMinutesBetweenAttempts: number;
  requireLogin: boolean;
  allowResumePausedAttempt: boolean;
  
  // Anti-cheat controls
  blockCopyPaste: boolean;
  blockRightClick: boolean;
  fullscreenRequired: boolean;
  blurDetection: boolean;
  tabSwitchLimit: number;
  webcamProctoringEnabled: boolean;
  
  // Unified Proctoring (Mock Only)
  proctoring?: {
    enabled: boolean;
    fullscreenRequired?: boolean;
    blockBackNavigation?: boolean;
    disableCopyPaste?: boolean;
    disableRightClick?: boolean;
    disableTextSelection?: boolean;
    detectTabSwitch?: boolean;
    maxTabSwitches?: number;
    detectWindowBlur?: boolean;
    maxWindowBlurs?: number;
    collectClientHints?: boolean;
    hashIpIfAvailable?: boolean;
    hideExplanationUntilSubmit?: boolean;
    lockQuestionNavigation?: boolean;
    oneQuestionAtATime?: boolean;
    actionOnThreshold?: 'warn' | 'flag' | 'autosubmit';
    violationThreshold?: number;
    allowUserScreenshotCapture?: boolean;
  };

  // Logging controls
  logViolations: boolean;
  violationSeverityMap: {
    tabSwitch: 'low' | 'medium' | 'high';
    blur: 'low' | 'medium' | 'high';
    fullscreenExit: 'low' | 'medium' | 'high';
    clipboard: 'low' | 'medium' | 'high';
  };
}

export const DEFAULT_QUIZ_CONTROLS: QuizControls = {
  defaultTimeLimitMinutes: 60,
  perSectionTimingEnabled: false,
  autoSubmitOnTimeUp: true,
  
  allowBackNavigation: true,
  allowQuestionSkipping: true,
  showProgressBar: true,
  showQuestionNumbers: true,
  randomizeOptions: false,
  
  attemptsAllowedDefault: 1,
  cooldownMinutesBetweenAttempts: 0,
  requireLogin: true,
  allowResumePausedAttempt: true,
  
  blockCopyPaste: false,
  blockRightClick: false,
  fullscreenRequired: false,
  blurDetection: true,
  tabSwitchLimit: 3,
  webcamProctoringEnabled: false,

  proctoring: {
    enabled: false,
    fullscreenRequired: false,
    blockBackNavigation: false,
    disableCopyPaste: false,
    disableRightClick: false,
    disableTextSelection: false,
    detectTabSwitch: false,
    maxTabSwitches: 3,
    detectWindowBlur: false,
    maxWindowBlurs: 3,
    collectClientHints: false,
    hashIpIfAvailable: false,
    hideExplanationUntilSubmit: false,
    lockQuestionNavigation: false,
    oneQuestionAtATime: false,
    actionOnThreshold: 'warn',
    violationThreshold: 5,
    allowUserScreenshotCapture: false
  },
  
  logViolations: true,
  violationSeverityMap: {
    tabSwitch: 'medium',
    blur: 'low',
    fullscreenExit: 'high',
    clipboard: 'medium'
  }
};

const GLOBAL_DOC_PATH = "adminConfig/quizControls";
const OVERRIDES_COLLECTION = "adminConfig/quizControlsOverrides/exams";

export const fetchGlobalQuizControls = async (): Promise<QuizControls> => {
  try {
    const d = await getDoc(doc(db, GLOBAL_DOC_PATH));
    if (d.exists()) {
      return { ...DEFAULT_QUIZ_CONTROLS, ...d.data().global };
    }
  } catch (e) {
    console.warn("Could not fetch global quiz controls, using defaults", e);
  }
  return DEFAULT_QUIZ_CONTROLS;
};

export const saveGlobalQuizControls = async (controls: QuizControls, userId: string) => {
  await setDoc(doc(db, GLOBAL_DOC_PATH), {
    global: controls,
    updatedAt: Date.now(),
    updatedBy: userId,
  }, { merge: true });
};

export const fetchQuizControlOverride = async (examId: string): Promise<Partial<QuizControls> | null> => {
  try {
    const d = await getDoc(doc(db, OVERRIDES_COLLECTION, examId));
    if (d.exists()) {
      return d.data().overrides;
    }
  } catch (e) {
    console.error("Error fetching quiz control override", e);
  }
  return null;
};

export const saveQuizControlOverride = async (examId: string, overrides: Partial<QuizControls>, userId: string) => {
  await setDoc(doc(db, OVERRIDES_COLLECTION, examId), {
    overrides,
    updatedAt: Date.now(),
    updatedBy: userId,
  }, { merge: true });
};

export const resetQuizControlOverride = async (examId: string, userId: string) => {
  await setDoc(doc(db, OVERRIDES_COLLECTION, examId), {
    overrides: {},
    updatedAt: Date.now(),
    updatedBy: userId,
  });
};
