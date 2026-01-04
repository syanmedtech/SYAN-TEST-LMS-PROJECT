import React, { useState, useEffect } from 'react';
import { X, Users, Target, Clock, Calendar, ChevronRight, User as UserIcon, Loader2, FileText, BarChart2 } from 'lucide-react';
import { fetchAttemptsByTestId, GlobalAttempt } from '../services/attemptsAdminService';

interface Props {
  testId: string;
  testTitle: string;
  onClose: () => void;
}

export const AttemptListModal: React.FC<Props> = ({ testId, testTitle, onClose }) => {
  const [attempts, setAttempts] = useState<GlobalAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttemptsByTestId(testId).then(data => {
      setAttempts(data);
      setLoading(false);
    });
  }, [testId]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Exam Performance</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{testTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 className="animate-spin text-primary-500" size={40} />
              <p className="font-black text-xs uppercase tracking-[0.2em]">Aggregating Student Data...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <BarChart2 size={40} className="opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Attempts Recorded</h3>
              <p className="text-sm max-w-xs mt-1">Once students start solving this exam, their scores and data will appear here.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Accuracy</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                            <UserIcon size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{attempt.userName || 'Anonymous User'}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{attempt.userEmail || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{attempt.score} / {attempt.total}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                           attempt.percentage >= 70 ? 'bg-emerald-50 text-emerald-600' :
                           attempt.percentage >= 40 ? 'bg-amber-50 text-amber-600' :
                           'bg-red-50 text-red-600'
                         }`}>
                           {attempt.percentage}%
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {attempt.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{new Date(attempt.timestamp).toLocaleDateString()}</p>
                           <p className="text-[10px] text-slate-400">{new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert("Detailed student attempt review is part of the Analytics Drilldown update.")}
                          className="p-2 text-slate-300 hover:text-primary-500 transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};