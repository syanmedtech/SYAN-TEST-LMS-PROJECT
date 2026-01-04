
import React, { useState, useEffect } from 'react';
import { User, Question, Topic } from '../types';
import { 
    Users, BookOpen, Activity, Search, Filter, 
    MoreVertical, Plus, Edit, Trash2, CheckCircle, 
    XCircle, Database, ShieldAlert, Cpu, RefreshCw, AlertTriangle,
    BarChart3, Calendar
} from 'lucide-react';
import { dbGetAllQuestions } from '../services/db';
import { syncAllToFirestore, SyncProgress } from '../services/firestoreSyncService';
import { fetchGlobalStats, GlobalStats } from '../services/statsService';

interface AdminPanelProps {
  user: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Analytics State
  const [statsMode, setStatsMode] = useState<'mock' | 'live'>('mock');
  const [dateRange, setDateRange] = useState<7 | 30>(7);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);

  // Sync State
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ status: 'idle', message: '', percent: 0 });

  useEffect(() => {
    Promise.all([
        dbGetAllQuestions(),
        fetchGlobalStats(statsMode, dateRange)
    ]).then(([qs, stats]) => {
        setQuestions(qs);
        setGlobalStats(stats);
        setLoading(false);
    });
  }, [statsMode, dateRange]);

  const handleSync = async () => {
    if (syncProgress.status === 'syncing') return;
    if (!window.confirm("This will upload all your local subjects, topics, and questions to Firestore. Proceed?")) return;
    
    await syncAllToFirestore((p) => setSyncProgress(p));
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Admin</h1>
                <p className="text-slate-500 dark:text-slate-400">Managing Syan QBank Infrastructure & Content</p>
            </div>
            <div className="flex flex-wrap gap-3">
                {/* Mode Toggle */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm">
                    <button 
                        onClick={() => setStatsMode('mock')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statsMode === 'mock' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                    >
                        Mock
                    </button>
                    <button 
                        onClick={() => setStatsMode('live')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statsMode === 'live' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}
                    >
                        Live
                    </button>
                </div>
                {/* Date Filter */}
                <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(Number(e.target.value) as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                    <Plus size={18} /> Add New Question
                </button>
            </div>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatCard icon={Users} label="Total Students" value={globalStats?.totalUsers.toLocaleString() || "..."} change={statsMode === 'live' ? "Real-time" : "+12%"} color="bg-blue-500" />
            <AdminStatCard icon={BookOpen} label="Total Attempts" value={globalStats?.totalAttempts.toLocaleString() || "..."} change={statsMode === 'live' ? `${dateRange} days` : "+30"} color="bg-purple-500" />
            <AdminStatCard icon={BarChart3} label="Avg Accuracy" value={`${globalStats?.avgScore || 0}%`} change="Across all" color="bg-green-500" />
            <AdminStatCard icon={Cpu} label="AI Generations" value="4,821" change="+540" color="bg-orange-500" />
        </div>

        {/* System Tools Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Cloud Sync Tool */}
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Database className="text-blue-500" size={20} /> Data Migration Tool
                    </h3>
                    {syncProgress.status === 'completed' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Success</span>}
                </div>
                <p className="text-sm text-slate-500 mb-6">Synchronize your local question bank data with the Firebase production database.</p>
                
                <div className="space-y-4">
                    {syncProgress.status !== 'idle' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className={`text-xs font-bold ${syncProgress.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                                    {syncProgress.message}
                                </span>
                                <span className="text-xs font-mono text-slate-400">{syncProgress.percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${syncProgress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${syncProgress.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleSync}
                        disabled={syncProgress.status === 'syncing'}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-sm
                            ${syncProgress.status === 'syncing' 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-500'}
                        `}
                    >
                        <RefreshCw size={18} className={syncProgress.status === 'syncing' ? 'animate-spin' : ''} />
                        {syncProgress.status === 'syncing' ? 'Syncing to Cloud...' : 'Sync to Firestore'}
                    </button>
                    
                    {syncProgress.status === 'error' && (
                        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                            <AlertTriangle size={14} />
                            <span>Cloud sync failed. Check your network or credentials.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Papers Chart Replacer (Minimal) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-purple-500" size={20} /> Top Performing Quizzes
                </h3>
                <div className="space-y-4">
                    {globalStats?.topPapers.map((paper, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{paper.title}</span>
                                <span className="text-slate-500">{paper.count} attempts</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-500 transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (paper.count / (globalStats.topPapers[0]?.count || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {globalStats?.topPapers.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No attempt data available.</p>}
                </div>
            </div>
        </div>

        {/* Question Management Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Question Inventory</h3>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by ID or text..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Filter size={20} /></button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Question ID</th>
                            <th className="px-6 py-4">Preview</th>
                            <th className="px-6 py-4">Topic</th>
                            <th className="px-6 py-4">Difficulty</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading inventory...</td></tr>
                        ) : filteredQuestions.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No questions match your search.</td></tr>
                        ) : (
                            filteredQuestions.map(q => (
                                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{q.id.toUpperCase()}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-xs">{q.text}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-500">{q.topicId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            q.difficulty === 'Hard' ? 'bg-red-100 text-red-600' : 
                                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                                            <CheckCircle size={14} /> Active
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                                            <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs text-slate-400">
                <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded bg-white dark:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border rounded bg-white dark:bg-slate-800">Next</button>
                </div>
            </div>
        </div>

        {/* Security / System Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-red-500" size={20} /> Security Incidents
                </h3>
                <div className="space-y-4">
                    {[
                        { event: 'Suspicious Login Attempt', user: 'user_421', time: '10 mins ago', level: 'Medium' },
                        { event: 'Database Backup Completed', user: 'System', time: '2 hours ago', level: 'Low' },
                        { event: 'New Admin Assigned', user: 'admin_root', time: '1 day ago', level: 'High' }
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${log.level === 'High' ? 'bg-red-500' : log.level === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{log.event}</h4>
                                    <p className="text-[10px] text-slate-400">By: {log.user} • {log.time}</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Details</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

const AdminStatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-200 dark:border-slate-800 group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-white`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {change}
            </span>
        </div>
        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
);

const TrendingUp = ({ size, className }: any) => (
    <Activity size={size} className={className} />
);
