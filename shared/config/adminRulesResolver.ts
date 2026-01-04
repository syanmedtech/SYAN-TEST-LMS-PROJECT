import { 
  SelectionRules, 
  QuizControls, 
  DEFAULT_SELECTION_RULES, 
  DEFAULT_QUIZ_CONTROLS 
} from "./adminRulesTypes";
import { fetchConfigFromFirestore } from "../services/adminConfigReader";

/**
 * Deep merge specific for our configuration structures (1 level deep nesting for specific fields)
 */
const deepMerge = <T extends object>(target: T, ...sources: (Partial<T> | null | undefined)[]): T => {
  const result = { ...target };
  for (const source of sources) {
    if (!source) continue;
    for (const key in source) {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        (result as any)[key] = { ...(result as any)[key], ...value };
      } else if (value !== undefined) {
        result[key] = value as T[Extract<keyof T, string>];
      }
    }
  }
  return result;
};

export const getEffectiveSelectionRules = async (examId?: string): Promise<SelectionRules> => {
  const globalDoc = await fetchConfigFromFirestore("adminConfig", "selectionRules");
  const globalRules = globalDoc?.global as Partial<SelectionRules> | undefined;

  let overrideRules: Partial<SelectionRules> | undefined;
  if (examId) {
    const overrideDoc = await fetchConfigFromFirestore("adminConfig/selectionRulesOverrides/exams", examId);
    overrideRules = overrideDoc?.overrides;
  }

  const effective = deepMerge(DEFAULT_SELECTION_RULES, globalRules, overrideRules);

  // Apply Hard Constraints
  effective.forcePublishedOnly = true;
  effective.excludeArchived = true;

  return effective;
};

export const getEffectiveQuizControls = async (examId?: string): Promise<QuizControls> => {
  const globalDoc = await fetchConfigFromFirestore("adminConfig", "quizControls");
  const globalControls = globalDoc?.global as Partial<QuizControls> | undefined;

  let overrideControls: Partial<QuizControls> | undefined;
  if (examId) {
    const overrideDoc = await fetchConfigFromFirestore("adminConfig/quizControlsOverrides/exams", examId);
    overrideControls = overrideDoc?.overrides;
  }

  const effective = deepMerge(DEFAULT_QUIZ_CONTROLS, globalControls, overrideControls);

  // Apply Hard Constraints & Normalization
  effective.defaultTimeLimitMinutes = Math.max(0, effective.defaultTimeLimitMinutes);
  
  return effective;
};
