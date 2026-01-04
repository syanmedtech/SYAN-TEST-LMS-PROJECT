import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, Filter, Clock, User as UserIcon, 
  ChevronRight, AlertCircle, FileText, ShieldCheck, 
  Activity, ArrowLeft, MousePointer, Copy, Maximize, 
  Ban, Camera, Wifi, History, AlertTriangle, CheckCircle, Layers
} from 'lucide-react';
import { fetchIntegrityAttempts, fetchProctoringTimeline, IntegrityAttempt, ProctoringEvent } from '../services/integrityAdminService';
import { getAdminExams, AdminPaper } from '../services/examAdminService';

export const IntegrityCenter: React.FC = () => {
  const [attempts, setAttempts] = useState<IntegrityAttempt[]>([]);
  const [exams, setExams] = useState<AdminPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<IntegrityAttempt | null>(null);
  const [timeline, setTimeline] = useState<ProctoringEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    examId: 'all',
    flaggedOnly: true,
    days: 7
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [attemptData, examData] = await Promise.all([
        fetchIntegrityAttempts({ 
          flaggedOnly: filters.flaggedOnly,
          days: filters.days
        }),
        getAdminExams()
      ]);
      setAttempts(attemptData);
      setExams(examData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.flaggedOnly, filters.days]);

  const handleSelectAttempt = async (attempt: IntegrityAttempt) => {
    setSelectedAttempt(attempt);
    setLoadingTimeline(true);
    try {
      const events = await fetchProctoringTimeline(attempt.userId, attempt.id);
      setTimeline(events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const filtered = attempts.filter(a => {
    const matchesSearch = !filters.search || 
      (a.userName?.toLowerCase().includes(filters.search.toLowerCase()) || 
       a.userEmail?.toLowerCase().includes(filters.search.toLowerCase()) ||
       a.userId.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesExam = filters.examId === 'all' || (a as any).testId === filters.examId;
    
    return matchesSearch && matchesExam;
  });

  if (selectedAttempt) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <button 
          onClick={() => setSelectedAttempt(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Audit Log
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attempt Overview Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-syan border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{selectedAttempt.userName || 'Student'}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedAttempt.userEmail || selectedAttempt.userId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Exam Title</span>
                  <span className="text-slate-800 dark:text-white">{selectedAttempt.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Score</span>
                  <span className="text-slate-800 dark:text-white">{selectedAttempt.score} / {selectedAttempt.total} ({selectedAttempt.percentage}%)</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Date</span>
                  <span className="text-slate-800 dark:text-white">{new Date(selectedAttempt.startTime).toLocaleDateString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                   <div className={`p-4 rounded-2xl flex items-center gap-3 ${selectedAttempt.integrityFlagged ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {selectedAttempt.integrityFlagged ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest">{selectedAttempt.integrityFlagged ? 'Flagged for Review' : 'Passed Integrity Check'}</p>
                        <p className="text-[10px] opacity-80">{selectedAttempt.integrityScore} total detected violations</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Violation Counts */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-syan border border-slate-100 dark:border-slate-800">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Violation Breakdown</h4>
               <div className="space-y-3">
                  {Object.entries(selectedAttempt.integritySummary?.counts || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">{type.replace(/_/g, ' ').toLowerCase()}</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{count}</span>
                    </div>
                  ))}
                  {(!selectedAttempt.integritySummary?.counts || Object.keys(selectedAttempt.integritySummary.counts).length === 0) && (
                    <p className="text-xs text-slate-400 italic">No specific violations logged.</p>
                  )}
               </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col h-[700px]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
               <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                 <History className="text-primary-600" size={24} /> Session Timeline
               </h3>
               {loadingTimeline && <Loader2 className="animate-spin text-primary-500" size={20} />}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {timeline.length === 0 && !loadingTimeline ? (
                <div className="py-20 text-center text-slate-400 italic">No detailed event logs available for this attempt.</div>
              ) : (
                timeline.map((event, idx) => (
                  <div key={event.id} className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 last:border-transparent">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                       <div className={`w-1.5 h-1.5 rounded-full ${event.type.includes('START') ? 'bg-emerald-500' : event.type.includes('END') ? 'bg-slate-400' : 'bg-red-500'}`} />
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl group transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <EventIcon type={event.type} />
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize">{event.type.replace(/_/g, ' ').toLowerCase()}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(event.clientTimestamp).toLocaleTimeString()}</span>
                      </div>
                      
                      {event.meta && Object.keys(event.meta).length > 0 && (
                        <div className="mt-3 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400">
                          {event.type === 'USER_SCREENSHOT' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-indigo-500 font-bold mb-1">
                                <Camera size={14} /> Evidence Snapshot
                              </div>
                              <p><strong>Question:</strong> {event.meta.questionText}</p>
                              <p><strong>Selection:</strong> {event.meta.selectedOption?.toUpperCase()}</p>
                              {event.meta.storagePath && (
                                <button className="mt-2 text-primary-600 font-bold underline">View Captured Image</button>
                              )}
                            </div>
                          ) : (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(event.meta, null, 2)}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Integrity Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit security logs and analyze proctored exam sessions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by student name or email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm outline-none transition-all"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => setFilters({...filters, flaggedOnly: false})}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!filters.flaggedOnly ? 'bg-white dark:bg-slate-700 text-slate-900 shadow-sm' : 'text-slate-400'}`}
               >
                 All Sessions
               </button>
               <button 
                onClick={() => setFilters({...filters, flaggedOnly: true})}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filters.flaggedOnly ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400'}`}
               >
                 Flagged Only
               </button>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
             <Filter size={14} className="text-slate-400" />
             <select 
               value={filters.examId}
               onChange={e => setFilters({...filters, examId: e.target.value})}
               className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none pr-4"
             >
               <option value="all">All Exams</option>
               {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
             </select>
           </div>

           <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
             <Clock size={14} className="text-slate-400" />
             <select 
               value={filters.days}
               onChange={e => setFilters({...filters, days: parseInt(e.target.value)})}
               className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none pr-4"
             >
               <option value={1}>Last 24 Hours</option>
               <option value={7}>Last 7 Days</option>
               <option value={30}>Last 30 Days</option>
               <option value={90}>Last 90 Days</option>
               <option value={0}>All Time</option>
             </select>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">Candidate</th>
                <th className="px-8 py-5">Exam Details</th>
                <th className="px-8 py-5">Performance</th>
                <th className="px-8 py-5 text-center">Integrity Score</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center animate-pulse font-black text-slate-300 tracking-widest uppercase">Syncing Security Data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-400 italic">No attempts found for the selected criteria.</td></tr>
              ) : (
                filtered.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{attempt.userName || 'Anonymous'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{attempt.userEmail || attempt.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{attempt.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        <Clock size={10} /> {new Date(attempt.startTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-800 dark:text-white">{attempt.percentage}%</span>
                         <span className="text-[10px] text-slate-400 font-bold">{attempt.score}/{attempt.total} Correct</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                         attempt.integrityFlagged ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                       }`}>
                         {attempt.integrityFlagged ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                         {attempt.integrityScore} Violations
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button 
                        onClick={() => handleSelectAttempt(attempt)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-primary-600 transition-all group-hover:scale-110"
                       >
                         <ChevronRight size={20} />
                       </button>
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

const EventIcon = ({ type }: { type: string }) => {
  if (type.includes('TAB')) return <Layers size={14} className="text-amber-500" />;
  if (type.includes('BLUR')) return <Ban size={14} className="text-orange-500" />;
  if (type.includes('FULLSCREEN')) return <Maximize size={14} className="text-red-500" />;
  if (type.includes('COPY') || type.includes('PASTE')) return <Copy size={14} className="text-indigo-500" />;
  if (type.includes('RIGHT_CLICK')) return <MousePointer size={14} className="text-slate-500" />;
  if (type.includes('SCREENSHOT')) return <Camera size={14} className="text-pink-500" />;
  if (type.includes('NETWORK')) return <Wifi size={14} className="text-blue-500" />;
  if (type.includes('START')) return <Activity size={14} className="text-emerald-500" />;
  return <AlertCircle size={14} className="text-slate-400" />;
};

/* Added size prop to Loader2 component and used it in the SVG */
const Loader2 = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);