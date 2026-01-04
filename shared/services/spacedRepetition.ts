
import { FlashcardRecord } from "../../types";

export type SRRating = 0 | 1 | 2 | 3; // 0: Again, 1: Hard, 2: Good, 3: Easy

/**
 * Calculates the next review state for a card based on SM-2 logic.
 */
export const calculateNextReview = (
  prev: FlashcardRecord | null,
  rating: SRRating
): Partial<FlashcardRecord> => {
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  
  // Default values for new cards
  let easeFactor = prev?.easeFactor || 2.5;
  let intervalDays = prev?.intervalDays || 0;
  let totalReviews = (prev?.totalReviews || 0) + 1;

  if (rating === 0) {
    // "Again" - Reset interval but keep ease factor mostly stable
    intervalDays = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Successful review
    if (intervalDays === 0) {
      intervalDays = 1;
    } else if (intervalDays === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.ceil(intervalDays * easeFactor);
    }

    // Adjust ease factor based on rating
    // 3 (Easy) adds to ease, 1 (Hard) subtracts significantly
    const quality = rating; // mapping 1-3 to quality
    easeFactor = easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
  }

  // Cap interval for sanity
  intervalDays = Math.min(intervalDays, 365);

  return {
    dueAt: now + (intervalDays * msInDay),
    intervalDays,
    easeFactor,
    lastReviewedAt: now,
    lastRating: rating,
    totalReviews
  };
};
