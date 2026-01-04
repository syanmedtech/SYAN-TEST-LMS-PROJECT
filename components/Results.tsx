import React, { useState, useEffect } from 'react';
import { QuizSession } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowLeft, CheckCircle, XCircle, BookOpen, ChevronLeft, ChevronRight, MessageCircle, Menu, Sparkles, Users, BarChart2, AlertOctagon, MinusCircle, PlusCircle } from 'lucide-react';
import { AiTutor } from './AiTutor';
import { QuizNavigation } from './QuizNavigation';

interface ResultsProps {
  session: QuizSession;
  onHome: () => void;
}

export const Results: React.FC<ResultsProps> = ({ session, onHome }) => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(session.questions[0]?.id || null);
  const [showTutor, setShowTutor] = useState(false);
  
  // Navigation State
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Responsive check for Recharts
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const total = session.questions.length;
  // Use session.score (calculated with neg marks if applicable) for percentage
  const percentage = Math.round((session.score / total) * 100);
  
  // Format score for display
  const displayScore = Number.isInteger(session.score) ? session.score : session.score.toFixed(2);
  
  // Pie chart should reflect counts of right/wrong
  const correctCount = session.correctCount ?? 0;
  const wrongCount = session.wrongCount ?? (total - correctCount);
  const skippedCount = session.skippedCount ?? 0;

  const pieData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: total - correctCount },
  ];
  const COLORS = ['#00b894', '#ef4444'];

  const foundIndex = session.questions.findIndex(q => q.id === activeQuestionId);
  const activeIndex = foundIndex !== -1 ? foundIndex : 0;
  const activeQuestion = session.questions[activeIndex];
  const userAnswer = activeQuestionId ? session.answers[activeQuestionId] : null;

  const handlePrev = () => {
    if (activeIndex > 0) {
        setActiveQuestionId(session.questions[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < session.questions.length - 1) {
        setActiveQuestionId(session.questions[activeIndex + 1].id);
    }
  };

  const renderBreakdown = () => {
    if (session.sourceType !== 'mockPaper' || !session.scoring?.negativeMarkingEnabled) return null;

    const negWrong = session.scoring.negativeMarkPerWrong || 0;
    const negSkip = session.scoring.negativeMarkPerSkipped || 0;
    const wrongPenalty = (wrongCount * negWrong).toFixed(2);
    const skippedPenalty = (skippedCount * negSkip).toFixed(2);

    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mt-4 animate-fade-in">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <BarChart2 size={12} /> Score Breakdown
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5"><PlusCircle size={12} className="text-green-500" /> Correct Answers</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{correctCount} (+{correctCount})</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5"><MinusCircle size={12} className="text-red-400" /> Wrong Penalty</span>
            <span className="font-bold text-red-500">-{wrongPenalty} <span className="text-[10px] opacity-50">({negWrong} ea)</span></span>
          </div>
          {parseFloat(skippedPenalty) > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1.5"><MinusCircle size={12} className="text-amber-400" /> Skipped Penalty</span>
              <span className="font-bold text-amber-500">-{skippedPenalty} <span className="text-[10px] opacity-50">({negSkip} ea)</span></span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-slate-400">Final Raw Score</span>
            <span className="font-black text-slate-800 dark:text-white text-sm">{displayScore}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      
      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 flex-shrink-0 z-30">
          <button onClick={onHome} className="text-slate-500 dark:text-slate-400"><ArrowLeft size={24} /></button>
          <span className="font-bold text-slate-800 dark:text-white">Results Summary</span>
          <button onClick={() => setIsMobileNavOpen(true)} className="text-syan-teal"><Menu size={24} /></button>
      </div>

      {showTutor && activeQuestion && (
        <AiTutor 
          question={activeQuestion} 
          userAnswer={userAnswer} 
          onClose={() => setShowTutor(false)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 md:mr-4">
          
          {/* Performance Summary Banner (Desktop) */}
          <div className="hidden md:flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 items-center justify-between">
              <div className="flex items-center gap-6">
                  <button onClick={onHome} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold text-sm">
                      <ArrowLeft size={18} /> Dashboard
                  </button>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{percentage}%</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                            Raw Score<br/>{displayScore}/{total}
                        </div>
                    </div>
                    {session.sourceType === 'mockPaper' && session.scoring?.negativeMarkingEnabled && (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-red-500 tracking-tighter mt-0.5">
                            <AlertOctagon size={10} /> -{session.scoring.negativeMarkPerWrong} for wrong 
                            {session.scoring.negativeMarkPerSkipped! > 0 && ` / -${session.scoring.negativeMarkPerSkipped} for skipped`}
                        </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle size={16} /> {correctCount} Correct
                      </div>
                      <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-medium">
                          <XCircle size={16} /> {wrongCount} Wrong
                      </div>
                  </div>
              </div>
              
              {/* Desktop Breakdown (Visible in banner for mock papers) */}
              {session.sourceType === 'mockPaper' && session.scoring?.negativeMarkingEnabled && (
                <div className="flex gap-4 border-l border-slate-100 dark:border-slate-800 pl-6 h-10 items-center">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Penalty</p>
                      <p className="text-sm font-black text-red-500">
                        -{((wrongCount * (session.scoring.negativeMarkPerWrong || 0)) + (skippedCount * (session.scoring.negativeMarkPerSkipped || 0))).toFixed(2)}
                      </p>
                   </div>
                </div>
              )}
          </div>

          {/* Question Review Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                 {/* Mobile Score Card */}
                 {isMobile && (
                     <div className="md:hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6 text-center">
                         <div className="w-32 h-32 mx-auto relative mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={40} outerRadius={60} dataKey="value">
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-slate-800 dark:text-white">
                                {percentage}%
                            </div>
                         </div>
                         <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Session Complete</h2>
                         <p className="text-sm text-slate-500 mb-2">Final Score: {displayScore}/{total}</p>
                         
                         {renderBreakdown()}

                         <button onClick={onHome} className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl mt-6">Return Home</button>
                     </div>
                 )}

                 {/* Question Card */}
                 {activeQuestion ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase block">
                                    Question {activeIndex + 1}
                                </span>
                                <div className="flex gap-2">
                                  {activeQuestion.difficulty && (
                                      <span className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${
                                          activeQuestion.difficulty === 'Hard' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                                          activeQuestion.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                                          'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
                                      }`}>
                                          <BarChart2 size={12} /> {activeQuestion.difficulty}
                                      </span>
                                  )}

                                  {activeQuestion.isAiGenerated && (
                                      <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-purple-100 dark:border-purple-900/30">
                                          <Sparkles size={12} /> AI Question
                                      </span>
                                  )}
                                </div>
                            </div>
                            <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white leading-relaxed">{activeQuestion.text}</h3>
                        </div>

                        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                            {activeQuestion.options.map(opt => {
                                const isSelected = userAnswer === opt.id;
                                const isCorrect = activeQuestion.correctAnswer === opt.id;
                                const percent = activeQuestion.communityStats[opt.id];
                                
                                let borderClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
                                let icon = null;

                                if (isCorrect) {
                                    borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500';
                                    icon = <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
                                } else if (isSelected && !isCorrect) {
                                    borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                                    icon = <XCircle size={20} className="text-red-600 dark:text-red-400" />;
                                } else if (!isSelected && !isCorrect) {
                                    borderClass = 'opacity-60 bg-slate-50 dark:bg-slate-800/50';
                                }

                                return (
                                    <div key={opt.id} className={`relative rounded-xl border-2 overflow-hidden ${borderClass} transition-all`}>
                                        {/* Community Stats Background Bar */}
                                        <div 
                                            className={`absolute top-0 left-0 bottom-0 bg-opacity-5 transition-all duration-500 ${isCorrect ? 'bg-green-400' : isSelected ? 'bg-red-400' : 'bg-slate-300 dark:bg-slate-600'}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                        
                                        <div className="relative p-4 flex justify-between items-center z-10">
                                            <div className="flex items-center gap-4 flex-grow">
                                                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 ${
                                                    isCorrect 
                                                    ? 'border-green-500 text-green-700 dark:text-green-300 bg-white dark:bg-slate-800' 
                                                    : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800'
                                                }`}>
                                                    {opt.id}
                                                </span>
                                                <span className={`font-medium ${isCorrect ? 'text-green-900 dark:text-green-300' : 'text-slate-700 dark:text-slate-200'}`}>{opt.text}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-shrink-0 pl-4">
                                                <div className="text-right">
                                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{percent}%</span>
                                                   <span className="text-[10px] text-slate-500 dark:text-slate-400 block">chose this</span>
                                                </div>
                                                {icon}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 md:p-8 border-t border-slate-200 dark:border-slate-800">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <BookOpen size={20} className="text-syan-teal" /> Explanation
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">{activeQuestion.explanation}</p>
                            
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                                {/* Prev/Next Group */}
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start order-2 md:order-1">
                                    <button 
                                        onClick={handlePrev}
                                        disabled={activeIndex === 0}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-syan-teal dark:hover:text-syan-teal font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    <span className="text-xs font-bold text-slate-400 md:hidden">{activeIndex + 1} / {session.questions.length}</span>
                                    <button 
                                        onClick={handleNext}
                                        disabled={activeIndex === session.questions.length - 1}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-syan-teal dark:hover:text-syan-teal font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>

                                <button 
                                    onClick={() => setShowTutor(true)}
                                    className="w-full md:w-auto order-1 md:order-2 bg-gradient-to-r from-syan-teal to-syan-darkteal text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={20} /> Ask AI Tutor
                                </button>
                            </div>
                        </div>
                    </div>
                 ) : (
                     <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                         <p className="text-slate-500 dark:text-slate-400">Select a question to view details.</p>
                     </div>
                 )}
              </div>
          </div>
      </div>

      {/* Right Sidebar (Desktop) */}
      <div 
        className={`hidden md:block border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative transition-all duration-300 ease-in-out ${isNavOpen ? 'w-80 shadow-2xl' : 'w-4 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-50 hover:opacity-100'}`}
        onMouseEnter={() => setIsNavOpen(true)}
        onMouseLeave={() => setIsNavOpen(false)}
      >
           {/* Handle for collapsed state */}
           {!isNavOpen && (
              <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                  <div className="w-1 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              </div>
           )}
           
           <div className={`h-full overflow-hidden transition-opacity ${!isNavOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <h3 className="font-bold text-slate-800 dark:text-white">Question Navigator</h3>
                        <div className="flex gap-4 mt-4">
                             <div className="text-center">
                                 <div className="text-2xl font-black text-green-500">{correctCount}</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase">Correct</div>
                             </div>
                             <div className="text-center">
                                 <div className="text-2xl font-black text-red-500">{wrongCount}</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase">Wrong</div>
                             </div>
                             <div className="text-center border-l pl-4 border-slate-200 dark:border-slate-700">
                                 <div className="text-2xl font-black text-slate-800 dark:text-white">{percentage}%</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase">Score</div>
                             </div>
                        </div>

                        {renderBreakdown()}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-4 gap-2">
                             {session.questions.map((q, i) => {
                                 const isCorrect = session.answers[q.id] === q.correctAnswer;
                                 return (
                                     <button
                                        key={q.id}
                                        onClick={() => setActiveQuestionId(q.id)}
                                        className={`aspect-square rounded-lg font-bold text-sm border-2 transition-all ${
                                            activeQuestionId === q.id 
                                            ? 'ring-2 ring-syan-teal ring-offset-1 dark:ring-offset-slate-900 scale-105' 
                                            : 'hover:scale-105'
                                        } ${
                                            isCorrect 
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400' 
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400'
                                        }`}
                                     >
                                         {i + 1}
                                     </button>
                                 );
                             })}
                        </div>
                    </div>
                </div>
           </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}></div>
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl animate-slide-in-right">
                  <QuizNavigation 
                    questions={session.questions}
                    currentIndex={activeIndex}
                    onJump={(i) => { setActiveQuestionId(session.questions[i].id); setIsMobileNavOpen(false); }}
                    answers={session.answers}
                    flagged={session.flagged}
                    isOpen={true}
                    onToggle={() => setIsMobileNavOpen(false)}
                    isMobile={true}
                  />
              </div>
          </div>
      )}

    </div>
  );
};