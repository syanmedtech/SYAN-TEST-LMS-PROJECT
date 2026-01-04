import { QuizControls } from "../adminRulesTypes";

export type ProctoringEventData = {
  type:
    | 'SESSION_START'
    | 'SESSION_END'
    | 'FULLSCREEN_EXIT'
    | 'TAB_HIDDEN'
    | 'WINDOW_BLUR'
    | 'COPY_ATTEMPT'
    | 'PASTE_ATTEMPT'
    | 'RIGHT_CLICK'
    | 'TEXT_SELECTION'
    | 'BACK_NAV_ATTEMPT'
    | 'FOCUS_LOST'
    | 'FOCUS_GAINED'
    | 'THRESHOLD_REACHED'
    | 'USER_SCREENSHOT'
    | 'NETWORK_CHANGE'
    | 'CLOCK_SKEW'
    | 'DEVTOOLS_SUSPECTED';
  meta?: Record<string, any>;
};

export type ProctoringLogFn = (event: ProctoringEventData) => Promise<void>;

export interface ProctoringManagerConfig {
  uid: string;
  examId: string;
  attemptId: string;
  config: QuizControls['proctoring'];
  logFn: ProctoringLogFn;
  onThreshold?: (action: 'warn' | 'flag' | 'autosubmit') => void;
}

export class ProctoringManager {
  private uid: string;
  private examId: string;
  private attemptId: string;
  private config: QuizControls['proctoring'];
  private logFn: ProctoringLogFn;
  private onThreshold?: (action: 'warn' | 'flag' | 'autosubmit') => void;

  private active = false;
  private startedAt = 0;
  private lastEventTs = 0;
  private violationCount = 0;
  private counts: Record<string, number> = {};
  private thresholdTriggered = false;

  private clockCheckInterval?: any;
  private lastClockCheckTs = 0;
  private devToolsInterval?: any;

  constructor(params: ProctoringManagerConfig) {
    this.uid = params.uid;
    this.examId = params.examId;
    this.attemptId = params.attemptId;
    this.config = params.config;
    this.logFn = params.logFn;
    this.onThreshold = params.onThreshold;
  }

  public async start() {
    if (this.active || !this.config?.enabled) return;
    this.active = true;
    this.startedAt = Date.now();

    await this.log('SESSION_START', { time: this.startedAt });

    // 1. Fullscreen Enforcement
    if (this.config.fullscreenRequired) {
      this.tryRequestFullscreen();
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    }

    // 2. Tab/Window Detection
    if (this.config.detectTabSwitch) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (this.config.detectWindowBlur) {
      window.addEventListener('blur', this.handleBlur);
      window.addEventListener('focus', this.handleFocus);
    }

    // 3. Disable Actions
    if (this.config.disableRightClick) {
      document.addEventListener('contextmenu', this.handleContextMenu);
    }
    if (this.config.disableCopyPaste) {
      document.addEventListener('copy', this.handleCopyPaste);
      document.addEventListener('cut', this.handleCopyPaste);
      document.addEventListener('paste', this.handleCopyPaste);
    }
    if (this.config.disableTextSelection) {
      document.addEventListener('selectstart', this.handleSelectStart);
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }

    // 4. Back Nav Blocking
    if (this.config.blockBackNavigation) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', this.handlePopState);
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    // 5. Network Monitoring
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', this.handleNetworkChange);
    }

    // 6. Clock Skew Detection
    this.startClockSkewCheck();

    // 7. DevTools Heuristic
    this.startDevToolsCheck();
  }

  public async stop() {
    if (!this.active) return;
    this.active = false;
    await this.log('SESSION_END', { duration: Date.now() - this.startedAt });
    this.detachListeners();
    if (this.clockCheckInterval) clearInterval(this.clockCheckInterval);
    if (this.devToolsInterval) clearTimeout(this.devToolsInterval);
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }

  /**
   * Log a manual event triggered by the user (e.g. Screenshot/Snapshot)
   */
  public async logManualEvent(type: ProctoringEventData['type'], meta: any = {}) {
    if (!this.active) return;
    await this.log(type, meta, false);
  }

  public getState() {
    return {
      counts: { ...this.counts },
      violationCount: this.violationCount,
      thresholdReached: this.thresholdTriggered,
      startedAt: this.startedAt,
      lastEventTs: this.lastEventTs
    };
  }

  public getSummary() {
    return {
      totalViolations: this.violationCount,
      counts: this.counts,
      integrityFlagged: this.thresholdTriggered || this.violationCount > 0,
      startedAt: this.startedAt,
      endedAt: Date.now()
    };
  }

  private detachListeners() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('copy', this.handleCopyPaste);
    document.removeEventListener('cut', this.handleCopyPaste);
    document.removeEventListener('paste', this.handleCopyPaste);
    document.removeEventListener('selectstart', this.handleSelectStart);
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    if ((navigator as any).connection) {
      (navigator as any).connection.removeEventListener('change', this.handleNetworkChange);
    }
  }

  private async log(type: ProctoringEventData['type'], meta: any = {}, countAsViolation = true) {
    this.lastEventTs = Date.now();
    this.counts[type] = (this.counts[type] || 0) + 1;
    
    if (countAsViolation) {
      const violations: ProctoringEventData['type'][] = [
        'FULLSCREEN_EXIT', 'TAB_HIDDEN', 'WINDOW_BLUR', 'COPY_ATTEMPT', 
        'PASTE_ATTEMPT', 'RIGHT_CLICK', 'TEXT_SELECTION', 'BACK_NAV_ATTEMPT', 
        'DEVTOOLS_SUSPECTED', 'CLOCK_SKEW', 'NETWORK_CHANGE'
      ];

      if (violations.includes(type)) {
        this.violationCount++;
        this.checkThreshold();
      }
    }

    await this.logFn({ type, meta });
  }

  private checkThreshold() {
    const threshold = this.config?.violationThreshold || 10;
    if (this.violationCount >= threshold && !this.thresholdTriggered) {
      this.thresholdTriggered = true;
      this.log('THRESHOLD_REACHED', { threshold });
      if (this.onThreshold && this.config?.actionOnThreshold) {
        this.onThreshold(this.config.actionOnThreshold);
      }
    }
  }

  private tryRequestFullscreen() {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          console.warn("Fullscreen request failed. Needs user gesture.");
        });
      }
    } catch (e) {}
  }

  private handleFullscreenChange = () => {
    if (!document.fullscreenElement && this.active) {
      this.log('FULLSCREEN_EXIT');
    }
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.log('TAB_HIDDEN');
    }
  };

  private handleBlur = () => {
    this.log('WINDOW_BLUR');
    this.log('FOCUS_LOST');
  };

  private handleFocus = () => {
    this.log('FOCUS_GAINED');
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    this.log('RIGHT_CLICK');
  };

  private handleCopyPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    this.log(e.type === 'paste' ? 'PASTE_ATTEMPT' : 'COPY_ATTEMPT');
  };

  private handleSelectStart = (e: Event) => {
    this.log('TEXT_SELECTION');
  };

  private handlePopState = () => {
    this.log('BACK_NAV_ATTEMPT');
    window.history.pushState(null, '', window.location.href);
    alert("Navigation is locked during the examination.");
  };

  private handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (this.active) {
      this.log('BACK_NAV_ATTEMPT', { subtype: 'unload' });
      e.preventDefault();
      e.returnValue = '';
    }
  };

  private handleNetworkChange = () => {
    const conn = (navigator as any).connection;
    this.log('NETWORK_CHANGE', {
      online: navigator.onLine,
      effectiveType: conn?.effectiveType,
      downlink: conn?.downlink,
      rtt: conn?.rtt,
      saveData: conn?.saveData
    });
  };

  private startClockSkewCheck() {
    const skewThreshold = 120000; // 2 minutes
    const intervalMs = 15000; // Check every 15s
    this.lastClockCheckTs = Date.now();

    this.clockCheckInterval = setInterval(() => {
      if (!this.active) return;
      const now = Date.now();
      const expected = this.lastClockCheckTs + intervalMs;
      const skew = Math.abs(now - expected);

      if (skew > skewThreshold) {
        this.log('CLOCK_SKEW', { skew, expected, actual: now });
      }
      this.lastClockCheckTs = now;
    }, intervalMs);
  }

  private startDevToolsCheck() {
    const threshold = 160;
    const check = () => {
      if (!this.active) return;
      const devtoolsOpen = window.outerWidth - window.innerWidth > threshold || 
                           window.outerHeight - window.innerHeight > threshold;
      if (devtoolsOpen) {
        this.log('DEVTOOLS_SUSPECTED');
      }
      this.devToolsInterval = setTimeout(check, 10000);
    };
    this.devToolsInterval = setTimeout(check, 5000);
  }
}
