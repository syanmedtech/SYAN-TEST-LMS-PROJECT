
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Question, Option } from '../types';
import { 
    ChevronLeft, ChevronRight, CheckCircle, Flag, Clock, AlertTriangle, 
    XCircle, BookOpen, Infinity, Menu, Calculator as CalcIcon, Activity, 
    Type, PauseCircle, Play, StickyNote, SkipForward, Maximize, Minimize, Users, BarChart2, Hash, AlertOctagon, Info,
    Shield, Camera
} from 'lucide-react';
import { QuizNavigation } from './QuizNavigation';
import { Calculator, LabValues, NotesModal } from './QuizTools';
import { getEffectiveQuizControls } from '../shared/config/adminRulesResolver';
import { QuizControls } from '../shared/config/adminRulesTypes';
import { ProctoringManager } from '../shared/services/proctoring/ProctoringManager';
import { fsLogProctoringEvent } from '../services/db/firestore';

interface QuizProps {
  questions: Question[];
  onSubmit: (
    answers: Record<string, 'a' | 'b' | 'c' | 'd'>, 
    notes: Record<string, string>, 
    flagged: Set<string>,
    meta?: { 
      timeSpentSecondsByQuestion?: Record<string, number>,
      confidenceByQuestion?: Record<string, number>,
      integrityFlagged?: boolean,
      proctoringSummary?: any,
      attemptId?: string
    }
  ) => void;
  onExit: () => void;
  durationSeconds?: number;
  mode: 'TUTOR' | 'EXAM' | 'FLASHCARD';
  examId?: string; 
  userId?: string; 
  sourceType?: 'practice' | 'mockPaper' | 'exam' | 'other';
  scoring?: {
    negativeMarkingEnabled?: boolean;
    negativeMarkPerWrong?: number;
    negativeMarkPerSkipped?: number;
    minScore?: number;
  };
}

export const Quiz: React.FC<QuizProps> = ({ 
  questions, onSubmit, onExit, durationSeconds, mode, examId, userId, sourceType, scoring 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'a' | 'b' | 'c' | 'd'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [controls, setControls] = useState<QuizControls | null>(null);
  const shuffledOptionsMap = useRef<Record<string, Option[]>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [integrityFlagged, setIntegrityFlagged] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureFeedback, setCaptureFeedback] = useState<string | null>(null);
  const questionStartTs = useRef<number>(Date.now());
  const lastIndex = useRef<number>(0);
  const [textSize, setTextSize] = useState<'base' | 'lg' | 'xl'>('base');
  const [activeTool, setActiveTool] = useState<'CALC' | 'LABS' | 'NOTES' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(durationSeconds);
  const timerRef = useRef<number | null>(null);
  const submitOnceRef = useRef(false);
  
  const proctoringManagerRef = useRef<ProctoringManager | null>(null);
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Lockdown Flags
  const isProctoredMock = sourceType === 'mockPaper' && controls?.proctoring?.enabled;
  const lockNav = isProctoredMock && controls?.proctoring?.lockQuestionNavigation;
  const oneAtATime = isProctoredMock && controls?.proctoring?.oneQuestionAtATime;
  const hideExp = isProctoredMock && controls?.proctoring?.hideExplanationUntilSubmit;
  const allowManualSnapshot = isProctoredMock && controls?.proctoring?.allowUserScreenshotCapture;

  const triggerSubmit = useCallback((force = false) => {
    if (submitOnceRef.current) return;
    if (!force && Object.keys(answers).length < questions.length) {
      if (!window.confirm("Submit incomplete quiz?")) return;
    }
    submitOnceRef.current = true;
    
    // Stop proctoring
    proctoringManagerRef.current?.stop();
    const summary = proctoringManagerRef.current?.getSummary();

    const now = Date.now();
    const elapsed = Math.floor((now - questionStartTs.current) / 1000);
    const lastQId = questions[currentIndex].id;
    const finalTimeSpent = { ...timeSpent, [lastQId]: (timeSpent[lastQId] || 0) + elapsed };

    onSubmit(answers, notes, flagged, { 
      timeSpentSecondsByQuestion: finalTimeSpent,
      confidenceByQuestion: confidence,
      integrityFlagged: integrityFlagged || summary?.integrityFlagged,
      proctoringSummary: summary,
      attemptId: sessionId.current
    });
  }, [answers, notes, flagged, timeSpent, confidence, questions, currentIndex, onSubmit, integrityFlagged]);

  useEffect(() => {
    getEffectiveQuizControls(examId).then(cfg => {
      setControls(cfg);
      if ((durationSeconds === undefined || durationSeconds === 0) && cfg.defaultTimeLimitMinutes > 0) {
        setTimeLeft(cfg.defaultTimeLimitMinutes * 60);
      }
      
      // Initialize Proctoring for Mock Papers
      if (sourceType === 'mockPaper' && cfg.proctoring?.enabled && userId) {
        proctoringManagerRef.current = new ProctoringManager({
          uid: userId,
          examId: examId || 'unknown',
          attemptId: sessionId.current,
          config: cfg.proctoring,
          logFn: (event) => fsLogProctoringEvent({
            uid: userId,
            examId: examId || 'unknown',
            attemptId: sessionId.current,
            event
          }),
          onThreshold: (action) => {
            if (action === 'autosubmit') {
              alert("Critical Security Violation: This session is being automatically terminated due to excessive security alerts.");
              triggerSubmit(true);
            } else if (action === 'warn') {
              alert("Security Warning: Multiple integrity violations detected. Further violations may result in automatic submission.");
            } else if (action === 'flag') {
              setIntegrityFlagged(true);
            }
          }
        });
        proctoringManagerRef.current.start();
      }
    });

    return () => {
      proctoringManagerRef.current?.stop();
    };
  }, [examId, sourceType, userId, triggerSubmit]);

  const handleManualCapture = async () => {
    if (!proctoringManagerRef.current || isCapturing) return;
    
    setIsCapturing(true);
    setCaptureFeedback("Capturing Snapshot...");

    try {
      const q = questions[currentIndex];
      const snapshot = {
        questionId: q.id,
        questionText: q.text.substring(0, 150),
        selectedOption: answers[q.id] || "unanswered",
        ts: Date.now()
      };

      await proctoringManagerRef.current.logManualEvent('USER_SCREENSHOT', snapshot);
      
      setCaptureFeedback("Snapshot Recorded Successfully");
      setTimeout(() => setCaptureFeedback(null), 3000);
    } catch (e) {
      setCaptureFeedback("Capture Failed");
      setTimeout(() => setCaptureFeedback(null), 2000);
    } finally {
      setIsCapturing(false);
    }
  };

  const flushCurrentTime = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - questionStartTs.current) / 1000);
    const prevQId = questions[lastIndex.current].id;
    setTimeSpent(prev => ({...prev, [prevQId]: (prev[prevQId] || 0) + elapsed}));
    questionStartTs.current = now;
  }, [questions]);

  useEffect(() => {
    flushCurrentTime();
    lastIndex.current = currentIndex;
  }, [currentIndex, flushCurrentTime]);

  useEffect(() => {
    if (timeLeft !== undefined && timeLeft > 0 && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev! > 0 ? prev! - 1 : 0);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, isPaused]);

  useEffect(() => {
    if (timeLeft === 0) triggerSubmit(true);
  }, [timeLeft, triggerSubmit]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = (mode === 'TUTOR' || mode === 'FLASHCARD') && !!answers[currentQuestion.id];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (optId: 'a' | 'b' | 'c' | 'd') => {
    if (mode === 'TUTOR' && answers[currentQuestion.id]) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optId }));
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  
  // Refined canGoBack logic
  const canGoBack = lockNav ? false : (controls?.proctoring?.blockBackNavigation ? false : (controls?.allowBackNavigation !== false));

  const displayOptions = useMemo(() => {
    if (!controls?.randomizeOptions) return currentQuestion.options;
    if (!shuffledOptionsMap.current[currentQuestion.id]) {
        const shuffled = [...currentQuestion.options].sort(() => Math.random() - 0.5);
        shuffledOptionsMap.current[currentQuestion.id] = shuffled;
    }
    return shuffledOptionsMap.current[currentQuestion.id];
  }, [currentIndex, controls, currentQuestion]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      {isPaused && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <PauseCircle size={64} className="mb-4 text-syan-teal" />
              <h2 className="text-3xl font-bold mb-2">Quiz Paused</h2>
              <button onClick={() => setIsPaused(false)} className="bg-syan-teal px-8 py-3 rounded-full font-bold text-lg">Resume</button>
          </div>
      )}

      {activeTool === 'CALC' && <Calculator onClose={() => setActiveTool(null)} />}
      {activeTool === 'LABS' && <LabValues onClose={() => setActiveTool(null)} />}
      <NotesModal isOpen={activeTool === 'NOTES'} onClose={() => setActiveTool(null)} note={notes[currentQuestion.id] || ''} onSave={(t) => setNotes({...notes, [currentQuestion.id]: t})} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex h-16 bg-white dark:bg-slate-900 border-b items-center justify-between px-6 flex-shrink-0">
             <div className="flex items-center gap-4">
                 <button onClick={onExit} className="text-slate-500 font-bold text-sm flex items-center gap-1"><ChevronLeft size={16} /> Exit</button>
                 <div className="h-6 w-px bg-slate-200"></div>
                 {sourceType === 'mockPaper' && <div className="text-[10px] font-black uppercase text-indigo-500 flex items-center gap-1"><Shield size={14}/> Proctored</div>}
             </div>
             <div className="flex items-center gap-3">
                 <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full flex items-center gap-2 font-mono font-bold">
                    <Clock size={16} className="text-syan-teal" /> {timeLeft !== undefined ? formatTime(timeLeft) : '∞'}
                 </div>
                 {!isProctoredMock && <button onClick={() => setIsPaused(true)} className="p-2 text-slate-500"><PauseCircle size={20} /></button>}
                 
                 {allowManualSnapshot && (
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={handleManualCapture}
                       disabled={isCapturing}
                       className={`p-2 rounded-xl transition-all ${isCapturing ? 'bg-slate-100 text-slate-300' : 'bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                       title="Record Snapshot of Current State"
                     >
                       <Camera size={18} />
                     </button>
                     {captureFeedback && (
                        <div className="hidden lg:block animate-fade-in px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                          {captureFeedback}
                        </div>
                     )}
                   </div>
                 )}
             </div>
             <div className="flex gap-2">
                 <button className="p-2 text-slate-500 hover:text-syan-teal transition-colors" onClick={() => setActiveTool('CALC')}><CalcIcon size={18}/></button>
                 <button className="p-2 text-slate-500 hover:text-syan-teal transition-colors" onClick={() => setActiveTool('LABS')}><Activity size={18}/></button>
                 <button className="p-2 text-slate-500 hover:text-syan-teal transition-colors" onClick={() => setActiveTool('NOTES')}><StickyNote size={18} className={notes[currentQuestion.id] ? 'text-syan-orange' : ''}/></button>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border overflow-hidden p-8">
                    <div className="flex justify-between items-start mb-6">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase px-3 py-1 rounded-full">Clinical Case</span>
                        <button onClick={() => { const n = new Set(flagged); n.has(currentQuestion.id) ? n.delete(currentQuestion.id) : n.add(currentQuestion.id); setFlagged(n); }}>
                            <Flag size={20} className={flagged.has(currentQuestion.id) ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
                        </button>
                    </div>
                    <h2 className={`font-medium text-slate-900 dark:text-white leading-relaxed mb-8 ${textSize==='lg'?'text-xl':textSize==='xl'?'text-2xl':'text-lg'}`}>{currentQuestion.text}</h2>
                    <div className="space-y-3">
                        {displayOptions.map(opt => {
                            const isSelected = answers[currentQuestion.id] === opt.id;
                            // Feedback only in TUTOR/FLASHCARD mode AND not suppressed by lockdown
                            const showFeedback = isAnswered && !hideExp;
                            const isCorrect = opt.id === currentQuestion.correctAnswer;
                            
                            let classes = "border-slate-100 dark:border-slate-800 hover:border-teal-200";
                            if (isSelected) {
                                classes = showFeedback 
                                    ? (isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-red-500 bg-red-50 dark:bg-red-900/20")
                                    : "border-syan-teal bg-teal-50 dark:bg-teal-900/20";
                            } else if (showFeedback && isCorrect) {
                                classes = "border-green-500 bg-green-50 dark:bg-green-900/20";
                            }

                            return (
                                <div key={opt.id} onClick={() => handleSelect(opt.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${classes}`}>
                                    <div className="flex items-center justify-between">
                                        <div><span className="font-black mr-3">{opt.id.toUpperCase()}</span> {opt.text}</div>
                                        {showFeedback && (
                                            isCorrect ? <CheckCircle className="text-green-500" size={18} /> : (isSelected ? <XCircle className="text-red-500" size={18} /> : null)
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isAnswered && !hideExp && currentQuestion.explanation && (
                        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen size={18} className="text-syan-teal" /> Explanation
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-t p-4 flex justify-between items-center px-8">
            <button disabled={!canGoBack || currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)} className="text-slate-500 font-bold disabled:opacity-20 flex items-center gap-1">
                <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex gap-2">
                {isLast ? (
                    <button onClick={() => triggerSubmit()} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Submit Assessment</button>
                ) : (
                    <button onClick={() => setCurrentIndex(p => p + 1)} className="bg-syan-teal text-white px-8 py-3 rounded-xl font-bold flex items-center gap-1">
                        Next <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
      </div>
      <QuizNavigation 
        questions={questions} 
        currentIndex={currentIndex} 
        onJump={oneAtATime ? undefined : setCurrentIndex} 
        answers={answers} 
        flagged={flagged} 
        isOpen={false} 
        onToggle={()=>{}} 
        isMobile={false} 
        allowBackNavigation={canGoBack} 
      />
    </div>
  );
};
