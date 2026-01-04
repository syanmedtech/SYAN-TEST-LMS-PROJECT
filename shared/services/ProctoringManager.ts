
import { QuizControls } from "../config/adminRulesTypes";

export type ProctoringEventType = 
  | 'SESSION_START'
  | 'SESSION_END'
  | 'TAB_SWITCH' 
  | 'TAB_HIDDEN'
  | 'WINDOW_BLUR' 
  | 'FULLSCREEN_EXIT' 
  | 'CLIPBOARD_ACCESS' 
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'CONTEXT_MENU' 
  | 'RIGHT_CLICK'
  | 'TEXT_SELECTION'
  | 'NAVIGATION_BLOCK'
  | 'BACK_NAV_ATTEMPT'
  | 'FOCUS_LOST'
  | 'FOCUS_GAINED'
  | 'THRESHOLD_REACHED'
  | 'USER_SCREENSHOT'
  | 'NETWORK_CHANGE'
  | 'CLOCK_SKEW'
  | 'DEVTOOLS_SUSPECTED';

export interface ProctoringViolation {
  type: ProctoringEventType;
  timestamp: number;
  metadata: any;
}

export class ProctoringManager {
  private controls: QuizControls;
  private onViolation: (v: ProctoringViolation) => void;
  private active: boolean = false;
  private violations: ProctoringViolation[] = [];
  private tabSwitchCount: number = 0;

  constructor(controls: QuizControls, onViolation: (v: ProctoringViolation) => void) {
    this.controls = controls;
    this.onViolation = onViolation;
  }

  public start() {
    if (!this.controls.proctoring?.enabled || this.active) return;
    this.active = true;
    this.registerViolation('SESSION_START', { time: Date.now() });
    this.attachListeners();
  }

  public stop() {
    if (!this.active) return;
    this.active = false;
    this.registerViolation('SESSION_END', { time: Date.now() });
    this.detachListeners();
  }

  private attachListeners() {
    const config = this.controls.proctoring;
    if (!config) return;

    if (config.detectTabSwitch) {
      document.addEventListener('visibilitychange', this.handleVisibility);
      window.addEventListener('blur', this.handleBlur);
      window.addEventListener('focus', this.handleFocus);
    }

    if (config.disableCopyPaste) {
      document.addEventListener('copy', this.preventStandard);
      document.addEventListener('cut', this.preventStandard);
      document.addEventListener('paste', this.preventStandard);
      document.addEventListener('keydown', this.handleKeydown);
    }

    if (config.disableRightClick) {
      document.addEventListener('contextmenu', this.preventStandard);
    }

    if (config.fullscreenRequired) {
      document.addEventListener('fullscreenchange', this.handleFullscreen);
    }

    if (config.blockBackNavigation) {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (config.disableTextSelection) {
      document.addEventListener('selectstart', this.preventStandard);
    }
  }

  private detachListeners() {
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);
    document.removeEventListener('copy', this.preventStandard);
    document.removeEventListener('cut', this.preventStandard);
    document.removeEventListener('paste', this.preventStandard);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('contextmenu', this.preventStandard);
    document.removeEventListener('fullscreenchange', this.handleFullscreen);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('selectstart', this.preventStandard);
  }

  private handleVisibility = () => {
    if (document.visibilityState === 'hidden') {
      this.tabSwitchCount++;
      this.registerViolation('TAB_HIDDEN', { count: this.tabSwitchCount });
      this.registerViolation('TAB_SWITCH', { count: this.tabSwitchCount });
    }
  };

  private handleBlur = () => {
    this.registerViolation('WINDOW_BLUR', {});
    this.registerViolation('FOCUS_LOST', {});
  };

  private handleFocus = () => {
    this.registerViolation('FOCUS_GAINED', {});
  };

  private handleFullscreen = () => {
    if (!document.fullscreenElement) {
      this.registerViolation('FULLSCREEN_EXIT', {});
    }
  };

  private preventStandard = (e: Event) => {
    e.preventDefault();
    const typeMap: Record<string, ProctoringEventType> = {
      'copy': 'COPY_ATTEMPT',
      'cut': 'CLIPBOARD_ACCESS',
      'paste': 'PASTE_ATTEMPT',
      'contextmenu': 'RIGHT_CLICK',
      'selectstart': 'TEXT_SELECTION'
    };
    this.registerViolation(typeMap[e.type] || 'NAVIGATION_BLOCK', { event: e.type });
  };

  private handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const type = e.key.toLowerCase() === 'v' ? 'PASTE_ATTEMPT' : 'COPY_ATTEMPT';
      this.registerViolation(type, { key: e.key });
    }
  };

  private handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
    this.registerViolation('BACK_NAV_ATTEMPT', { action: 'beforeunload' });
  };

  private registerViolation(type: ProctoringEventType, metadata: any) {
    const violation: ProctoringViolation = {
      type,
      timestamp: Date.now(),
      metadata
    };
    this.violations.push(violation);
    
    // Check threshold
    const threshold = this.controls.proctoring?.violationThreshold || 10;
    if (this.violations.length === threshold) {
      this.registerViolation('THRESHOLD_REACHED', { threshold });
    }

    this.onViolation(violation);
  }

  public getSummary() {
    const types = this.violations.map(v => v.type);
    return {
      totalViolations: this.violations.length,
      tabSwitches: this.tabSwitchCount,
      copyAttempts: types.filter(t => t === 'COPY_ATTEMPT').length,
      pasteAttempts: types.filter(t => t === 'PASTE_ATTEMPT').length,
      fullscreenExits: types.filter(t => t === 'FULLSCREEN_EXIT').length,
      integrityFlagged: this.tabSwitchCount > (this.controls.proctoring?.maxTabSwitches || 3) || this.violations.length > (this.controls.proctoring?.violationThreshold || 10)
    };
  }
}
