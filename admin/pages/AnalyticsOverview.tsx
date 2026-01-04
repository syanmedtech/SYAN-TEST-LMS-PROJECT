
import React, { useState, useEffect } from 'react';
import { Activity, Users, Target, BarChart3, TrendingUp, ChevronRight, Clock, Star, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AnalyticsKpi } from '../components/AnalyticsKpi';
import { AttemptsTrendChart, ScoreTrendChart, TopExamsChart } from '../components/AnalyticsCharts';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { fetchAnalyticsOverview, fetchDetailedAnalytics, AnalyticsSummary, DetailedAnalytics } from '../services/analyticsService';

export const AnalyticsOverview: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAnalyticsOverview(days),
      fetchDetailedAnalytics(days)
    ]).then(([res, detailed]) => {
      setData(res);
      setDetailedData(detailed);
      setLoading(false);
    });
  }, [days]);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Aggregating Behavioral Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytics Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform performance metrics and student behavior patterns.</p>
        </div>
        <DateRangeFilter value={days} onChange={setDays} />
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsKpi label="Total Attempts" value={data?.totalAttempts || 0} icon={Activity} color="bg-primary-500" description={`Past ${days} days`} />
        <AnalyticsKpi label="Avg. Score" value={`${data?.avgScore || 0}%`} icon={Target} color="bg-pink-500" description="Across all students" />
        <AnalyticsKpi label="Avg. Time / MCQ" value={`${detailedData?.avgTimePerQuestion || 0}s`} icon={Clock} color="bg-amber-500" description="Session median" />
        <AnalyticsKpi label="Confidence Index" value={`${detailedData?.avgConfidence || 0}/5`} icon={Star} color="bg-emerald-500" description="Self-reported" />
      </div>

      {!data || data.totalAttempts === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
          <BarChart3 size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">No analytics data yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Data will appear here once students start attempting quizzes and mock exams.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                <TrendingUp className="text-primary-500" size={20} /> Attempt Volume Distribution
              </h3>
              <AttemptsTrendChart data={data.dailyAttempts} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                <Target className="text-pink-500" size={20} /> Correctness vs Timeline
              </h3>
              <ScoreTrendChart data={data.dailyAttempts} />
            </div>
          </div>

          {/* Detailed Behavioral Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Exams List */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity className="text-teal-500" size={20} /> Engagement Leaderboard</span>
              </h3>
              <TopExamsChart data={data.topExams} />
              <button 
                onClick={() => onNavigate('ADMIN_ANALYTICS_EXAMS')}
                className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
              >
                View Full Table <ChevronRight size={14} />
              </button>
            </div>

            {/* Slowest Topics - Time Bottlenecks */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="text-amber-500" size={20} /> Difficulty Bottlenecks
              </h3>
              <div className="space-y-4">
                {detailedData?.slowestTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{topic.id}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Slowest Category</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-amber-600">{topic.avgTime}s</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Avg / Question</p>
                    </div>
                  </div>
                ))}
                {detailedData?.slowestTopics.length === 0 && <p className="text-center text-slate-400 py-10 text-xs italic">No topic data available</p>}
              </div>
            </div>

            {/* Lowest Accuracy Topics */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Weak Performance Areas
              </h3>
              <div className="space-y-4">
                {detailedData?.lowestAccuracyTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/30">
                    <div>
                      <p className="text-xs font-black text-red-800 dark:text-red-400 truncate max-w-[150px]">{topic.id}</p>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight">{topic.total} Attempts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-600">{topic.accuracy}%</p>
                      <p className="text-[9px] text-red-400 font-bold uppercase">Accuracy</p>
                    </div>
                  </div>
                ))}
                {detailedData?.lowestAccuracyTopics.length === 0 && <p className="text-center text-slate-400 py-10 text-xs italic">No performance gaps identified</p>}
              </div>
            </div>
          </div>

          {/* Behavioral Correlation Summary */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                  <ShieldAlert className="text-yellow-400" /> Behavioral Sync
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Analyzing the relationship between <strong>Time spent</strong> and <strong>Correctness</strong> helps identify whether students are guessing or struggling with complex reasoning.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time (Correct)</p>
                      <p className="text-xl font-black text-emerald-400">{detailedData?.timeVsCorrectness.correct}s</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time (Incorrect)</p>
                      <p className="text-xl font-black text-red-400">{detailedData?.timeVsCorrectness.incorrect}s</p>
                   </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
                  <Star className="text-primary-400" /> Meta-Cognition
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The gap between <strong>Reported Confidence</strong> and <strong>Actual Correctness</strong> indicates "Overconfidence Bias" or "Imposter Syndrome" among student cohorts.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Conf. (Correct)</p>
                      <p className="text-xl font-black text-emerald-400">{detailedData?.confidenceVsCorrectness.correct}/5</p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Conf. (Incorrect)</p>
                      <p className="text-xl font-black text-red-400">{detailedData?.confidenceVsCorrectness.incorrect}/5</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
