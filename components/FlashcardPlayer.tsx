
import React, { useState, useEffect, useRef } from 'react';
import { Question, Option } from '../types';
import { 
    ChevronLeft, RotateCcw, CheckCircle, Brain, 
    Zap, Clock, BookOpen, AlertCircle, TrendingUp, X
} from 'lucide-react';
import { fsUpsertFlashcardReview } from '../services/db/firestore';
import { SRRating } from '../shared/services/spacedRepetition';

interface FlashcardPlayerProps {
  questions: Question[];
  userId: string;
  onExit: () => void;
  title?: string;
}

export const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ questions, userId, onExit, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleRate = async (rating: SRRating) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Save to Firestore
    await fsUpsertFlashcardReview(userId, currentQuestion.id, rating, timeSpent);
    
    setReviewCount(prev => prev + 1);

    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
      setStartTime(Date.now());
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Session Complete!</h2>
            <p className="text-slate-500 mb-8 font-medium">You reviewed {reviewCount} cards. Your progress has been updated in the cloud.</p>
            <button 
                onClick={onExit}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
            >
                Return to Dashboard
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Header */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={24}/></button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{title || 'Flashcard Mode'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Card {currentIndex + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp size={12} /> Spaced Repetition
             </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-2xl perspective-1000">
           <div className={`relative w-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* Front Side */}
              <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 min-h-[400px] flex flex-col justify-center backface-hidden ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                 <div className="space-y-6">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30 w-fit">Clinical Vignette</span>
                    <h2 className="text-xl md:text-2xl font-medium text-slate-800 dark:text-white leading-relaxed">
                        {currentQuestion.text}
                    </h2>
                 </div>
                 {!isFlipped && (
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="mt-12 w-full py-5 bg-primary-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={20} fill="currentColor" /> Reveal Answer
                    </button>
                 )}
              </div>

              {/* Back Side */}
              <div className={`absolute inset-0 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12 min-h-[400px] flex flex-col overflow-y-auto custom-scrollbar backface-hidden rotate-y-180 ${!isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 w-fit">Correct Answer</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Clock size={14} /> {Math.floor((Date.now() - startTime) / 1000)}s
                        </div>
                    </div>
                    
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            {currentQuestion.options.find(o => o.id === currentQuestion.correctAnswer)?.text}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                           <BookOpen size={14} className="text-syan-teal" /> Explanation
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            {currentQuestion.explanation}
                        </p>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">How difficult was this?</p>
                        <div className="grid grid-cols-4 gap-2">
                           <button onClick={() => handleRate(0)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 transition-all border border-transparent hover:border-red-200">
                              <span className="font-black text-xs uppercase">Again</span>
                              <span className="text-[8px] opacity-60">Today</span>
                           </button>
                           <button onClick={() => handleRate(1)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 text-amber-600 transition-all border border-transparent hover:border-amber-200">
                              <span className="font-black text-xs uppercase">Hard</span>
                              <span className="text-[8px] opacity-60">2d</span>
                           </button>
                           <button onClick={() => handleRate(2)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 text-blue-600 transition-all border border-transparent hover:border-blue-200">
                              <span className="font-black text-xs uppercase">Good</span>
                              <span className="text-[8px] opacity-60">4d</span>
                           </button>
                           <button onClick={() => handleRate(3)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 text-emerald-600 transition-all border border-transparent hover:border-emerald-200">
                              <span className="font-black text-xs uppercase">Easy</span>
                              <span className="text-[8px] opacity-60">7d</span>
                           </button>
                        </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
