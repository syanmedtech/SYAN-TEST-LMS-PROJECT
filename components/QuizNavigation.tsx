
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Grip, X, Lock } from 'lucide-react';
import { Question } from '../types';

interface QuizNavigationProps {
  questions: Question[];
  currentIndex: number;
  onJump?: (index: number) => void;
  answers: Record<string, any>;
  flagged: Set<string>;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  allowBackNavigation?: boolean;
  allowQuestionSkipping?: boolean;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({ 
    questions, currentIndex, onJump, answers, flagged, isOpen, onToggle, isMobile,
    allowBackNavigation = true,
    allowQuestionSkipping = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isMobile ? isOpen : isHovered;
  const jumpingDisabled = !onJump;

  const content = (
      <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 flex-shrink-0 h-16">
              <h3 className={`font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-opacity duration-200 whitespace-nowrap ${!isExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  <Grip size={18} /> Navigator
              </h3>
              {isMobile && (
                  <button onClick={onToggle} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500">
                      <X size={20} />
                  </button>
              )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar relative">
              <div className={`grid grid-cols-5 gap-2 transition-opacity duration-300 ${!isExpanded ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
                  {questions.map((q, i) => {
                      const isCurrent = i === currentIndex;
                      const isAnswered = !!answers[q.id];
                      const isFlagged = flagged.has(q.id);

                      // Navigation Guards
                      const isPast = i < currentIndex;
                      const isForward = i > currentIndex;
                      const isAnsweredPrev = i > 0 ? !!answers[questions[i-1].id] : true;
                      
                      const isDisabled = jumpingDisabled || 
                                         (!allowBackNavigation && isPast) || 
                                         (!allowQuestionSkipping && isForward && (!isAnswered && !isAnsweredPrev));

                      let btnClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                      if (isCurrent) {
                          btnClass = 'bg-syan-teal text-white border-syan-teal ring-2 ring-syan-teal/30 ring-offset-1 dark:ring-offset-slate-900';
                      } else if (isFlagged) {
                          btnClass = 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30';
                      } else if (isAnswered) {
                          btnClass = 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30';
                      }

                      return (
                          <button
                              key={q.id}
                              disabled={isDisabled}
                              onClick={() => {
                                  if (isDisabled || !onJump) return;
                                  onJump(i);
                                  if (isMobile) onToggle();
                              }}
                              className={`
                                  aspect-square rounded-lg border font-bold text-sm transition-all duration-200 flex items-center justify-center relative
                                  ${btnClass} ${isDisabled && !isCurrent ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
                              `}
                          >
                              {i + 1}
                              {isFlagged && !isCurrent && (
                                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500"></div>
                              )}
                          </button>
                      );
                  })}
              </div>

              {!isMobile && !isExpanded && (
                   <div className="flex flex-col items-center gap-2 w-full animate-fade-in absolute inset-0 top-4">
                       {questions.map((q, i) => {
                           const isCurrent = i === currentIndex;
                           const isAnswered = !!answers[q.id];
                           const isFlagged = flagged.has(q.id);
                           
                           let bgClass = 'bg-slate-200 dark:bg-slate-700';
                           if (isCurrent) bgClass = 'bg-syan-teal w-3 h-3';
                           else if (isFlagged) bgClass = 'bg-red-500';
                           else if (isAnswered) bgClass = 'bg-green-500';
     
                           return (
                               <div key={q.id} className={`w-2 h-2 rounded-full transition-all duration-300 ${bgClass}`} />
                           );
                       })}
                   </div>
              )}
          </div>

          <div className={`p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 space-y-2 flex-shrink-0 transition-opacity duration-200 whitespace-nowrap ${!isExpanded ? 'opacity-0 hidden' : 'opacity-100'}`}>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div> Attempted
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div> Flagged
              </div>
              {jumpingDisabled && (
                <div className="flex items-center gap-2 text-indigo-500 font-bold mt-2">
                    <Lock size={12} /> Sequential Mode
                </div>
              )}
              {!allowBackNavigation && !jumpingDisabled && (
                <div className="flex items-center gap-2 text-red-400 font-bold">
                    <X size={12} /> Back Nav Disabled
                </div>
              )}
          </div>
      </div>
  );

  if (!isMobile) {
      return (
          <div 
            className={`hidden md:block h-full border-l border-slate-200 dark:border-slate-800 z-20 absolute top-0 right-0 bottom-0 transition-all duration-300 ease-in-out ${isExpanded ? 'w-72 shadow-2xl' : 'w-4 bg-slate-100 dark:bg-slate-900 opacity-50 hover:opacity-100'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
              <div className={`w-full h-full ${!isExpanded ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                  {content}
              </div>
              {!isExpanded && (
                  <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                      <div className="w-1 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  </div>
              )}
          </div>
      );
  }

  return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onToggle} />}
        <div className={`fixed inset-y-0 right-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {content}
        </div>
      </>
  );
};
