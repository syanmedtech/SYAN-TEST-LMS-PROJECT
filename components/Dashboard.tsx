
import React, { useState, useEffect } from 'react';
import { User, Subscription, QuizHistoryItem, Notification, VideoProgress, Course } from '../types';
import { 
  Crown, Calendar as CalendarIcon, 
  CheckCircle2, Bell, PlayCircle, Play, Search, Clock, RotateCcw, FileText, X, List, Eye,
  AlertTriangle, Zap, Target, BrainCircuit, ChevronRight
} from 'lucide-react';
import { DashboardWidgets } from './DashboardWidgets';
import { getCourses } from '../services/mockService';
import { getRecentBehavioralData } from '../services/db/analytics';
import { computeWeakSubtopics, SubtopicStats } from '../shared/services/weakTopicScoring';

interface DashboardProps {
  user: User;
  history: QuizHistoryItem[];
  videoHistory: VideoProgress[];
  subscription: Subscription;
  onResume: () => void;
  onNavigate: (view: any) => void;
  onReattemptQuiz: (item: QuizHistoryItem) => void;
  onStartPractice: (topicIds: string[], title: string) => void;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', title: 'Exam Reminder', message: 'Your Pathology Mock Exam starts in 1 hour.', date: Date.now(), read: false, type: 'warning' },
    { id: '2', title: 'New Course Added', message: 'Check out the new NRE Cardiology module.', date: Date.now() - 86400000, read: false, type: 'info' },
    { id: '3', title: 'Subscription Renewed', message: 'Your Pro plan has been auto-renewed successfully.', date: Date.now() - 172800000, read: true, type: 'success' }
];

export const Dashboard: React.FC<DashboardProps> = ({ user, history, videoHistory, subscription, onResume, onNavigate, onReattemptQuiz, onStartPractice }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [weakTopics, setWeakTopics] = useState<SubtopicStats[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyType, setHistoryType] = useState<'QUIZ' | 'VIDEO'>('QUIZ');
  
  const completed = history.filter(h => h.percentage >= 50).length;
  const totalAttempts = history.length;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
      getCourses().then(setCourses);
      
      // Load Recommendation Data
      getRecentBehavioralData(user.id).then(({ details, questions }) => {
        const weak = computeWeakSubtopics(details, questions);
        setWeakTopics(weak);
        setLoadingAnalytics(false);
      });
  }, [user.id]);

  const markAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getContinueWatchingItem = (progress: VideoProgress) => {
      const course = courses.find(c => c.id === progress.courseId);
      if (!course) return null;

      let video;
      for (const chapter of course.chapters) {
          video = chapter.topics.find(v => v.id === progress.videoId);
          if (video) break;
      }
      
      if (!video) return null;
      return { course, video, progress };
  };

  const formatScore = (score: number) => {
      return Number.isInteger(score) ? score : score.toFixed(2);
  };

  const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);

  const recentQuizzes = history
    .filter(h => h.date >= fifteenDaysAgo)
    .sort((a, b) => b.date - a.date);

  const recentVideos = videoHistory
    .filter(vp => vp.lastWatchedAt >= fifteenDaysAgo)
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
    .map(vp => {
       const details = getContinueWatchingItem(vp);
       return details ? { ...details, date: vp.lastWatchedAt } : null;
    })
    .filter(item => item !== null) as { course: Course, video: any, progress: VideoProgress, date: number }[];


  const openHistoryModal = (type: 'QUIZ' | 'VIDEO') => {
      setHistoryType(type);
      setShowHistoryModal(true);
  };

  return (
    <div className="h-full overflow-y-auto scroll-smooth">
      <div className="max-w-[1600px] mx-auto relative p-4 md:p-8 md:pt-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, Dr. {user.name.split(' ')[0]}</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:w-80 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400 group-focus-within:text-syan-teal transition-colors" />
                  </div>
                  <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-syan-teal/20 focus:border-syan-teal transition-all shadow-sm"
                      placeholder="Search quizzes, topics, or videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-syan-teal hover:border-syan-teal/30 transition-all relative shadow-sm"
                  >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-syan-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-800">
                              {unreadCount}
                          </span>
                      )}
                  </button>

                  {showNotifications && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-syan-teal hover:text-syan-darkteal font-semibold">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-sm">No new notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 ${n.read ? 'opacity-70' : 'bg-syan-teal/5 dark:bg-syan-teal/10'}`}>
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-syan-teal'}`}></div>
                                            <div>
                                                <h4 className={`text-sm font-semibold text-slate-800 dark:text-slate-200 ${!n.read ? 'font-bold' : ''}`}>{n.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{new Date(n.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                      </>
                  )}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        
        <div className="xl:col-span-8 space-y-8">
          
          {/* Banner */}
          <div className="w-full h-48 md:h-40 bg-gradient-to-r from-syan-darkteal via-syan-teal to-blue-500 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between p-8 relative overflow-hidden group cursor-pointer animate-fade-in">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             <div className="relative z-10 text-white mb-4 md:mb-0">
                <span className="bg-white/20 backdrop-blur-sm text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">New Feature</span>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">AI Tutor 2.0 is Live</h3>
                <p className="text-white/90 text-sm md:text-base max-w-md">Get instant, detailed explanations for every mock exam question.</p>
             </div>
             <div className="relative z-10 bg-white text-syan-darkteal px-6 py-2.5 rounded-xl font-bold shadow-md transform group-hover:scale-105 transition-transform text-sm w-full md:w-auto text-center">
               Try Now
             </div>
          </div>

          {/* RECOMMENDATIONS: WEAK TOPICS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-syan border border-slate-100 dark:border-slate-800 animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Target className="text-red-500" size={24} /> Personalized Insights
                    </h3>
                    <p className="text-sm text-slate-400 font-medium mt-1">Syan Analytics identified these high-impact focus areas for you.</p>
                  </div>
                  {!loadingAnalytics && weakTopics.length > 0 && (
                      <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">Action Required</span>
                  )}
              </div>

              {loadingAnalytics ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                      <Zap size={32} className="animate-bounce" />
                      <p className="font-bold text-xs uppercase tracking-widest">Scanning Behavioral Patterns...</p>
                  </div>
              ) : weakTopics.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <BrainCircuit size={48} className="mx-auto text-slate-200 mb-4" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-200">No Data Points Detected</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Complete more practice quizzes to unlock personalized topic recommendations.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {weakTopics.map((topic, idx) => (
                          <div key={idx} className="group p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">High Impact Area</span>
                                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{topic.subtopicName}</h4>
                                  <div className="grid grid-cols-3 gap-6 mt-4">
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase">Accuracy</p>
                                          <p className={`text-sm font-black ${topic.accuracy < 50 ? 'text-red-500' : 'text-amber-500'}`}>{topic.accuracy}%</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase">Avg Speed</p>
                                          <p className="text-sm font-black text-slate-700 dark:text-slate-300">{topic.avgTimeSeconds}s</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase">Low Conf.</p>
                                          <p className="text-sm font-black text-slate-700 dark:text-slate-300">{topic.lowConfidenceRate}%</p>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                  <button 
                                      onClick={() => onStartPractice([topic.subtopicId], `Fixing: ${topic.subtopicName}`)}
                                      className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                                  >
                                      Practice <Play size={12} fill="currentColor" />
                                  </button>
                                  <button 
                                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                                      onClick={() => alert("Loading Spaced Repetition for this subtopic...")}
                                  >
                                      Flashcards <Zap size={12} fill="currentColor" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Active Bundle */}
          <div className="syan-card p-6 flex items-center gap-6 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-syan-teal/10 flex items-center justify-center text-syan-teal flex-shrink-0">
               <Crown size={32} />
            </div>
            <div className="flex-grow">
               <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">{subscription.planName}</h3>
                 <span className="bg-syan-darkteal/10 text-syan-darkteal text-xs px-2 py-0.5 rounded-full font-bold w-fit">Active</span>
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Valid until {new Date(subscription.expiryDate).toLocaleDateString()}</p>
               <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                   <div className="bg-gradient-to-r from-syan-teal to-syan-darkteal h-full rounded-full" style={{ width: '40%' }}></div>
               </div>
               <p className="text-xs text-slate-400 mt-1 text-right font-medium">40% Complete</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-start justify-between">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-syan-darkteal/10 text-syan-darkteal rounded-xl"><CheckCircle2 size={20} /></div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Completed</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{completed}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quizzes Passed</p>
                </div>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-syan-darkteal h-full" style={{ width: `${totalAttempts > 0 ? (completed/totalAttempts)*100 : 0}%` }}></div>
                </div>
             </div>
             
             <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-start justify-between">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-syan-orange/10 text-syan-orange rounded-xl"><PlayCircle size={20} /></div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">In Progress</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">3</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Modules</p>
                </div>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-syan-orange h-full" style={{ width: '60%' }}></div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-start justify-between">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-syan-pink/10 text-syan-pink rounded-xl"><Bell size={20} /></div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Total Attempts</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{totalAttempts}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lifetime Quizzes</p>
                </div>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-syan-pink h-full" style={{ width: '100%' }}></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <FileText size={20} className="text-syan-teal" /> Quiz History
                      </h3>
                      {recentQuizzes.length > 3 && (
                          <button onClick={() => openHistoryModal('QUIZ')} className="text-xs font-bold text-syan-teal hover:text-syan-darkteal">View All</button>
                      )}
                  </div>
                  <div className="space-y-4">
                      {recentQuizzes.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">No recent quizzes in last 15 days.</p>
                      ) : (
                          recentQuizzes.slice(0, 3).map(quiz => (
                              <div key={quiz.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-syan-teal/30 transition-colors group">
                                  <div>
                                      <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{quiz.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className={`text-[10px] px-1.5 rounded font-bold ${quiz.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {quiz.percentage}%
                                          </span>
                                          <span className="text-[10px] text-slate-400">{new Date(quiz.date).toLocaleDateString()}</span>
                                          <span className="text-[10px] text-slate-500 font-medium">Score: {formatScore(quiz.score)}/{quiz.total}</span>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => onReattemptQuiz(quiz)}
                                    className="p-2 rounded-full text-slate-400 hover:text-syan-teal hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                    title="Re-attempt Quiz"
                                  >
                                      <RotateCcw size={16} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <PlayCircle size={20} className="text-syan-orange" /> Video History
                      </h3>
                      {recentVideos.length > 3 && (
                          <button onClick={() => openHistoryModal('VIDEO')} className="text-xs font-bold text-syan-orange hover:text-orange-600">View All</button>
                      )}
                  </div>
                  <div className="space-y-4">
                      {recentVideos.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">No videos watched in last 15 days.</p>
                      ) : (
                          recentVideos.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-syan-orange/30 transition-colors group">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 relative">
                                          <img src={item.course.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80" />
                                          <div className="absolute inset-0 flex items-center justify-center"><Play size={12} fill="white" className="text-white"/></div>
                                      </div>
                                      <div>
                                          <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{item.video.title}</h4>
                                          <p className="text-[10px] text-slate-500 line-clamp-1">{item.course.title}</p>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => onNavigate({ view: 'VIDEO_PLAYER', courseId: item.course.id, videoId: item.video.id })}
                                    className="p-2 rounded-full text-slate-400 hover:text-syan-orange hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                    title="Replay Video"
                                  >
                                      <PlayCircle size={16} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>

          </div>

          
        </div>

        <div className="xl:col-span-4 space-y-8">
            <DashboardWidgets user={user} history={history} />
        </div>

      </div>

      {showHistoryModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
                  <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          {historyType === 'QUIZ' ? <List size={20} className="text-syan-teal" /> : <PlayCircle size={20} className="text-syan-orange" />}
                          {historyType === 'QUIZ' ? 'Quiz History' : 'Watch History'}
                          <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded ml-2">Last 15 Days</span>
                      </h3>
                      <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                      {historyType === 'QUIZ' ? (
                          recentQuizzes.map(quiz => (
                              <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-syan-teal/50 transition-colors">
                                  <div>
                                      <h4 className="font-bold text-slate-800 dark:text-white">{quiz.title}</h4>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                          <span>{new Date(quiz.date).toLocaleString()}</span>
                                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                          <span>Score: {formatScore(quiz.score)}/{quiz.total}</span>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => { onReattemptQuiz(quiz); setShowHistoryModal(false); }}
                                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-syan-teal hover:border-syan-teal transition-colors"
                                  >
                                      Re-attempt
                                  </button>
                              </div>
                          ))
                      ) : (
                          recentVideos.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-syan-orange/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className="w-16 h-10 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                                          <img src={item.course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">{item.video.title}</h4>
                                          <div className="flex items-center gap-2 mt-1">
                                              <p className="text-xs text-slate-500">{item.course.title}</p>
                                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                              <p className="text-xs text-slate-400">{new Date(item.date).toLocaleString()}</p>
                                          </div>
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => { onNavigate({ view: 'VIDEO_PLAYER', courseId: item.course.id, videoId: item.video.id }); setShowHistoryModal(false); }}
                                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-syan-orange hover:border-syan-orange transition-colors"
                                  >
                                      Replay
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
      </div>
    </div>
  );
};
