
import React, { useState, useEffect } from 'react';
import { FileText, Clock, Hash, RotateCcw, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { getTests } from '../services/qbankService';
import { fsGetRecentAttempts } from '../services/db/firestore';
import { MockTest, User } from '../types';

interface Props {
  user: User;
  onSelectExam: (testId: string) => void;
}

export const MockExamsList: React.FC<Props> = ({ user, onSelectExam }) => {
  const [exams, setExams] = useState<MockTest[]>([]);
  const [attemptsMap, setAttemptsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);
      try {
        // Fetch published tests for student program
        const availableTests = await getTests(user.specialty || 'MBBS');
        const publishedTests = availableTests.filter(t => t.status === 'published');
        setExams(publishedTests);

        // Fetch user attempts to check eligibility
        const attempts = await fsGetRecentAttempts(user.id);
        const counts: Record<string, number> = {};
        attempts.forEach((a: any) => {
          const id = a.testId || a.sourceId;
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
        setAttemptsMap(counts);
      } catch (e) {
        console.error("Failed to load exams", e);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin text-syan-teal mb-4" size={40} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Exam Servers...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <FileText className="text-syan-orange" size={32} /> Professional Mock Exams
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Simulate real-world clinical board examinations.</p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Exams Available</h3>
            <p className="text-slate-500 mt-2">There are currently no mock exams assigned to your program ({user.specialty}).</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => {
              const attemptsTaken = attemptsMap[exam.id] || 0;
              const maxAllowed = exam.maxAttempts || 1;
              const isEligible = attemptsTaken < maxAllowed;

              return (
                <div key={exam.id} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border-2 transition-all group ${isEligible ? 'border-transparent hover:border-syan-orange/50 hover:shadow-syan-hover' : 'border-slate-100 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-syan-orange">
                      <FileText size={24} />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isEligible ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {attemptsTaken} / {maxAllowed} Attempts
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{exam.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 min-h-[40px]">{exam.description || 'Comprehensive clinical assessment.'}</p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Hash size={14} /> {(exam as any).totalQuestions || 0} Questions
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={14} /> {exam.durationMins} Mins
                    </div>
                  </div>

                  <button 
                    disabled={!isEligible}
                    onClick={() => onSelectExam(exam.id)}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isEligible 
                      ? 'bg-slate-900 text-white hover:bg-syan-orange shadow-orange-500/10' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isEligible ? (
                      <>Initialize Exam <ChevronRight size={16} /></>
                    ) : (
                      <>Max Attempts Reached</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
