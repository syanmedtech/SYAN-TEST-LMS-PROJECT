import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Timer, Calendar, Search, Loader2, User as UserIcon, ChevronRight, Award } from 'lucide-react';
import { fetchMockLeaderboard, MockLeaderboardEntry } from '../services/leaderboardAdminService';

interface Props {
  testId: string;
  testTitle: string;
  onClose: () => void;
}

export const MockTestLeaderboardModal: React.FC<Props> = ({ testId, testTitle, onClose }) => {
  const [entries, setEntries] = useState<MockLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMockLeaderboard(testId).then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, [testId]);

  const filtered = entries.filter(e => 
    e.userName.toLowerCase().includes(search.toLowerCase()) || 
    e.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-full shadow-sm ring-2 ring-yellow-400/20"><Award size={18} /></div>;
    if (rank === 2) return <div className="p-1.5 bg-slate-100 text-slate-500 rounded-full shadow-sm ring-2 ring-slate-400/20"><Award size={18} /></div>;
    if (rank === 3) return <div className="p-1.5 bg-orange-100 text-orange-600 rounded-full shadow-sm ring-2 ring-orange-400/20"><Award size={18} /></div>;
    return <span className="text-slate-400 font-black text-sm w-8 text-center">{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 rounded-2xl text-white shadow-xl shadow-yellow-500/20 ring-4 ring-yellow-500/10">
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Official Rankings</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">{testTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
             <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="Find student in leaderboard..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500/20 text-sm font-bold"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="animate-spin text-yellow-500" size={48} />
                <p className="font-black text-xs uppercase tracking-widest">Calculating Top Performers...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <Medal size={40} className="opacity-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Leaderboard Unpopulated</h3>
                <p className="text-sm max-w-xs mt-1">Check back later once students complete the official attempt.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-6 pb-2">Rank</th>
                      <th className="px-6 pb-2">Candidate</th>
                      <th className="px-6 pb-2 text-center">Score</th>
                      <th className="px-6 pb-2 text-center">Accuracy</th>
                      <th className="px-6 pb-2">Completion Time</th>
                      <th className="px-6 pb-2">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry, idx) => (
                      <tr key={entry.id} className="group bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:scale-[1.005] hover:shadow-md">
                        <td className="px-6 py-5 rounded-l-2xl">
                          <div className="flex items-center">
                            {getRankBadge(idx + 1)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                              <UserIcon size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{entry.userName}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{entry.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-black text-slate-700 dark:text-slate-300">{entry.score} / {entry.total}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                             entry.percentage >= 70 ? 'bg-emerald-50 text-emerald-600' :
                             entry.percentage >= 40 ? 'bg-amber-50 text-amber-600' :
                             'bg-red-50 text-red-600'
                           }`}>
                             {entry.percentage}%
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Timer size={14} className="text-slate-300" />
                            {formatDuration(entry.durationSeconds)}
                          </div>
                        </td>
                        <td className="px-6 py-5 rounded-r-2xl">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                             <Calendar size={14} className="text-slate-300" />
                             {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
            Speed is the tie-breaker for identical accuracy scores.
          </p>
          <button 
            onClick={onClose}
            className="px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
          >
            Close Rankings
          </button>
        </div>
      </div>
    </div>
  );
};