
import { useEffect, useRef, useState, useCallback } from 'react';
import { FEATURES } from '../../config/features';
import { getEffectiveQuizControls } from '../config/adminRulesResolver';
import { QuizControls } from '../config/adminRulesTypes';
import { fsLogViolation } from '../../services/db/firestore';

interface GuardProps {
  examId?: string;
  userId?: string;
  attemptId?: string;
  sourceType?: 'practice' | 'mockPaper' | 'exam' | 'other';
  onSubmit?: () => void;
}

export const useQuizGuards = ({ examId, userId, attemptId, sourceType, onSubmit }: GuardProps) => {
  const [controls, setControls] = useState<QuizControls | null>(null);
  const tabSwitchCount = useRef(0);
  const hasSubmitted = useRef(false);

  // 1. Fetch effective controls (Merged Defaults + Global + Overrides)
  useEffect(() => {
    getEffectiveQuizControls(examId).then(setControls);
  }, [examId]);

  // 2. Determine if proctoring should be applied
  const isMock = sourceType === 'mockPaper';
  // Fix: Replaced proctoringLite with proctoring to match QuizControls interface
  const proctoringActive = !!(controls?.proctoring?.enabled && isMock);

  // 3. Log Violation Helper
  const logViolation = useCallback(async (type: any, meta: any = {}) => {
    if (!controls?.logViolations || !proctoringActive || !userId) return;
    
    const severity = controls.violationSeverityMap?.[type === 'navigation' ? 'blur' : type as keyof typeof controls.violationSeverityMap] || 'low';
    
    await fsLogViolation(userId, examId || 'unknown', attemptId || 'session', {
      type,
      severity,
      meta
    });
  }, [controls, proctoringActive, userId, examId, attemptId]);

  // 4. Enforce Protections
  useEffect(() => {
    // Fix: Replaced proctoringLite with proctoring to match QuizControls interface
    if (!proctoringActive || !controls || !controls.proctoring) return;

    const pConfig = controls.proctoring;

    // --- A. Event Prevention (Copy/Paste/Right Click) ---
    const preventAction = (e: Event) => {
      e.preventDefault();
      logViolation(e.type === 'contextmenu' ? 'contextMenu' : 'clipboard');
    };

    if (pConfig.disableCopyPaste) {
      document.addEventListener('copy', preventAction);
      document.addEventListener('cut', preventAction);
      document.addEventListener('paste', preventAction);
      // Also prevent hotkeys
      const preventHotkeys = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          logViolation('clipboard', { key: e.key });
        }
      };
      document.addEventListener('keydown', preventHotkeys);
    }

    if (pConfig.disableRightClick) {
      document.addEventListener('contextmenu', preventAction);
    }

    // --- B. Fullscreen Requirement ---
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !hasSubmitted.current) {
        logViolation('fullscreenExit');
      }
    };

    if (pConfig.fullscreenRequired) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      // Auto-request fullscreen (browser policy might block this without user click, 
      // but we add it here just in case or it gets called by a button in Quiz component)
    }

    // --- C. Tab Switch / Blur Detection ---
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pConfig.detectTabSwitch) {
        tabSwitchCount.current += 1;
        logViolation('tabSwitch', { count: tabSwitchCount.current });

        if (pConfig.maxTabSwitches && tabSwitchCount.current > pConfig.maxTabSwitches) {
          if (onSubmit && !hasSubmitted.current) {
            hasSubmitted.current = true;
            alert("Security Alert: Maximum tab switches exceeded. Your attempt will be flagged for review.");
            // Mark for submit
            onSubmit();
          }
        }
      }
    };

    const handleBlur = () => {
      if (pConfig.detectTabSwitch) {
        logViolation('blur');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // --- D. Navigation Blocking ---
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pConfig.blockBackNavigation) {
        e.preventDefault();
        e.returnValue = '';
        logViolation('navigation', { action: 'unload_attempt' });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // --- CLEANUP ---
    return () => {
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('cut', preventAction);
      document.removeEventListener('paste', preventAction);
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [proctoringActive, controls, userId, examId, onSubmit, logViolation]);

  return { 
    activeControls: controls, 
    isProctored: proctoringActive,
    tabSwitchCount: tabSwitchCount.current
  };
};
