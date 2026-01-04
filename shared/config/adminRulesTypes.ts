
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
  forcePublishedOnly: boolean;
  excludeArchived: boolean;
  adaptive?: {
    enabled: boolean;
    intensity: number;         // 0..100
    weakTopicBias: number;     // 0..100
    difficultyTarget: 'balanced' | 'stretch' | 'remedial';
  };
}

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

export const DEFAULT_SELECTION_RULES: SelectionRules = {
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
  adaptive: {
    enabled: false,
    intensity: 50,
    weakTopicBias: 50,
    difficultyTarget: 'balanced'
  }
};

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
