
import { Question } from "../../types";
import { SelectionRules } from "../config/adminRulesTypes";
import { LearnerProfile } from "../../services/db/firestore";

interface SelectionParams {
  poolQuestions: Question[];
  rules: SelectionRules;
  count: number;
  avoidQuestionIds?: Set<string>;
  adaptiveContext?: LearnerProfile | null;
}

/**
 * Standard Fisher-Yates shuffle
 */
const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Core Logic for picking questions based on difficulty mix and availability.
 * Features Adaptive Hooks for personalized mastery calibration.
 */
export const selectQuestions = ({
  poolQuestions,
  rules,
  count,
  avoidQuestionIds = new Set(),
  adaptiveContext
}: SelectionParams): Question[] => {
  // 1. Initial Filtering
  let filteredPool = poolQuestions.filter(q => {
    if (rules.forcePublishedOnly && q.status && q.status !== 'published') return false;
    if (rules.excludeArchived && q.isArchived) return false;
    if (rules.avoidRepeats && avoidQuestionIds.has(q.id)) return false;
    return true;
  });

  const isAdaptive = !!(rules.adaptive?.enabled && adaptiveContext);
  let effectiveDifficultyMix = { ...rules.difficultyMix };

  // 2. Adaptive Difficulty Targeting
  if (isAdaptive && rules.adaptive?.difficultyTarget) {
    const target = rules.adaptive.difficultyTarget;
    if (target === 'remedial') {
        // Shift 20% from Hard/Medium to Easy
        const shiftH = Math.min(effectiveDifficultyMix.hard, 10);
        const shiftM = Math.min(effectiveDifficultyMix.medium, 10);
        effectiveDifficultyMix.easy += (shiftH + shiftM);
        effectiveDifficultyMix.hard -= shiftH;
        effectiveDifficultyMix.medium -= shiftM;
    } else if (target === 'stretch') {
        // Shift 20% from Easy/Medium to Hard
        const shiftE = Math.min(effectiveDifficultyMix.easy, 10);
        const shiftM = Math.min(effectiveDifficultyMix.medium, 10);
        effectiveDifficultyMix.hard += (shiftE + shiftM);
        effectiveDifficultyMix.easy -= shiftE;
        effectiveDifficultyMix.medium -= shiftM;
    }
  }

  // 3. Bucketing with Weighted Adaptive Score
  const getAdaptiveScore = (q: Question) => {
    if (!isAdaptive) return Math.random();
    
    const mastery = adaptiveContext?.topicMastery[q.topicId] || 0.2;
    const intensity = (rules.adaptive?.intensity || 50) / 100;
    const bias = (rules.adaptive?.weakTopicBias || 50) / 100;
    
    // Weight: (1 - mastery) means we prefer questions student hasn't mastered
    const masteryWeight = (1 - mastery) * bias;
    const noise = Math.random() * (1 - intensity);
    
    return (masteryWeight * intensity) + noise;
  };

  const processBucket = (bucket: Question[], target: number) => {
    if (target <= 0) return [];
    
    // Sort by adaptive score (Descending) or shuffle if not adaptive
    const scored = bucket.map(q => ({ q, score: getAdaptiveScore(q) }));
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, target).map(i => i.q);
  };

  const easyPool = filteredPool.filter(q => q.difficulty === 'Easy');
  const mediumPool = filteredPool.filter(q => q.difficulty === 'Medium');
  const hardPool = filteredPool.filter(q => q.difficulty === 'Hard' || !q.difficulty);

  // 4. Selection
  const targetEasy = Math.round((effectiveDifficultyMix.easy / 100) * count);
  const targetMedium = Math.round((effectiveDifficultyMix.medium / 100) * count);
  const targetHard = Math.max(0, count - targetEasy - targetMedium);

  const selected: Question[] = [];
  
  selected.push(...processBucket(easyPool, targetEasy));
  selected.push(...processBucket(mediumPool, targetMedium));
  selected.push(...processBucket(hardPool, targetHard));
  
  // 5. Final Shuffle to avoid difficulty clustering
  if (rules.randomizeOrder) {
    return shuffle(selected);
  }

  return selected;
};
