
import React, { useState, useEffect } from 'react';
import { FileText, Clock, Hash, ShieldCheck, AlertTriangle, ArrowLeft, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { getTestById, resolveTestQuestions } from '../services/qbankService';
import { fsCanStartAttempt } from '../services/db/firestore';
import { getEffectiveQuizControls } from '../shared/config/adminRulesResolver';
import { MockTest, Question, User } from '../types';

interface Props {
  testId: string;
  user: User;
  onBack: () => void;
  onStart: (questions: Question[], title: string, duration: number, mode: 'EXAM') => void;
}

export const ExamStartScreen: React.FC<Props> = ({ testId, user, onBack, onStart }) => {
  const [exam, setExam] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await getTestById(testId);
        if (!data || data.status !== 'published') {
          setError("This exam is no longer available.");
          return;
        }
        setExam(data);

        // Preliminary Eligibility Check
        const controls = await getEffectiveQuizControls(testId);
        const check = await fsCanStartAttempt(user.id, testId, controls);
        if (!check.allowed) {
          setError(check.reason || "You are not eligible to start this attempt.");
        }
      } catch (e) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [testId, user]);

  const handleStart = async () => {
    if (!exam) return;
    setIsInitializing(true);
    try {
      // Resolve questions (convert IDs to full objects if needed)
      const fullQuestions = await resolveTestQuestions(exam);
      if (fullQuestions.length === 0) {
        throw new Error("No questions found in this assessment blueprint.");
      }

      onStart(
        fullQuestions,
        exam.title,
        exam.durationMins,
        'EXAM'
      );
    } catch (e: any) {
      alert(e.message || "Failed to load questions.");
      setIsInitializing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-syan-teal" size={48} />
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md mb-8">{error}</p>
      <button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden animate-fade-in">
      {/* Top Header */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b flex items-center px-6 gap-4">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><ArrowLeft size={24}/></button>
        <span className="font-bold text-slate-800 dark:text-white truncate">{exam?.title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-syan border border-slate-200 dark:border-slate-800">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{exam?.title}</h1>
                   <p className="text-slate-500 mt-2">{exam?.targetProgramName || 'General Certification Exam'}</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{exam?.durationMins}m</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{(exam as any).totalQuestions || 0}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                  <ShieldCheck className="text-syan-teal" size={18} /> Candidate Instructions
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {exam?.instructions || "Standard Examination Policy:\n1. Ensure you have a stable internet connection.\n2. Do not refresh or exit the browser during the exam.\n3. All questions are mandatory.\n4. Results will be calculated immediately after submission."}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30">
                   <CheckCircle2 className="text-primary-600" size={20} />
                   <span className="text-xs font-bold text-primary-700 dark:text-primary-300">Identity Verified</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                   <Clock className="text-emerald-600" size={20} />
                   <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Session Initialized</span>
                </div>
             </div>

             <div className="mt-12 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={onBack}
                  className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600"
                >
                  Cancel Session
                </button>
                <button 
                  onClick={handleStart}
                  disabled={isInitializing}
                  className="flex-[2] py-5 bg-syan-teal text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-syan-teal/20 hover:bg-syan-darkteal hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isInitializing ? (
                    <><Loader2 className="animate-spin" size={20} /> Preparing Assessment...</>
                  ) : (
                    <><Play size={20} fill="currentColor" /> Start Official Mock</>
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
