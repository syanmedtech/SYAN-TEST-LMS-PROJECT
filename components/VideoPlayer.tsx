import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Course, TopicContent, VideoPlayerSettings, User } from '../types';
import { getCourses } from '../services/mockService';
import { 
  ChevronLeft, ChevronDown, CheckCircle2, Lock, 
  FileText, BrainCircuit, PlayCircle, Menu, StickyNote, Maximize, Minimize,
  Info, Download, Cast, Play, Pause, Loader2, ShieldAlert, RefreshCw,
  Volume2, VolumeX, Settings, MoreVertical, Subtitles, RotateCcw, FastForward,
  Wifi, WifiOff, Gauge, Zap, History, Sliders, Airplay, MonitorPlay, Shield
} from 'lucide-react';
import { dbGetVideoPlayerSettings, DEFAULT_VIDEO_SETTINGS } from '../services/db/videoSettingsService';
import { fsGetVideoProgress, fsSaveVideoProgress, VideoProgressData } from '../services/db/videoProgressService';
import { fsLogVideoSecurityEvent, VideoSecurityEventType } from '../services/db/videoSecurityService';
import { usePlaybackToken } from '../hooks/usePlaybackToken';
import { getDeviceData } from '../shared/utils/device';

interface VideoPlayerProps {
  courseId: string;
  user: User;
  initialVideoId?: string;
  onBack: () => void;
  onTakeQuiz: (topicId: string) => void;
  onVideoProgress: (courseId: string, videoId: string) => void;
  // Admin Preview Props
  settingsOverride?: VideoPlayerSettings;
  deviceOverride?: Partial<ReturnType<typeof getDeviceData>>;
  onLocalLog?: (msg: string) => void;
}

const VideoToast: React.FC<{ message: string; onExited: () => void; type?: 'info' | 'warning' | 'security' }> = ({ message, onExited, type = 'info' }) => {
  useEffect(() => {
    const timer = setTimeout(onExited, 2500);
    return () => clearTimeout(timer);
  }, [onExited]);

  const colors = {
    info: 'bg-black/80 text-white border-white/10',
    warning: 'bg-amber-600 text-white border-amber-400',
    security: 'bg-red-600 text-white border-red-400 shadow-red-900/40'
  };

  return (
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] px-6 py-3 backdrop-blur-md ${colors[type]} text-xs font-black uppercase tracking-widest rounded-full animate-fade-in pointer-events-none border shadow-2xl flex items-center gap-2`}>
      {type === 'security' && <Shield size={14} fill="white" />}
      {message}
    </div>
  );
};

const ResumePrompt: React.FC<{ 
  time: number; 
  onConfirm: () => void; 
  onCancel: () => void; 
  isBottomSheet: boolean 
}> = ({ time, onConfirm, onCancel, isBottomSheet }) => {
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl">
          <History size={20} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">Resume Playback?</h4>
          <p className="text-xs text-slate-500">You were at {formatTime(time)} last time.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-95"
        >
          Start Over
        </button>
        <button 
          onClick={onConfirm}
          className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          Resume
        </button>
      </div>
    </div>
  );

  if (isBottomSheet) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[60] p-4 animate-slide-up">
        <div className="bg-white dark:bg-slate-900 rounded-t-[2rem] rounded-b-xl shadow-2xl p-6 border-t border-slate-100 dark:border-slate-800 glass-panel">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[60] w-80 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
        {content}
      </div>
    </div>
  );
};

const DynamicWatermark: React.FC<{ identifier: string; suspiciousScore: number; moveInterval: number }> = ({ identifier, suspiciousScore, moveInterval }) => {
  const [position, setPosition] = useState({ top: '15%', left: '15%' });
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 75 + 5) + '%';
      const left = Math.floor(Math.random() * 65 + 5) + '%';
      setPosition({ top, left });
      setTimestamp(new Date().toLocaleTimeString());
    }, (moveInterval || 12) * 1000);
    return () => clearInterval(interval);
  }, [moveInterval]);

  const opacity = Math.min(0.7, 0.12 + (suspiciousScore * 0.08));

  return (
    <div 
      className="absolute z-50 pointer-events-none select-none transition-all duration-700 ease-in-out whitespace-nowrap mix-blend-overlay"
      style={{ top: position.top, left: position.left, opacity: opacity }}
    >
      <div className="flex flex-col items-center">
        <p className="text-white font-black text-[8px] md:text-xs uppercase tracking-[0.2em] drop-shadow-lg">
          Licensed to {identifier}
        </p>
        <p className="text-white font-bold text-[7px] md:text-[10px] drop-shadow-md">
           SYAN MEDICAL • {timestamp}
        </p>
      </div>
    </div>
  );
};

const PlayerLogo: React.FC<{ branding: VideoPlayerSettings['branding']; isMobile: boolean }> = ({ branding, isMobile }) => {
  if (!branding.logoUrl) return null;
  const posClasses = {
    'top-left': 'top-2 left-2 md:top-4 md:left-4',
    'top-right': 'top-2 right-2 md:top-4 md:right-4',
    'bottom-left': 'bottom-16 left-2 md:bottom-20 md:left-4',
    'bottom-right': 'bottom-16 right-2 md:bottom-20 md:left-4'
  };
  
  const width = isMobile 
    ? Math.min(50, (branding.logoWidth || 80) * 0.6) 
    : (branding.logoWidth || 100);

  return (
    <div className={`absolute z-40 ${posClasses[branding.logoPosition || 'top-right']} pointer-events-none transition-all`}>
       <img src={branding.logoUrl} alt="Brand" style={{ width: `${width}px`, maxWidth: '20vw' }} />
    </div>
  );
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  courseId, user, initialVideoId, onBack, onTakeQuiz, onVideoProgress, 
  settingsOverride, deviceOverride, onLocalLog 
}) => {
  const device = { ...getDeviceData(), ...deviceOverride };
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicContent | null>(null);
  const [activeTab, setActiveTab] = useState<'LECTURE' | 'QUIZ' | 'NOTES'>('LECTURE');
  const [playerSettings, setPlayerSettings] = useState<VideoPlayerSettings>(settingsOverride || DEFAULT_VIDEO_SETTINGS);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  
  // Custom Controls State
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'info' | 'warning' | 'security' } | null>(null);
  const [isPiPActive, setIsPiPActive] = useState(false);

  // Quality & Bandwidth
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{ type: string; saveData: boolean }>({ type: 'unknown', saveData: false });

  // Tracking & Enforcement
  const [resumeData, setResumeData] = useState<{ time: number } | null>(null);
  const lastSaveTs = useRef<number>(0);
  const lastAllowedTime = useRef<number>(0);
  const maxTimeReached = useRef<number>(0);
  const hasCheckedResume = useRef<boolean>(false);
  const controlsTimerRef = useRef<any | null>(null);

  // Security Monitoring
  const [suspiciousScore, setSuspiciousScore] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { playbackUrl, watermarkText, isLoading: isAuthorizing, error: authError } = usePlaybackToken(
    activeTopic?.id, 
    user.token
  );

  // Sync settingsOverride if it changes (Admin Preview)
  useEffect(() => {
    if (settingsOverride) {
      setPlayerSettings(settingsOverride);
    }
  }, [settingsOverride]);

  // Network Detection
  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      const update = () => setNetworkInfo({ type: conn.effectiveType, saveData: conn.saveData });
      conn.addEventListener('change', update);
      update();
      return () => conn.removeEventListener('change', update);
    }
  }, []);

  // Background behavior & Security events
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && isPlaying && activeTopic) {
        if (playerSettings.security.enabled && playerSettings.security.logSecurityEvents) {
          const vTime = videoRef.current?.currentTime || 0;
          if (onLocalLog) onLocalLog(`TAB_HIDDEN at ${Math.round(vTime)}s`);
          if (!settingsOverride) {
            fsLogVideoSecurityEvent(user.id, activeTopic.id, {
              type: 'TAB_HIDDEN',
              videoTime: vTime,
              meta: { action: 'app_backgrounded' }
            });
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying, activeTopic, user.id, playerSettings.security, settingsOverride, onLocalLog]);

  // PiP Event Listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnterPiP = () => setIsPiPActive(true);
    const onLeavePiP = () => setIsPiPActive(false);
    v.addEventListener('enterpictureinpicture', onEnterPiP);
    v.addEventListener('leavepictureinpicture', onLeavePiP);
    return () => {
      v.removeEventListener('enterpictureinpicture', onEnterPiP);
      v.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, [playbackUrl]);

  // Mobile Overrides Activation
  const isMobileOverridesActive = device.mobile && playerSettings.mobile.enabled;

  // Data Saver Logic
  const isDataSaverActive = isMobileOverridesActive 
    ? (playerSettings.mobile.dataSaver || networkInfo.saveData)
    : false;

  // Touch Control Size
  const iconSize = isMobileOverridesActive && playerSettings.mobile.touchControlsLarge ? 28 : 20;
  const playIconSize = isMobileOverridesActive && playerSettings.mobile.touchControlsLarge ? 48 : 40;

  // Orientation Check for Mobile
  useEffect(() => {
    if (!device.mobile) return;
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, [device.mobile]);

  const logSecurityViolation = useCallback((type: VideoSecurityEventType, meta?: any) => {
    if (!user || !activeTopic) return;
    const vTime = videoRef.current?.currentTime || 0;
    
    if (onLocalLog) onLocalLog(`${type} Violation: ${JSON.stringify(meta || {})}`);
    
    if (!settingsOverride && playerSettings.security.logSecurityEvents) {
      fsLogVideoSecurityEvent(user.id, activeTopic.id, { 
          type, 
          videoTime: vTime, 
          meta: { ...meta, platform: navigator.platform } 
      });
    }
    setSuspiciousScore(prev => prev + 1);
  }, [user, activeTopic, playerSettings.security, settingsOverride, onLocalLog]);

  useEffect(() => {
    getCourses().then(allCourses => {
      const c = allCourses.find(c => c.id === courseId);
      if (c) {
        setCourse(c);
        let startTopic = null;
        if (initialVideoId) {
            for (const chap of c.chapters) {
                const t = chap.topics.find(top => top.id === initialVideoId);
                if (t) { startTopic = t; setOpenChapters(new Set([chap.id])); break; }
            }
        }
        if (!startTopic && c.chapters.length > 0 && c.chapters[0].topics.length > 0) {
            startTopic = c.chapters[0].topics[0];
            setOpenChapters(new Set([c.chapters[0].id]));
        }
        if (startTopic) setActiveTopic(startTopic);
      }
    });
  }, [courseId, initialVideoId]);

  useEffect(() => {
    if (activeTopic) {
      hasCheckedResume.current = false;
      lastSaveTs.current = 0;
      lastAllowedTime.current = 0;
      maxTimeReached.current = 0;
      setSuspiciousScore(0);
      setActiveTab('LECTURE');
      setIsAutoplayBlocked(false);
      setResumeData(null);
      setCurrentTime(0);
      
      if (!settingsOverride) {
        dbGetVideoPlayerSettings(activeTopic.id).then(settings => {
          setPlayerSettings(settings);
          const mobileActive = device.mobile && settings.mobile.enabled;
          setSelectedQuality(mobileActive && (settings.mobile.dataSaver || networkInfo.saveData) ? (settings.mobile.defaultQuality || '480p') : 'auto');
          if (settings.general.autoplay && device.mobile) {
              setIsMuted(true);
          } else {
              setIsMuted(false);
          }
        });
      } else {
        const mobileActive = device.mobile && settingsOverride.mobile.enabled;
        setSelectedQuality(mobileActive && (settingsOverride.mobile.dataSaver || networkInfo.saveData) ? (settingsOverride.mobile.defaultQuality || '480p') : 'auto');
        setIsMuted(settingsOverride.general.autoplay && device.mobile);
      }
    }
  }, [activeTopic, device.mobile, networkInfo.saveData, settingsOverride]);

  // Security: Event Blockers
  useEffect(() => {
    if (!playerSettings.security.enabled) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
      const type = e.type === 'contextmenu' ? 'RIGHT_CLICK' : 'RATE_CHANGE';
      setToast({ msg: 'Action Restricted for Security', type: 'security' });
      logSecurityViolation(type as any, { event: e.type });
    };

    const container = videoContainerRef.current;
    if (container) {
      if (playerSettings.security.blockRightClick) {
        container.addEventListener('contextmenu', preventDefault);
      }
      if (playerSettings.security.blockCopyPaste) {
        container.addEventListener('copy', preventDefault);
        container.addEventListener('cut', preventDefault);
        container.addEventListener('paste', preventDefault);
      }
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', preventDefault);
        container.removeEventListener('copy', preventDefault);
        container.removeEventListener('cut', preventDefault);
        container.removeEventListener('paste', preventDefault);
      }
    };
  }, [playerSettings.security, logSecurityViolation]);

  const toggleVideoFullScreen = () => {
      if (!videoContainerRef.current) return;
      if (!document.fullscreenElement) {
        videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP failed", err);
    }
  };

  const handleAirPlay = () => {
    if (videoRef.current && (videoRef.current as any).webkitShowPlaybackTargetPicker) {
      (videoRef.current as any).webkitShowPlaybackTargetPicker();
    }
  };

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleContainerTouch = () => {
    if (showControls) {
      setShowControls(false);
    } else {
      resetControlsTimer();
    }
  };

  const handleManualPlay = async () => {
    if (!videoRef.current) return;
    
    const prefFullscreen = playerSettings.general.mobilePreferFullscreen && device.mobile && playerSettings.mobile.enabled;
    if (prefFullscreen && !document.fullscreenElement) {
       try {
         await videoContainerRef.current?.requestFullscreen();
         setIsFullscreen(true);
       } catch (err) {
         console.warn("Fullscreen request failed, continuing inline", err);
       }
    }

    try {
        await videoRef.current.play();
        setIsAutoplayBlocked(false);
        setIsPlaying(true);
        resetControlsTimer();
    } catch (err) {
        console.error("Manual play failed", err);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      resetControlsTimer();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const time = parseFloat(e.target.value);

    // Security: Seek Restrictions
    if (playerSettings.security.enabled) {
      if (playerSettings.security.preventSeekForward && time > lastAllowedTime.current + 2) {
        setToast({ msg: 'Forward seeking restricted', type: 'security' });
        logSecurityViolation('BLUR' as any, { action: 'seek_forward_attempt', time });
        return;
      }
      if (playerSettings.security.enforceWatchOrder && time > maxTimeReached.current + 2) {
        setToast({ msg: 'Please complete current section first', type: 'security' });
        logSecurityViolation('BLUR' as any, { action: 'watch_order_violation', time });
        return;
      }
    }

    if (playerSettings.advanced.disableSeek) {
      setToast({ msg: 'Skipping disabled by instructor', type: 'warning' });
      return;
    }

    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (rate: number) => {
    if (!videoRef.current) return;

    if (playerSettings.security.enabled) {
      if (playerSettings.security.disablePlaybackRateChange && rate !== 1.0) {
        setToast({ msg: 'Speed locked to 1.0x', type: 'security' });
        return;
      }
      const maxSpeed = playerSettings.security.maxAllowedSpeed || 2.0;
      if (rate > maxSpeed) {
        setToast({ msg: `Max speed allowed: ${maxSpeed}x`, type: 'security' });
        logSecurityViolation('RATE_CHANGE', { attemptedRate: rate, max: maxSpeed });
        return;
      }
    }

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (playbackUrl && playerSettings.general.autoplay && videoRef.current) {
        const attempt = async () => {
            try {
                await videoRef.current?.play();
                setIsAutoplayBlocked(false);
                setIsPlaying(true);
            } catch (err) {
                console.warn("Autoplay blocked by browser policy", err);
                setIsAutoplayBlocked(true);
            }
        };
        attempt();
    }
  }, [playbackUrl, playerSettings.general.autoplay]);

  const handleMetadataLoaded = async () => {
    if (videoRef.current) {
        setDuration(videoRef.current.duration);
        if (playerSettings.advanced.autoCaptions && videoRef.current.textTracks.length > 0) {
            for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                videoRef.current.textTracks[i].mode = 'showing';
            }
        }
        
        if (activeTopic && playerSettings.general.resumePlayback && !hasCheckedResume.current) {
            const saved = await fsGetVideoProgress(user.id, activeTopic.id);
            if (saved && saved.lastTimeSeconds > 10) {
                const dur = videoRef.current.duration;
                if (saved.lastTimeSeconds < (dur - 15)) {
                    setResumeData({ time: Math.min(saved.lastTimeSeconds, dur) });
                    maxTimeReached.current = saved.lastTimeSeconds;
                }
            }
            hasCheckedResume.current = true;
        }
    }
  };

  const saveProgress = useCallback((force = false) => {
    if (!videoRef.current || !activeTopic || !playerSettings.general.resumePlayback || settingsOverride) return;
    
    const now = Date.now();
    if (!force && (now - lastSaveTs.current < 10000)) return;

    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    const isCompleted = videoRef.current.ended || (cur / dur > 0.95);

    const performSave = () => {
      fsSaveVideoProgress(user.id, activeTopic.id, {
        lastTimeSeconds: Math.floor(cur),
        durationSeconds: Math.floor(dur),
        device: device.mobile ? 'mobile' : 'desktop',
        lastPlaybackRate: videoRef.current?.playbackRate || 1,
        courseId,
        completed: isCompleted
      });
      lastSaveTs.current = now;
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => performSave());
    } else {
      setTimeout(performSave, 0);
    }
  }, [user.id, activeTopic, playerSettings.general.resumePlayback, device.mobile, courseId, settingsOverride]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeTopic) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    
    // Security Tracking
    if (playerSettings.security.enabled) {
      if (cur > lastAllowedTime.current + 2) {
        if (playerSettings.security.preventSeekForward) {
           videoRef.current.currentTime = lastAllowedTime.current;
           return;
        }
        if (playerSettings.security.enforceWatchOrder && cur > maxTimeReached.current + 2) {
          videoRef.current.currentTime = maxTimeReached.current;
          return;
        }
      }
      lastAllowedTime.current = cur;
      maxTimeReached.current = Math.max(maxTimeReached.current, cur);
    }

    if (playerSettings.advanced.disableSeek) {
        if (cur > lastAllowedTime.current + 2) {
            videoRef.current.currentTime = lastAllowedTime.current;
            setToast({ msg: "Skipping disabled by instructor", type: 'warning' });
        } else {
            lastAllowedTime.current = Math.max(lastAllowedTime.current, cur);
        }
    }
    
    saveProgress();
  };

  const handleResume = () => {
    if (videoRef.current && resumeData) {
      videoRef.current.currentTime = resumeData.time;
      lastAllowedTime.current = resumeData.time;
      maxTimeReached.current = Math.max(maxTimeReached.current, resumeData.time);
      videoRef.current.play();
      setIsPlaying(true);
    }
    setResumeData(null);
  };

  const handleStartOver = () => {
    setResumeData(null);
    if (videoRef.current) {
        videoRef.current.currentTime = 0;
        lastAllowedTime.current = 0;
        videoRef.current.play();
        setIsPlaying(true);
    }
  };

  const SidebarContent = () => (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                  <h2 className="font-bold text-slate-800 dark:text-white line-clamp-1">{course?.title}</h2>
                  <p className="text-xs text-slate-500">{course?.author}</p>
              </div>
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded text-slate-500 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <ChevronLeft size={20} />
              </button>
          </div>
          <div className="flex-1 overflow-y-auto">
              {course?.chapters.map((chapter, idx) => (
                  <div key={chapter.id} className="border-b border-slate-100 dark:border-slate-800">
                      <button onClick={() => toggleChapter(chapter.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left min-h-[44px]">
                          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                              <span className="text-slate-400 mr-2 text-xs">{idx + 1}.</span>
                              {chapter.title}
                          </div>
                          <ChevronDown size={16} className={`text-slate-400 transition-transform ${openChapters.has(chapter.id) ? 'rotate-180' : ''}`} />
                      </button>
                      {openChapters.has(chapter.id) && (
                          <div className="bg-white dark:bg-slate-950">
                              {chapter.topics.map((topic) => (
                                  <button key={topic.id} onClick={() => { setActiveTopic(topic); setIsMobileSidebarOpen(false); }} className={`w-full text-left p-4 pl-8 border-l-4 transition-colors flex items-center gap-3 group min-h-[44px] ${activeTopic?.id === topic.id ? 'bg-syan-teal/5 dark:bg-slate-800 border-l-syan-teal text-syan-teal' : 'border-l-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                                      {topic.isCompleted ? <CheckCircle2 size={16} className="text-green-500" /> : <div className={`w-4 h-4 rounded-full border ${activeTopic?.id === topic.id ? 'border-syan-teal' : 'border-slate-300'}`}></div>}
                                      <span className="text-sm font-medium line-clamp-1">{topic.title}</span>
                                      {topic.isPremium && <Lock size={12} className="text-amber-500 ml-auto" />}
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => {
        const next = new Set(prev);
        if (next.has(chapterId)) next.delete(chapterId);
        else next.add(chapterId);
        return next;
    });
  };

  const watermarkId = (playerSettings.security.enabled && playerSettings.security.watermarkUserIdentity) 
    ? `${user.name} (${user.email || user.id})`
    : (watermarkText || `${user.email} [${user.id.slice(-4)}]`);

  return (
    <div className={`h-full w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden ${device.mobile ? 'player--mobile' : ''} ${device.ios ? 'player--ios' : ''}`}>
        {!settingsOverride && <div className="hidden md:block w-80 h-full flex-shrink-0"><SidebarContent /></div>}
        
        {/* Mobile Header - Touch Targeted */}
        {!isLandscape && !settingsOverride && (
          <div className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
              <button onClick={onBack} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ChevronLeft size={24} className="text-slate-600" />
              </button>
              <span className="font-bold text-slate-800 dark:text-white truncate max-w-[200px] text-sm">{activeTopic?.title}</span>
              <button onClick={() => setIsMobileSidebarOpen(true)} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Menu size={24} className="text-slate-600" />
              </button>
          </div>
        )}

        {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)}></div>
                <div className="w-80 h-full bg-white dark:bg-slate-900 shadow-2xl relative z-10 animate-slide-in-right"><SidebarContent /></div>
            </div>
        )}

        <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${isLandscape && device.mobile ? 'p-0' : ''}`}>
            {activeTopic ? (
                <>
                    {!isLandscape && !settingsOverride && (
                      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{activeTopic.title}</h1>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Lecture • {Math.round(activeTopic.duration / 60)} mins</p>
                          </div>
                          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                              <button onClick={() => setActiveTab('LECTURE')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${activeTab === 'LECTURE' ? 'bg-white dark:bg-slate-700 shadow text-syan-teal' : 'text-slate-500'}`}><PlayCircle size={18} /> Lecture</button>
                              <button onClick={() => setActiveTab('QUIZ')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${activeTab === 'QUIZ' ? 'bg-white dark:bg-slate-700 shadow text-syan-orange' : 'text-slate-500'}`}><BrainCircuit size={18} /> Quiz</button>
                              <button onClick={() => setActiveTab('NOTES')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${activeTab === 'NOTES' ? 'bg-white dark:bg-slate-700 shadow text-syan-pink' : 'text-slate-500'}`}><FileText size={18} /> Notes</button>
                          </div>
                      </div>
                    )}

                    <div className={`flex-1 overflow-y-auto ${isLandscape && device.mobile ? 'p-0' : 'p-4 md:p-8'} bg-slate-50 dark:bg-slate-950 relative`}>
                        {resumeData && (
                          <ResumePrompt 
                            time={resumeData.time} 
                            onConfirm={handleResume} 
                            onCancel={handleStartOver} 
                            isBottomSheet={isMobileOverridesActive && playerSettings.mobile.showResumeBottomSheet} 
                          />
                        )}

                        {activeTab === 'LECTURE' && (
                            <div 
                              className={`${(isLandscape && device.mobile) || settingsOverride ? 'w-full h-full' : 'max-w-4xl mx-auto'} ${playerSettings.security.enabled && playerSettings.security.blockTextSelection ? 'select-none' : ''}`}
                            >
                                <div 
                                  ref={videoContainerRef} 
                                  className={`bg-black overflow-hidden relative group notch-padding ${isLandscape && device.mobile ? 'w-full h-full fixed inset-0 z-50' : (settingsOverride ? 'w-full aspect-video rounded-3xl' : 'aspect-video rounded-2xl shadow-2xl mb-6')}`}
                                  onContextMenu={(e) => playerSettings.security.enabled && playerSettings.security.blockRightClick && e.preventDefault()}
                                  onClick={handleContainerTouch}
                                >
                                    {isAuthorizing && !settingsOverride && (
                                      <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white">
                                         <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
                                         <p className="font-black text-[10px] uppercase tracking-[0.3em] text-primary-200">Securing Session...</p>
                                      </div>
                                    )}

                                    {authError && !settingsOverride && (
                                      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
                                         <ShieldAlert className="text-red-500 mb-4" size={64} />
                                         <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Access Restricted</h3>
                                         <p className="text-slate-400 text-xs max-w-xs leading-relaxed">{authError}</p>
                                         <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 min-h-[44px]">
                                           <RefreshCw size={16} /> Re-verify
                                         </button>
                                      </div>
                                    )}

                                    {toast && <VideoToast message={toast.msg} type={toast.type} onExited={() => setToast(null)} />}

                                    {isAutoplayBlocked && !isAuthorizing && !authError && !resumeData && (
                                      <div className="absolute inset-0 z-[45] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                         <button 
                                            onClick={handleManualPlay}
                                            className={`${isMobileOverridesActive && playerSettings.mobile.touchControlsLarge ? 'w-24 h-24' : 'w-20 h-20'} bg-primary-600 rounded-full flex items-center justify-center shadow-2xl transform active:scale-90 transition-all`}
                                         >
                                            <Play size={playIconSize} fill="white" className="ml-1" />
                                         </button>
                                         <p className="mt-4 font-black text-xs uppercase tracking-widest text-primary-100">Tap to Start Lecture</p>
                                      </div>
                                    )}

                                    {isDataSaverActive && !isAuthorizing && !authError && (
                                      <div className="absolute top-4 left-4 z-40 px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-fade-in">
                                         <Zap size={10} fill="white" /> Data Saver ON
                                      </div>
                                    )}

                                    {(playerSettings.advanced.dynamicWatermark || (playerSettings.security.enabled && playerSettings.security.watermarkUserIdentity)) && (!isAuthorizing || settingsOverride) && !authError && (
                                      <DynamicWatermark 
                                        identifier={watermarkId} 
                                        suspiciousScore={suspiciousScore} 
                                        moveInterval={playerSettings.security.watermarkMoveIntervalSec || 12} 
                                      />
                                    )}

                                    <PlayerLogo branding={playerSettings.branding} isMobile={device.mobile} />

                                    {(playbackUrl || settingsOverride) && (
                                      <video 
                                          key={playbackUrl || 'preview'}
                                          ref={videoRef}
                                          src={playbackUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                                          muted={isMuted}
                                          controls={false}
                                          className="w-full h-full object-contain"
                                          onPlay={() => { 
                                              setIsPlaying(true); 
                                              setIsAutoplayBlocked(false);
                                              if (activeTopic) onVideoProgress(courseId, activeTopic.id); 
                                              resetControlsTimer();
                                          }}
                                          onPause={() => {
                                            setIsPlaying(false);
                                            saveProgress(true);
                                          }}
                                          onEnded={() => {
                                            setIsPlaying(false);
                                            saveProgress(true);
                                          }}
                                          onLoadedMetadata={handleMetadataLoaded}
                                          onTimeUpdate={handleTimeUpdate}
                                          controlsList={(playerSettings.security.enabled && playerSettings.security.blockContextMenuDownload) ? "nodownload noplaybackrate" : "nodownload"}
                                          playsInline={true}
                                          // @ts-ignore
                                          webkit-playsinline="true"
                                          disablePictureInPicture={!playerSettings.general.allowPiP}
                                      />
                                    )}

                                    {/* Custom Controls Layer */}
                                    {showControls && (!isAuthorizing || settingsOverride) && !authError && !isAutoplayBlocked && (
                                      <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-transparent to-black/40 transition-opacity pointer-events-none">
                                          <div className="flex justify-end pt-4 pointer-events-auto">
                                             {device.ios && device.airplay && (
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); handleAirPlay(); }}
                                                  className="p-2 bg-black/40 rounded-lg text-white border border-white/10 active:bg-white/10"
                                                >
                                                  <Airplay size={iconSize} />
                                                </button>
                                             )}
                                          </div>

                                          <div className="flex-1 flex items-center justify-center pointer-events-auto" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                                              <button className={`${isMobileOverridesActive && playerSettings.mobile.touchControlsLarge ? 'p-8' : 'p-6'} bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white transform active:scale-90 transition-transform`}>
                                                {isPlaying ? <Pause size={playIconSize} fill="white" /> : <Play size={playIconSize} fill="white" className="ml-1" />}
                                              </button>
                                          </div>

                                          {/* Bottom Bar */}
                                          <div className="space-y-4 pointer-events-auto">
                                              <div className="relative group/timeline" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                  type="range"
                                                  min={0}
                                                  max={duration || 100}
                                                  value={currentTime}
                                                  onChange={handleSeek}
                                                  className={`w-full ${isMobileOverridesActive && playerSettings.mobile.touchControlsLarge ? 'h-2' : 'h-1'} bg-white/20 rounded-full appearance-none cursor-pointer accent-primary-500 transition-all ${playerSettings.advanced.disableSeek ? 'opacity-30' : 'group-hover/timeline:h-2'}`}
                                                />
                                                {playerSettings.advanced.disableSeek && (
                                                  <div className="absolute inset-0 cursor-not-allowed" onClick={() => setToast({ msg: "Skipping disabled by instructor", type: 'warning' })}></div>
                                                )}
                                              </div>

                                              <div className="flex items-center justify-between gap-4">
                                                  <div className="flex items-center gap-3">
                                                      <span className="text-[10px] font-black text-white/80 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                                      
                                                      <div className="relative">
                                                        <button 
                                                          onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if (playerSettings.security.enabled && playerSettings.security.disablePlaybackRateChange) {
                                                              setToast({ msg: 'Speed Adjustment Restricted', type: 'security' });
                                                              return;
                                                            }
                                                            setShowSpeedMenu(!showSpeedMenu); 
                                                            setShowQualityMenu(false); 
                                                          }}
                                                          className="p-2 bg-black/40 rounded-lg text-white text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1 active:bg-white/10"
                                                        >
                                                          {playbackRate}x <ChevronDown size={10} />
                                                        </button>
                                                        {showSpeedMenu && !playerSettings.security.disablePlaybackRateChange && (
                                                          <div className="absolute bottom-full left-0 mb-2 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 p-1 flex flex-col shadow-2xl min-w-[80px] animate-slide-up">
                                                            {[0.5, 1, 1.25, 1.5, 2].map(r => (
                                                              <button 
                                                                key={r}
                                                                onClick={() => handleSpeedChange(r)}
                                                                className={`px-3 py-2 text-left text-[10px] font-black uppercase rounded-lg ${playbackRate === r ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                                              >
                                                                {r}x
                                                              </button>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                  </div>

                                                  <div className="flex items-center gap-2">
                                                      {playerSettings.general.allowPiP && device.pip && (
                                                        <button 
                                                          onClick={(e) => { e.stopPropagation(); togglePiP(); }}
                                                          className={`p-2 bg-black/40 rounded-lg text-white border border-white/10 active:bg-white/10 ${isPiPActive ? 'text-primary-500 border-primary-500' : ''}`}
                                                          title="Picture in Picture"
                                                        >
                                                          <MonitorPlay size={iconSize} />
                                                        </button>
                                                      )}
                                                      
                                                      <div className="relative">
                                                        <button 
                                                          onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                                                          className="p-2 bg-black/40 rounded-lg text-white border border-white/10 active:bg-white/10"
                                                        >
                                                          <Gauge size={iconSize} />
                                                        </button>
                                                        {showQualityMenu && (
                                                          <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 p-1 flex flex-col shadow-2xl min-w-[100px] animate-slide-up">
                                                            {['auto', '720p', '480p', '360p'].map(q => (
                                                              <button 
                                                                key={q}
                                                                onClick={() => { setSelectedQuality(q); setShowQualityMenu(false); }}
                                                                className={`px-3 py-2 text-left text-[10px] font-black uppercase rounded-lg ${selectedQuality === q ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                                              >
                                                                {q}
                                                              </button>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>

                                                      <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleVideoFullScreen(); }}
                                                        className="p-2 bg-black/40 rounded-lg text-white border border-white/10 active:bg-white/10"
                                                      >
                                                        {isFullscreen ? <Minimize size={iconSize} /> : <Maximize size={iconSize} />}
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                    )}
                                    
                                    {!showControls && isPlaying && !playerSettings.advanced.disableControls && (
                                      <div className="absolute bottom-4 left-4 z-40 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-black text-white/60 tabular-nums border border-white/5 pointer-events-none">
                                         {formatTime(currentTime)}
                                      </div>
                                    )}
                                </div>
                                
                                {!isLandscape && !settingsOverride && (
                                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                      <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Module Insights</h3>
                                        <div className="flex items-center gap-2">
                                           {navigator.onLine ? <Wifi size={16} className="text-emerald-500" /> : <WifiOff size={16} className="text-red-500" />}
                                           <span className="text-[10px] font-black uppercase text-slate-400">{networkInfo.type} CONNECTION</span>
                                        </div>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        You are currently reviewing the {activeTopic.title} module. 
                                        {isDataSaverActive ? " Playback quality is optimized for data conservation." : " You are streaming at full resolution."}
                                      </p>
                                  </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <PlayCircle size={48} className="mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Select a Lesson</p>
                </div>
            )}
        </div>
        
        <style>{`
          .notch-padding {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
          .player--mobile video::-webkit-media-controls-panel {
            display: none !important;
          }
          input[type=range].accent-primary-500::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #0A8BC2;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            border: 2px solid white;
          }
          @media (max-width: 768px) {
            .player--mobile .video-controls-bar {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>
    </div>
  );
};
