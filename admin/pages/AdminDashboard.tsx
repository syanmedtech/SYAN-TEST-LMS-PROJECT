
import React, { useEffect, useState } from 'react';
import { Users, FileText, Database, TrendingUp, Plus, Upload, BarChart, Clock, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { fetchGlobalAdminStats, fetchRecentActivity, GlobalAdminStats } from '../services/adminStatsService';

export const AdminDashboard: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<GlobalAdminStats | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [s, a] = await Promise.all([fetchGlobalAdminStats(), fetchRecentActivity()]);
      setStats(s);
      setActivity(a);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform metrics and system health overview.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('ADMIN_EXAMS')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-all"
          >
            <Plus size={18} /> Create Exam
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-500" trend="+12%" />
        <KpiCard title="Active Exams" value={stats?.totalExams || 0} icon={FileText} color="bg-purple-500" trend="+3" />
        <KpiCard title="Questions" value={stats?.totalQuestions || 0} icon={Database} color="bg-amber-500" trend="+150" />
        <KpiCard title="7d Attempts" value={stats?.attempts7d || 0} icon={TrendingUp} color="bg-emerald-500" trend="+42" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-primary-500" /> Recent Activity
            </h3>
            <button className="text-xs font-bold text-primary-600 hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {activity.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">No recent activity detected.</div>
            ) : (
              activity.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title || 'Practice Quiz'}</p>
                      <p className="text-xs text-slate-400">Score: {item.percentage}% • {new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Attempt</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Tools */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Quick Tools</h3>
            <div className="space-y-3 relative z-10">
              <button 
                onClick={() => onNavigate('ADMIN_EXAMS')}
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left text-sm font-bold border border-white/10"
              >
                <Plus size={18} /> Create New Exam
              </button>
              <button 
                onClick={() => onNavigate('ADMIN_PANEL')}
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left text-sm font-bold border border-white/10"
              >
                <Upload size={18} /> Upload Questions
              </button>
              <button 
                onClick={() => onNavigate('ADMIN_ANALYTICS')}
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left text-sm font-bold border border-white/10"
              >
                <BarChart size={18} /> Analytics Center
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-syan">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Firestore Read/Write</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">AI Tutor API</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Storage Usage</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1.2 / 5.0 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
