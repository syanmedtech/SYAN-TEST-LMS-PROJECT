
import { AttemptDetail, Question } from "../../types";

export interface SubtopicStats {
  subtopicId: string;
  subtopicName: string;
  attemptedCount: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
  lowConfidenceRate: number;
  weakScore: number;
}

/**
 * Calculates a "Weakness Score" for subtopics based on student performance.
 * Score is 0 (Strong) to 1 (Very Weak).
 */
export const computeWeakSubtopics = (
  details: AttemptDetail[], 
  questions: Record<string, Question>,
  topN: number = 5
): SubtopicStats[] => {
  const statsMap: Record<string, {
    count: number;
    correct: number;
    totalTime: number;
    lowConfCount: number;
    name: string;
  }> = {};

  // 1. Group behavioral data by subtopic
  details.forEach(detail => {
    const q = questions[detail.questionId];
    if (!q || !q.topicId) return; // Skip unmapped or unknown questions

    const subId = q.topicId; // Using topicId as the unique subtopic reference
    if (!statsMap[subId]) {
      statsMap[subId] = { count: 0, correct: 0, totalTime: 0, lowConfCount: 0, name: q.topicId };
    }

    const s = statsMap[subId];
    s.count++;
    if (detail.isCorrect) s.correct++;
    s.totalTime += detail.timeSpentSeconds || 0;
    
    // Low confidence is level 0 (Low) or 1 (Medium)
    if (detail.confidenceLevel !== undefined && detail.confidenceLevel <= 1) {
      s.lowConfCount++;
    }
  });

  // 2. Calculate scores
  const results: SubtopicStats[] = Object.entries(statsMap).map(([id, s]) => {
    const accuracy = s.correct / s.count;
    const avgTime = s.totalTime / s.count;
    const lowConfRate = s.lowConfCount / s.count;

    // Normalization: 90 seconds is considered "slow/struggling" for a standard medical MCQ
    const normalizedTime = Math.min(1, avgTime / 90);

    // Scoring: Accuracy (60%) + Time (20%) + Confidence (20%)
    const weakScore = ((1 - accuracy) * 0.6) + (normalizedTime * 0.2) + (lowConfRate * 0.2);

    return {
      subtopicId: id,
      subtopicName: id, // Mapping name placeholder, usually resolved from taxonomy lookup
      attemptedCount: s.count,
      correctCount: s.correct,
      accuracy: Math.round(accuracy * 100),
      avgTimeSeconds: Math.round(avgTime),
      lowConfidenceRate: Math.round(lowConfRate * 100),
      weakScore
    };
  });

  // 3. Sort by weakness (descending) and return top N
  return results
    .sort((a, b) => b.weakScore - a.weakScore)
    .slice(0, topN);
};
