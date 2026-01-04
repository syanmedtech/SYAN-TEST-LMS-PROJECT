
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, ChevronRight, PlayCircle, Clock, Target } from 'lucide-react';
import { fetchExamsPerformance, ExamMetric } from '../services/analyticsService';

export const ExamAnalyticsList: React.FC<{ onBack: () => void; onDetail: (id: string) => void }> = ({ onBack, onDetail }) => {
  const [metrics, setMetrics] = useState<ExamMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExamsPerformance(90).then(res => {
      setMetrics(res);
      setLoading(false);
    });
  }, []);

  const filtered = metrics.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Exam Performance</h1>
          <p className="text-sm text-slate-500 uppercase font-black tracking-widest">Drill-down Analysis</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Filter by exam name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
            <Filter size={16} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Exam Module</th>
                <th className="px-6 py-4 text-center">Attempts</th>
                <th className="px-6 py-4 text-center">Avg. Score</th>
                <th className="px-6 py-4 text-center">Pass Rate</th>
                <th className="px-6 py-4 text-center">Med. Time</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400">Loading performance data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400">No records found.</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer" onClick={() => onDetail(m.id)}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-white">{m.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold px-2 py-1 rounded text-xs">{m.attempts}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Target size={14} className="text-pink-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{m.avgScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-full max-w-[80px] mx-auto bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-emerald-500 h-full" style={{ width: `${m.passRate}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{m.passRate}% Pass</span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                      {m.medianTimeMinutes}m
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="inline-block text-slate-300" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
