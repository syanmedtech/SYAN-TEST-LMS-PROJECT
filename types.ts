export interface AppSettings {
  maintenanceMode: boolean;
  allowAIQuestionGen: boolean;
  defaultDifficulty: string;
  updatedAt: number;
}

export interface Subscription {
  planName: string;
  expiryDate: number;
  status: 'active' | 'expired' | 'trial';
  autoRenew: boolean;
  billingCycle: 'monthly' | 'yearly';
  price: number;
}

export interface Transaction {
  id: string;
  date: number;
  planName: string;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
}

export interface User {
  id: string;
  name: string;
  token: string;
  role: 'student' | 'admin';
  subscription: Subscription;
  // Profile Fields
  email: string;
  phone?: string;
  cnic?: string; // 13 digits
  city?: string;
  college?: string;
  hospital?: string;
  address?: string;
  dob?: number;
  gender?: 'Male' | 'Female' | 'Other';
  specialty?: string;
  graduationYear?: string;
  avatarUrl?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: number;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface BookmarkItem {
  id: string;
  type: 'QUESTION' | 'VIDEO';
  title: string;
  subtitle: string; // e.g. Topic name or Course name
  dateAdded: number;
  referenceId: string; // ID to navigate to (questionId or videoId)
  contextId?: string; // e.g. courseId for videos
}

export interface StudyTask {
  id: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: 'QUIZ' | 'VIDEO' | 'READING' | 'REVISION' | 'CUSTOM';
  durationMins: number;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  category?: string;
  linkedResourceId?: string;
}

export interface StudyPreferences {
  examGoal: string;
  dailyHours: number;
  preferredTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  learningStyle: 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic';
  weakAreas: string[];
  startDate: string;
}

export interface ExamPlan {
  examName: string;
  examDate: string; // YYYY-MM-DD
  totalQuizzesToSolve: number;
  solvedQuizzes: number;
  dailyStudyHours: number;
  isExamMode: boolean; // Auto-enabled when < 14 days
}

export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERY';

export interface TopicTracker {
  topicId: string;
  topicName: string;
  status: TopicStatus;
  timeSpentMins: number;
  quizAccuracy: number; // 0-100
  lastStudied?: string;
}

export interface DailyLog {
  date: string;
  hoursStudied: number;
  topicsCovered: number;
  quizzesSolved: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  deadline: string;
  targetPercent: number;
  currentPercent: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EXAM';
  subject?: string;
}

export interface StudyPlan {
  examType: string;
  examDate: string;
  hoursPerDay: number;
  generatedDate: number;
}

export interface Topic {
  id: string;
  name: string;
  parentId?: string; // For hierarchy
  questionCount: number;
  children?: Topic[];
}

export interface Option {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  topicId: string;
  communityStats: {
    a: number;
    b: number;
    c: number;
    d: number;
  };
  isAiGenerated?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  totalAttempts?: number;
  status?: string;
  isArchived?: boolean;
}

/**
 * Standard Mock Test interface
 */
export interface MockTest {
  id: string;
  title: string;
  description?: string;
  programId: string;
  durationMins: number;
  questions: Question[];      // Embedded questions mode
  questionIds?: string[];     // IDs-only mode
  totalQuestions?: number;    // Additive optional
  createdAt?: string;
  updatedAt?: string;         // Additive optional
  archived?: boolean;         // Additive optional
  status?: 'draft' | 'published';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  maxAttempts?: number;       // Additive optional
  type?: 'MOCK' | 'PRACTICE'; // Additive optional
}

export interface QuizSession {
  questions: Question[];
  answers: Record<string, 'a' | 'b' | 'c' | 'd'>; // questionId -> selectedOption
  notes: Record<string, string>; // questionId -> note text
  flagged: Set<string>; // Set of question IDs
  isSubmitted: boolean;
  score: number;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  startTime: number;
  endTime?: number;
  title?: string; // e.g. "Anatomy Quiz" or "Mock Paper 1"
  durationSeconds?: number; // 0 or undefined means no limit
  mode: 'TUTOR' | 'EXAM' | 'FLASHCARD';
  testId?: string; // Reference to the MockTest
  programId?: string;
  
  // Rule metadata (Backward compatibility)
  negativeMarkingEnabled?: boolean;
  /** Added negativeMarkingValue for backward compatibility in App.tsx and firestore.ts */
  negativeMarkingValue?: number; // e.g. 0.25
  negativeMarkPerWrong?: number;  // e.g. 0.25
  negativeMarkPerSkipped?: number; // default 0
  minScore?: number; // default 0

  // New Scoring Configuration
  sourceType?: 'practice' | 'mockPaper' | 'exam' | 'other';
  scoring?: {
    negativeMarkingEnabled?: boolean;
    negativeMarkPerWrong?: number;  // e.g. 0.25
    negativeMarkPerSkipped?: number; // default 0
    minScore?: number; // default 0
  };

  flashcardConfig?: {
    isSpacedRepetition: boolean;
    showAnswerDefault?: boolean;
  };
}

/** Added ChatMessage for AI Tutor */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/** Added Instructor interface for Course authors */
export interface Instructor {
  id: string;
  name: string;
  avatarUrl?: string;
  specialty?: string;
}

/** Added TopicContent for course chapters and lessons */
export interface TopicContent {
  id: string;
  title: string;
  duration: number; // in seconds
  videoUrl?: string;
  notesContent?: string;
  isPremium?: boolean;
  isCompleted?: boolean;
}

/** Added Chapter interface for Course structure */
export interface Chapter {
  id: string;
  title: string;
  topics: TopicContent[];
}

/** Added Course interface for Exam Courses view */
export interface Course {
  id: string;
  title: string;
  examCategory: string;
  author: string;
  thumbnailUrl?: string;
  stats: {
    videos: number;
    quizzes: number;
    notes: number;
  };
  relatedTopicId?: string;
  chapters: Chapter[];
}

/** Added VideoProgress interface for tracking watch history */
export interface VideoProgress {
  courseId: string;
  videoId: string;
  lastWatchedAt: number;
  timestamp: number; // current seek time in seconds
  completed: boolean;
}

/** Added CategoryPerformance for subject-level analytics */
export interface CategoryPerformance {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

/** Added UserStatistics interface for the Statistics module */
export interface UserStatistics {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  totalTimeSeconds: number;
  averageSpeedSeconds: number;
  categoryPerformance: CategoryPerformance[];
  weakAreas: string[];
  streak: {
    currentStreak: number;
    maxStreak: number;
    lastStudyDate: number;
    activityMap: { date: string; count: number }[];
  };
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
  monthlyProgress: { month: string; score: number }[];
}

export interface FlashcardRecord {
  questionId: string;
  dueAt: number; // timestamp
  intervalDays: number;
  easeFactor: number;
  lastReviewedAt: number;
  lastRating: number;
  totalReviews: number;
}

export interface AttemptDetail {
  questionId: string;
  selectedOption?: 'a' | 'b' | 'c' | 'd';
  isCorrect?: boolean;
  timeSpentSeconds?: number; // integer >=0
  confidenceLevel?: number; // 0 (Low), 1 (Medium), 2 (High), 3 (Sure)
  topicId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  updatedAt: number;
  flashcardRating?: number; // 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
}

export type AttemptDetailMap = Record<string, AttemptDetail>;

export interface Paper {
  id: string;
  title: string;
  description: string;
  durationMins: number;
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizHistoryItem {
  id: string;
  date: number;
  title: string;
  score: number;
  total: number;
  percentage: number;
  mode: 'TUTOR' | 'EXAM' | 'FLASHCARD';
  testId?: string; // Added testId reference
  programId?: string;
}

/** 
 * Extended Video Player Settings for SYAN LMS 
 */
export interface VideoPlayerSettings {
  general: {
    preload?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    enableDownload?: boolean;
    showTitle?: boolean;
    allowCast?: boolean;
    allowPiP?: boolean;
    resumePlayback?: boolean;
    mobilePreferFullscreen?: boolean;
    // Deprecated: Moving to .mobile but kept for policy compatibility
    mobileDataSaver?: boolean;
    mobileDefaultQuality?: 'auto' | '360p' | '480p' | '720p';
    mobileAllowHighQualityOnWifi?: boolean;
  };

  advanced: {
    disableSeek?: boolean;
    disableControls?: boolean;
    showProviderBranding?: boolean;
    dynamicWatermark?: boolean;
    autoCaptions?: boolean;
  };

  branding: {
    playerColor?: string;
    logoUrl?: string;
    logoLink?: string;
    logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    logoWidth?: number;
  };

  mobile: {
    enabled?: boolean;                    // master toggle for mobile overrides
    dataSaver?: boolean;                 // mobile data saver mode
    defaultQuality?: 'auto'|'360p'|'480p'|'720p';
    allowHighQualityOnWifi?: boolean;    // only if wifi
    touchControlsLarge?: boolean;        // larger buttons
    showResumeBottomSheet?: boolean;     // mobile-specific resume UI
  };

  security: {
    enabled?: boolean;                   // master toggle
    blockRightClick?: boolean;
    blockCopyPaste?: boolean;
    blockTextSelection?: boolean;
    blockContextMenuDownload?: boolean;  // hide download + prevent context menu
    disablePlaybackRateChange?: boolean; // stop speed change
    maxAllowedSpeed?: number;            // fallback if allowed
    preventSeekForward?: boolean;        // stricter than disableSeek: only allow backward
    enforceWatchOrder?: boolean;         // cannot watch beyond unlocked timestamp
    watermarkUserIdentity?: boolean;     // overlay user name/email/id
    watermarkMoveIntervalSec?: number;   // e.g. 12
    logSecurityEvents?: boolean;         // store events
  };

  version?: number;
  updatedAt?: any;
}