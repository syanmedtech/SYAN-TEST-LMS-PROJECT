import { doc, getDoc, setDoc, collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export interface DifficultyMix {
  easy: number;
  medium: number;
  hard: number;
}

export interface SelectionRules {
  randomizeOrder: boolean;
  difficultyMix: DifficultyMix;
  sourcePriority: ('hierarchy' | 'tags' | 'set')[];
  avoidRepeats: boolean;
  negativeMarkingEnabled: boolean;
  negativeMarkPerWrong: number;
  negativeMarkPerSkipped: number;
  allowSectionOverrides: boolean;
  forcePublishedOnly: boolean; // Always true
  excludeArchived: boolean;   // Always true
  // Added adaptive property to SelectionRules interface to fix error in SelectionRulesForm
  adaptive?: {
    enabled: boolean;
    intensity: number;         // 0..100 (how much to weight mastery vs randomness)
    weakTopicBias: number;     // 0..100 (how aggressively to target weak areas)
    difficultyTarget: 'balanced' | 'stretch' | 'remedial';
  };
}

export const DEFAULT_RULES: SelectionRules = {
  randomizeOrder: true,
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
  sourcePriority: ['hierarchy', 'tags', 'set'],
  avoidRepeats: true,
  negativeMarkingEnabled: false,
  negativeMarkPerWrong: 0.25,
  negativeMarkPerSkipped: 0,
  allowSectionOverrides: true,
  forcePublishedOnly: true,
  excludeArchived: true,
  // Added default adaptive values to match the interface and fix error in SelectionRulesForm
  adaptive: {
    enabled: false,
    intensity: 50,
    weakTopicBias: 50,
    difficultyTarget: 'balanced'
  }
};

const GLOBAL_DOC_PATH = "adminConfig/selectionRules";
const OVERRIDES_COLLECTION = "adminConfig/selectionRulesOverrides/exams";

export const fetchGlobalRules = async (): Promise<SelectionRules> => {
  try {
    const d = await getDoc(doc(db, GLOBAL_DOC_PATH));
    if (d.exists()) {
      return { ...DEFAULT_RULES, ...d.data().global };
    }
  } catch (e) {
    console.warn("Could not fetch global rules, using defaults", e);
  }
  return DEFAULT_RULES;
};

export const saveGlobalRules = async (rules: SelectionRules, userId: string) => {
  await setDoc(doc(db, GLOBAL_DOC_PATH), {
    global: rules,
    updatedAt: Date.now(),
    updatedBy: userId,
  }, { merge: true });
};

export const fetchExamOverride = async (examId: string): Promise<Partial<SelectionRules> | null> => {
  try {
    const d = await getDoc(doc(db, OVERRIDES_COLLECTION, examId));
    if (d.exists()) {
      return d.data().overrides;
    }
  } catch (e) {
    console.error("Error fetching exam override", e);
  }
  return null;
};

export const saveExamOverride = async (examId: string, overrides: Partial<SelectionRules>, userId: string) => {
  await setDoc(doc(db, OVERRIDES_COLLECTION, examId), {
    overrides,
    updatedAt: Date.now(),
    updatedBy: userId,
  }, { merge: true });
};

export const resetExamOverride = async (examId: string, userId: string) => {
  await setDoc(doc(db, OVERRIDES_COLLECTION, examId), {
    overrides: {},
    updatedAt: Date.now(),
    updatedBy: userId,
  });
};