
import React, { useState, useEffect, useMemo } from 'react';
import { User, QuizHistoryItem, UserStatistics, VideoProgress, Course } from '../types';
import { getCourses } from '../services/mockService';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  BarChart2, Target, Clock, Zap, TrendingUp, AlertCircle, PlayCircle, 
  ChevronRight, BrainCircuit, Activity, Hourglass, BookOpen, CheckCircle, Video, Eye, X, CheckSquare, Square
} from 'lucide-react';

interface StatisticsModuleProps {
  user: User;
  history: QuizHistoryItem[];
  videoHistory: VideoProgress[];
  onNavigate: (view: any) => void;
  onRevisionRequest?: (topicNames: string[]) => void;
}

type Tab = 'OVERVIEW' | 'QUIZ' | 'VIDEO' | 'TIME';

export const StatisticsModule: React.FC<StatisticsModuleProps> = ({ user, history, videoHistory, onNavigate, onRevisionRequest }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCourses().then((data) => {
        setCourses(data);
        setIsLoading(false);
    });
  }, []);

  // --- DYNAMIC CALCULATIONS ---
  const stats = useMemo(() => {
    // 1. General Stats
    const totalQuestions = history.reduce((acc, curr) => acc + curr.total, 0);
    const totalCorrect = history.reduce((acc, curr) => acc + curr.score, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // 2. Time Management Stats (Simulation)
    const quizTimeSeconds = totalQuestions * 60; 
    const videoTimeSeconds = videoHistory.reduce((acc, curr) => {
        if (curr.completed) return acc + 900;
        return acc + (curr.timestamp || 300);
    }, 0);
    const totalStudyTimeSeconds = quizTimeSeconds + videoTimeSeconds;

    // Daily breakdown (Last 7 days)
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6-i));
        return d.toISOString().split('T')[0];
    });

    const timeDistribution = last7Days.map(date => {
        const dayQuizzes = history.filter(h => new Date(h.date).toISOString().split('T')[0] === date);
        const dayVideos = videoHistory.filter(v => new Date(v.lastWatchedAt).toISOString().split('T')[0] === date);
        
        const qTime = dayQuizzes.reduce((acc, q) => acc + (q.total * 60), 0) / 3600; // Hours
        const vTime = dayVideos.reduce((acc, v) => acc + (v.completed ? 900 : 300), 0) / 3600; // Hours
        
        return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            quizHours: parseFloat(qTime.toFixed(1)),
            videoHours: parseFloat(vTime.toFixed(1)),
            total: parseFloat((qTime + vTime).toFixed(1))
        };
    });

    // 3. Quiz Analytics (Categorization)
    const categoryStats: Record<string, { correct: number, total: number }> = {};
    history.forEach(h => {
        const category = h.title.split(' ')[0] || 'General';
        if (!categoryStats[category]) categoryStats[category] = { correct: 0, total: 0 };
        categoryStats[category].correct += h.score;
        categoryStats[category].total += h.total;
    });

    const categoryPerformance = Object.keys(categoryStats).map(cat => ({
        category: cat,
        percentage: Math.round((categoryStats[cat].correct / categoryStats[cat].total) * 100),
        incorrectCount: categoryStats[cat].total - categoryStats[cat].correct,
        totalAttempts: categoryStats[cat].total
    })).sort((a, b) => b.percentage - a.percentage);

    const weakAreas = categoryPerformance.filter(c => c.percentage < 60).map(c => c.category);
    const strongAreas = categoryPerformance.filter(c => c.percentage >= 80).map(c => c.category);

    // 4. Video Engagement
    const totalVideosStarted = videoHistory.length;
    const totalVideosCompleted = videoHistory.filter(v => v.completed).length;
    const completionRate = totalVideosStarted > 0 ? Math.round((totalVideosCompleted / totalVideosStarted) * 100) : 0;
    
    // Group by Course
    const courseEngagement: Record<string, number> = {};
    videoHistory.forEach(v => {
        const courseName = courses.find(c => c.id === v.courseId)?.title || 'Unknown Course';
        courseEngagement[courseName] = (courseEngagement[courseName] || 0) + 1;
    });
    const popularCourses = Object.keys(courseEngagement).map(k => ({ name: k, views: courseEngagement[k] })).sort((a, b) => b.views - a.views);


    return {
        totalQuestions,
        accuracy: overallAccuracy,
        totalTimeSeconds: totalStudyTimeSeconds,
        averageSpeedSeconds: totalQuestions > 0 ? Math.round(quizTimeSeconds / totalQuestions) : 0,
        timeDistribution,
        categoryPerformance,
        weakAreas,
        strongAreas,
        videoStats: {
            started: totalVideosStarted,
            completed: totalVideosCompleted,
            rate: completionRate,
            popularCourses
        },
        monthlyProgress: [ 
            { month: 'Jan', score: 45 }, { month: 'Feb', score: 52 }, { month: 'Mar', score: 68 }
        ]
    };
  }, [history, videoHistory, courses]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-syan-teal border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Analyzing your performance...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scroll-smooth p-4 md:p-8">
    <div className="max-w-7xl mx-auto pb-20">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
             <BarChart2 className="text-syan-pink" size={32} /> Performance Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Real-time insights on your study habits and outcomes.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 inline-flex shadow-sm">
           {[
             { id: 'OVERVIEW', label: 'Overview' },
             { id: 'QUIZ', label: 'Quiz Perf.' },
             { id: 'VIDEO', label: 'Lecture Stats' },
             { id: 'TIME', label: 'Time Mgmt' }
           ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && <OverviewTab stats={stats} />}
      {activeTab === 'QUIZ' && <QuizAnalyticsTab stats={stats} onRevisionRequest={onRevisionRequest} />}
      {activeTab === 'VIDEO' && <VideoAnalyticsTab stats={stats} />}
      {activeTab === 'TIME' && <TimeAnalyticsTab stats={stats} />}
      
    </div>
    </div>
  );
};

/* --- TAB COMPONENTS --- */

const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => {
  // ... (No Changes to OverviewTab content) ...
  return (
    <div className="space-y-8 animate-fade-in">
       {/* Summary Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            title="Total Questions" 
            value={stats.totalQuestions} 
            subtitle="Attempted" 
            icon={BrainCircuit} 
            color="bg-syan-teal" 
          />
          <StatCard 
            title="Accuracy" 
            value={`${stats.accuracy}%`} 
            subtitle="Overall Score" 
            icon={Target} 
            color="bg-syan-green" 
          />
          <StatCard 
            title="Study Time" 
            value={`${(stats.totalTimeSeconds / 3600).toFixed(1)}h`} 
            subtitle="Total Hours" 
            icon={Clock} 
            color="bg-syan-orange" 
          />
          <StatCard 
            title="Video Completion" 
            value={`${stats.videoStats.rate}%`} 
            subtitle={`${stats.videoStats.completed}/${stats.videoStats.started} Watched`} 
            icon={PlayCircle} 
            color="bg-syan-pink" 
          />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Progress Graph */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700 min-w-0">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                   <TrendingUp className="text-syan-teal" /> Study Activity (Last 7 Days)
                </h3>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats.timeDistribution}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#49A7C3" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#49A7C3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="total" name="Hours" stroke="#49A7C3" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Quick Insights */}
          <div className="space-y-6 min-w-0">
             <div className="bg-gradient-to-br from-syan-darkteal to-teal-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-1">
                      <Activity className="text-teal-200" />
                      <span className="font-bold text-teal-100 uppercase tracking-wide text-xs">Strongest Subject</span>
                   </div>
                   <div className="text-3xl font-black mb-2">{stats.strongAreas[0] || 'N/A'}</div>
                   <p className="text-sm opacity-90">You have a high accuracy rate in this area. Keep it up!</p>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700 flex-grow">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Focus Required</h3>
                <div className="space-y-3">
                   {stats.weakAreas.length > 0 ? stats.weakAreas.slice(0, 3).map((area: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                         <span className="font-bold text-red-700 dark:text-red-300 text-sm">{area}</span>
                         <AlertCircle size={16} className="text-red-400" />
                      </div>
                   )) : <p className="text-slate-400 text-sm">No weak areas identified yet. Great job!</p>}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const VideoAnalyticsTab: React.FC<{ stats: any }> = ({ stats }) => {
    // ... (No Changes) ...
    return (
        <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-syan border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Video size={32} />
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-800 dark:text-white">{stats.videoStats.started}</div>
                        <div className="text-sm text-slate-500 font-bold uppercase">Lectures Started</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-syan border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-800 dark:text-white">{stats.videoStats.rate}%</div>
                        <div className="text-sm text-slate-500 font-bold uppercase">Completion Rate</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-syan border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Eye size={32} />
                    </div>
                    <div>
                        <div className="text-3xl font-black text-slate-800 dark:text-white">{stats.videoStats.popularCourses[0]?.name || 'N/A'}</div>
                        <div className="text-sm text-slate-500 font-bold uppercase">Top Topic</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-syan border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Topic Engagement Breakdown</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.videoStats.popularCourses} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12, fontWeight: 600}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                            <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} barSize={30} fill="#8884d8">
                                {stats.videoStats.popularCourses.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#49A7C3' : '#94A3B8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const TimeAnalyticsTab: React.FC<{ stats: any }> = ({ stats }) => {
     // ... (No Changes) ...
     const avgDaily = (stats.timeDistribution.reduce((a: number, b: any) => a + b.total, 0) / 7).toFixed(1);
     
     return (
        <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hours Tracker */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="text-syan-orange" /> Study Hours Tracker
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={stats.timeDistribution}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                              <Tooltip contentStyle={{ borderRadius: '12px' }} />
                              <Legend />
                              <Line type="monotone" dataKey="quizHours" name="Quiz Time" stroke="#EF5D66" strokeWidth={3} dot={{r:4}} />
                              <Line type="monotone" dataKey="videoHours" name="Lecture Time" stroke="#F49E4C" strokeWidth={3} dot={{r:4}} />
                           </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Adaptive Schedule / Breaks */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-indigo-200 uppercase tracking-wide text-sm mb-2">Adaptive Recommendation</h3>
                            <div className="flex items-end gap-4 mb-4">
                                <div className="text-5xl font-black">{avgDaily}h</div>
                                <div className="text-lg font-medium opacity-80 mb-2">Avg Daily Study</div>
                            </div>
                            <p className="text-sm opacity-90 leading-relaxed">
                                Based on your performance, you study best in <strong>45-minute intervals</strong>. 
                                We recommend a <strong>10-minute break</strong> after every quiz session to maintain high retention.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Hourglass className="text-syan-teal" /> Optimal Break Ratio
                        </h3>
                        <div className="flex items-center gap-1 h-12 w-full rounded-xl overflow-hidden mb-2">
                            <div className="bg-syan-teal h-full flex items-center justify-center text-white font-bold text-xs" style={{width: '80%'}}>Study (50m)</div>
                            <div className="bg-slate-300 h-full flex items-center justify-center text-slate-600 font-bold text-xs" style={{width: '20%'}}>Break (10m)</div>
                        </div>
                        <p className="text-xs text-slate-500 text-center">Recommended 50/10 Cycle for Maximum Focus</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuizAnalyticsTab: React.FC<{ stats: any, onRevisionRequest?: (topics: string[]) => void }> = ({ stats, onRevisionRequest }) => {
   const [showRevisionModal, setShowRevisionModal] = useState(false);
   const [selectedForRevision, setSelectedForRevision] = useState<Set<string>>(new Set());

   // Prepare Revision Data: Sorted by Incorrect Answers DESC
   const revisionTopics = useMemo(() => {
       return [...stats.categoryPerformance].sort((a, b) => b.incorrectCount - a.incorrectCount);
   }, [stats.categoryPerformance]);

   const handleToggleRevision = (category: string) => {
       const newSet = new Set(selectedForRevision);
       if (newSet.has(category)) newSet.delete(category);
       else newSet.add(category);
       setSelectedForRevision(newSet);
   };

   const startRevision = () => {
       if (onRevisionRequest) {
           onRevisionRequest(Array.from(selectedForRevision));
           setShowRevisionModal(false);
       }
   };

   return (
     <div className="space-y-8 animate-slide-up">
        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Subject Performance</h3>
              <div className="h-80 w-full overflow-y-auto pr-2 custom-scrollbar">
                  {stats.categoryPerformance.length > 0 ? (
                      <div className="space-y-4">
                          {stats.categoryPerformance.map((item: any) => (
                              <div key={item.category}>
                                  <div className="flex justify-between text-sm font-bold mb-1">
                                      <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                                      <span className={`${item.percentage >= 80 ? 'text-green-600' : item.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                          {item.percentage}%
                                      </span>
                                  </div>
                                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${item.percentage >= 80 ? 'bg-green-500' : item.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                        style={{ width: `${item.percentage}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">No quiz data available yet.</div>
                  )}
              </div>
           </div>

           <div className="space-y-6">
               {/* Focus Areas */}
               <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                   <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                       <Target className="text-red-500" /> Suggested Revision
                   </h3>
                   <div className="flex-grow space-y-2 mb-4">
                       <p className="text-xs text-slate-500 mb-3">Based on low accuracy in recent tests:</p>
                       {stats.weakAreas.length > 0 ? stats.weakAreas.slice(0, 4).map((area: string) => (
                           <div key={area} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                               <ChevronRight size={14} className="text-red-400" /> {area}
                           </div>
                       )) : <p className="text-sm text-slate-400">No critical weak areas detected.</p>}
                   </div>
                   <button 
                        onClick={() => setShowRevisionModal(true)}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-syan-orange dark:hover:bg-syan-teal transition-colors shadow-lg"
                   >
                       Create Revision Quiz
                   </button>
               </div>
           </div>
        </div>

        {/* REVISION MODAL */}
        {showRevisionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] animate-slide-up">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Revision Quiz</h3>
                            <p className="text-xs text-slate-500">Select topics you've struggled with recently.</p>
                        </div>
                        <button onClick={() => setShowRevisionModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {revisionTopics.map((topic: any) => {
                            const isSelected = selectedForRevision.has(topic.category);
                            return (
                                <div 
                                    key={topic.category}
                                    onClick={() => handleToggleRevision(topic.category)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                                        isSelected 
                                        ? 'border-syan-teal bg-teal-50 dark:bg-teal-900/20' 
                                        : 'border-slate-100 dark:border-slate-700 hover:border-syan-teal/40'
                                    }`}
                                >
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white">{topic.category}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="text-red-500 font-bold">{topic.incorrectCount} Incorrect</span>
                                            <span className="text-slate-400">|</span>
                                            <span className="text-slate-500">{topic.totalAttempts} Attempts</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className={`block font-bold text-sm ${topic.percentage < 60 ? 'text-red-500' : 'text-amber-500'}`}>
                                                {topic.percentage}%
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase">Accuracy</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-syan-teal text-white' : 'bg-slate-200 text-transparent'}`}>
                                            <CheckCircle size={14} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                        <div className="text-sm font-medium text-slate-500">
                            {selectedForRevision.size} topics selected
                        </div>
                        <button 
                            onClick={startRevision}
                            disabled={selectedForRevision.size === 0}
                            className="bg-syan-teal text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-syan-darkteal disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            Start Practice <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}
     </div>
   );
};

// Helper Component for Stat Cards
const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-syan border border-slate-200 dark:border-slate-700 flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300 min-w-0">
     <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{value}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
     </div>
     <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
     </div>
  </div>
);
