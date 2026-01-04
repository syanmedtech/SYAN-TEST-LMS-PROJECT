
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StudyTask, StudyGoal, QuizHistoryItem, VideoProgress, ExamPlan, TopicTracker, Topic, TopicStatus } from '../types';
import { generateAiStudyPlan } from '../services/genai';
import { 
  Calendar as CalendarIcon, CheckCircle, Plus, Trash2, Clock, 
  BookOpen, PlayCircle, Target, ListTodo, Sparkles, Timer, BarChart, 
  ChevronRight, AlertCircle, RefreshCw, Layers, Flame, Play, Pause, RotateCcw,
  LayoutDashboard, CheckSquare
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StudyPlannerProps {
    history: QuizHistoryItem[];
    videoHistory: VideoProgress[];
    allTopics: Topic[];
}

type PlannerTab = 'OVERVIEW' | 'CALENDAR' | 'TASKS' | 'GOALS' | 'TIMER' | 'EXAM_PLANNER';

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ history, videoHistory, allTopics }) => {
  const [activeTab, setActiveTab] = useState<PlannerTab>('OVERVIEW');
  
  // Shared State for General Planner
  const [manualTasks, setManualTasks] = useState<StudyTask[]>([
      { id: '1', title: 'Read Anatomy Chapter 1', date: new Date().toISOString().split('T')[0], type: 'READING', durationMins: 60, isCompleted: false, priority: 'HIGH' },
      { id: '2', title: 'Watch CNS Video', date: new Date().toISOString().split('T')[0], type: 'VIDEO', durationMins: 30, isCompleted: true, priority: 'MEDIUM' }
  ]);
  const [goals, setGoals] = useState<StudyGoal[]>([
      { id: 'g1', title: 'Finish Anatomy Block', deadline: '2024-12-01', targetPercent: 100, currentPercent: 45, type: 'MONTHLY' }
  ]);

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Planner Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="text-syan-teal" /> Study Planner
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage your schedule</p>
            </div>
            
            <div className="p-4 space-y-2 flex-grow overflow-y-auto">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">General</div>
                <button onClick={() => setActiveTab('OVERVIEW')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'OVERVIEW' ? 'bg-slate-100 dark:bg-slate-800 text-syan-teal font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <LayoutDashboard size={18} /> Overview
                </button>
                <button onClick={() => setActiveTab('CALENDAR')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'CALENDAR' ? 'bg-slate-100 dark:bg-slate-800 text-syan-orange font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <CalendarIcon size={18} /> Calendar
                </button>
                <button onClick={() => setActiveTab('TASKS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'TASKS' ? 'bg-slate-100 dark:bg-slate-800 text-syan-pink font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <CheckSquare size={18} /> My Tasks
                </button>
                <button onClick={() => setActiveTab('GOALS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'GOALS' ? 'bg-slate-100 dark:bg-slate-800 text-syan-darkteal font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Target size={18} /> Study Goals
                </button>
                <button onClick={() => setActiveTab('TIMER')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'TIMER' ? 'bg-slate-100 dark:bg-slate-800 text-blue-500 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Timer size={18} /> Focus Timer
                </button>

                <div className="my-4 border-t border-slate-100 dark:border-slate-800"></div>
                
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Advanced</div>
                <button 
                    onClick={() => setActiveTab('EXAM_PLANNER')} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left relative overflow-hidden ${activeTab === 'EXAM_PLANNER' ? 'bg-gradient-to-r from-syan-darkteal to-teal-700 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                >
                    <div className="relative z-10 flex items-center gap-3">
                        <Sparkles size={18} /> Exam Planner
                    </div>
                    {activeTab === 'EXAM_PLANNER' && <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/10 to-transparent"></div>}
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'OVERVIEW' && <OverviewView tasks={manualTasks} goals={goals} />}
            {activeTab === 'CALENDAR' && <GeneralCalendarView tasks={manualTasks} />}
            {activeTab === 'TASKS' && <TasksView tasks={manualTasks} setTasks={setManualTasks} />}
            {activeTab === 'GOALS' && <GoalsView goals={goals} setGoals={setGoals} />}
            {activeTab === 'TIMER' && <FocusTimerView />}
            
            {activeTab === 'EXAM_PLANNER' && (
                <ExamModeView allTopics={allTopics} />
            )}
        </div>
    </div>
  );
};

/* --- 1. OVERVIEW VIEW --- */
const OverviewView: React.FC<{ tasks: StudyTask[], goals: StudyGoal[] }> = ({ tasks, goals }) => {
    const pendingTasks = tasks.filter(t => !t.isCompleted).length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planner Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><ListTodo size={24}/></div>
                        <div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{pendingTasks}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Tasks Pending</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl"><CheckCircle size={24}/></div>
                        <div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{completedTasks}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Completed Today</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-syan-orange/10 text-syan-orange rounded-xl"><Target size={24}/></div>
                        <div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{goals.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Active Goals</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Today's Priority</h3>
                    {pendingTasks > 0 ? (
                        <div className="space-y-3">
                            {tasks.filter(t => !t.isCompleted).slice(0, 3).map(task => (
                                <div key={task.id} className="p-3 border rounded-xl flex items-center justify-between">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{task.title}</span>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No pending tasks. Great job!</p>
                    )}
                </div>
                
                <div className="bg-gradient-to-br from-syan-teal to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Exam Mode Available</h3>
                        <p className="opacity-90 text-sm mb-4">Switch to the advanced Exam Planner to generate AI-powered schedules tailored to your exam date.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-80 bg-white/20 w-fit px-3 py-1 rounded-lg">
                        <Sparkles size={14} /> AI Powered
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- 2. TASKS VIEW --- */
const TasksView: React.FC<{ tasks: StudyTask[], setTasks: React.Dispatch<React.SetStateAction<StudyTask[]>> }> = ({ tasks, setTasks }) => {
    const [newTask, setNewTask] = useState('');

    const addTask = () => {
        if (!newTask.trim()) return;
        const task: StudyTask = {
            id: Date.now().toString(),
            title: newTask,
            date: new Date().toISOString().split('T')[0],
            type: 'CUSTOM',
            durationMins: 30,
            isCompleted: false,
            priority: 'MEDIUM'
        };
        setTasks([...tasks, task]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    };

    const deleteAll = () => {
        if (window.confirm("Are you sure you want to delete all tasks?")) {
            setTasks([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Tasks</h1>
                {tasks.length > 0 && (
                    <button onClick={deleteAll} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1">
                        <Trash2 size={16} /> Delete All
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700 flex gap-2">
                <input 
                    type="text" 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a new task..."
                    className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
                />
                <button onClick={addTask} className="bg-syan-teal text-white p-2 rounded-lg hover:bg-syan-darkteal transition-colors">
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No tasks added yet.</div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${task.isCompleted ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}
                            >
                                {task.isCompleted && <CheckCircle size={14} />}
                            </button>
                            <span className={`flex-1 font-medium ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}>{task.title}</span>
                            <span className="text-xs text-slate-400">{task.type}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

/* --- 3. GOALS VIEW --- */
const GoalsView: React.FC<{ goals: StudyGoal[], setGoals: any }> = ({ goals, setGoals }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Study Goals</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => (
                    <div key={goal.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{goal.title}</h3>
                                <p className="text-xs text-slate-500">Deadline: {goal.deadline}</p>
                            </div>
                            <span className="bg-syan-teal/10 text-syan-teal px-2 py-1 rounded text-xs font-bold">{goal.type}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Progress</span>
                                <span>{goal.currentPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-syan-teal h-full transition-all" style={{width: `${goal.currentPercent}%`}}></div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Add Goal Placeholder */}
                <button className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-syan-teal hover:text-syan-teal transition-colors">
                    <Plus size={32} className="mb-2" />
                    <span className="font-bold">Add New Goal</span>
                </button>
            </div>
        </div>
    );
};

/* --- 4. TIMER VIEW --- */
const FocusTimerView: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            alert("Timer Finished!");
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
    };

    const switchMode = (m: 'FOCUS' | 'BREAK') => {
        setMode(m);
        setIsActive(false);
        setTimeLeft(m === 'FOCUS' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-20 text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Focus Timer</h1>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-syan border border-slate-200 dark:border-slate-700">
                <div className="flex justify-center gap-4 mb-8">
                    <button 
                        onClick={() => switchMode('FOCUS')}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${mode === 'FOCUS' ? 'bg-syan-teal text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                        Focus (25m)
                    </button>
                    <button 
                        onClick={() => switchMode('BREAK')}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${mode === 'BREAK' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                        Break (5m)
                    </button>
                </div>

                <div className="text-8xl font-black text-slate-800 dark:text-white font-mono mb-8 tabular-nums">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-4">
                    <button 
                        onClick={toggleTimer}
                        className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- 5. SIMPLE CALENDAR VIEW --- */
const GeneralCalendarView: React.FC<{ tasks: StudyTask[] }> = ({ tasks }) => {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Calendar</h1>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-syan border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center font-bold text-slate-400 text-sm uppercase">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({length: 35}, (_, i) => i + 1).map(day => {
                        const dayTasks = day <= 31 ? tasks.filter(t => new Date(t.date).getDate() === day) : [];
                        return (
                            <div key={day} className={`aspect-square border rounded-xl p-2 relative ${day > 31 ? 'opacity-0' : 'border-slate-100 dark:border-slate-700'}`}>
                                {day <= 31 && (
                                    <>
                                        <span className="text-xs font-bold text-slate-500">{day}</span>
                                        <div className="mt-1 space-y-1">
                                            {dayTasks.map(t => (
                                                <div key={t.id} className="h-1.5 w-full bg-syan-teal rounded-full"></div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};


/* ==================================================================================================== */
/* ===                                  ADVANCED EXAM PLANNER LOGIC                                 === */
/* ==================================================================================================== */

const ExamModeView: React.FC<{ allTopics: Topic[] }> = ({ allTopics }) => {
    const [examPlan, setExamPlan] = useState<ExamPlan | null>(null);
    const [trackedTopics, setTrackedTopics] = useState<TopicTracker[]>([]);
    const [dailyTasks, setDailyTasks] = useState<StudyTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'SETUP' | 'DASHBOARD' | 'TRACKER'>('SETUP');

    // Derived Metrics
    const daysLeft = useMemo(() => {
        if (!examPlan) return 0;
        const diff = Math.abs(new Date(examPlan.examDate).getTime() - new Date().getTime());
        return Math.ceil(diff / (1000 * 3600 * 24));
    }, [examPlan]);

    const isExamMode = daysLeft <= 14;

    const weakAreas = useMemo(() => trackedTopics.filter(t => t.quizAccuracy > 0 && t.quizAccuracy < 60).map(t => t.topicName), [trackedTopics]);
    
    const handleCreatePlan = (plan: ExamPlan, selectedTopicIds: string[]) => {
        setExamPlan(plan);
        const newTrackers: TopicTracker[] = [];
        const traverse = (list: Topic[]) => {
            list.forEach(t => {
                if (selectedTopicIds.includes(t.id)) {
                    newTrackers.push({ topicId: t.id, topicName: t.name, status: 'NOT_STARTED', timeSpentMins: 0, quizAccuracy: 0 });
                }
                if (t.children) traverse(t.children);
            });
        };
        traverse(allTopics);
        setTrackedTopics(newTrackers);
        setView('DASHBOARD');
    };

    const handleGenerateSchedule = async () => {
        if (!examPlan) return;
        setLoading(true);
        const remainingTopics = trackedTopics.filter(t => t.status !== 'COMPLETED').map(t => t.topicName);
        const newTasks = await generateAiStudyPlan(examPlan.examName, daysLeft, remainingTopics.slice(0, 5), examPlan.totalQuizzesToSolve - examPlan.solvedQuizzes, examPlan.dailyStudyHours, isExamMode, weakAreas);
        setDailyTasks(newTasks);
        setLoading(false);
    };

    if (view === 'SETUP') return <SetupWizard allTopics={allTopics} onComplete={handleCreatePlan} />;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Planner</h1>
                    <span className="bg-syan-teal/10 text-syan-teal text-xs font-bold px-2 py-1 rounded border border-syan-teal/20">AI Enhanced</span>
                </div>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border shadow-sm">
                    <button onClick={() => setView('DASHBOARD')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Dashboard</button>
                    <button onClick={() => setView('TRACKER')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'TRACKER' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Syllabus</button>
                </div>
            </div>

            {view === 'DASHBOARD' && examPlan && (
                <PlannerDashboard 
                    examPlan={examPlan} 
                    daysLeft={daysLeft} 
                    trackedTopics={trackedTopics}
                    dailyTasks={dailyTasks}
                    onGenerateSchedule={handleGenerateSchedule}
                    loading={loading}
                    weakAreas={weakAreas}
                />
            )}

            {view === 'TRACKER' && (
                <TopicTrackerView 
                    topics={trackedTopics} 
                    onUpdateStatus={(id, status) => setTrackedTopics(prev => prev.map(t => t.topicId === id ? { ...t, status } : t))}
                />
            )}
        </div>
    );
};

/* --- REUSED EXAM COMPONENTS (From previous iteration) --- */
const SetupWizard: React.FC<{ allTopics: Topic[], onComplete: (plan: ExamPlan, topics: string[]) => void }> = ({ allTopics, onComplete }) => {
    const [step, setStep] = useState(1);
    const [details, setDetails] = useState<Partial<ExamPlan>>({ dailyStudyHours: 4, totalQuizzesToSolve: 50 });
    const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

    const flattenedTopics = useMemo(() => {
        const flat: Topic[] = [];
        const traverse = (list: Topic[]) => { list.forEach(t => { flat.push(t); if (t.children) traverse(t.children); }); }
        traverse(allTopics);
        return flat.filter(t => !t.children || t.children.length === 0);
    }, [allTopics]);

    return (
        <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-xl p-8 animate-fade-in relative">
                 <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Setup Wizard</h2>
                </div>
                {step === 1 ? (
                    <div className="space-y-6">
                        <input type="text" placeholder="Exam Name (e.g. FCPS Part 1)" className="w-full p-3 border rounded-xl" onChange={e => setDetails({...details, examName: e.target.value})} />
                        <input type="date" className="w-full p-3 border rounded-xl" onChange={e => setDetails({...details, examDate: e.target.value})} />
                        <button onClick={() => setStep(2)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">Next</button>
                    </div>
                ) : (
                    <div className="space-y-6 flex flex-col h-[400px]">
                        <div className="flex-1 overflow-y-auto border rounded-xl p-2 space-y-2">
                            {flattenedTopics.map(topic => (
                                <div key={topic.id} onClick={() => { const s = new Set(selectedTopics); s.has(topic.id) ? s.delete(topic.id) : s.add(topic.id); setSelectedTopics(s); }} className={`p-3 rounded-lg border cursor-pointer ${selectedTopics.has(topic.id) ? 'bg-syan-teal/10 border-syan-teal' : 'bg-white'}`}>
                                    {topic.name}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => onComplete({ ...details, solvedQuizzes: 0, isExamMode: false } as ExamPlan, Array.from(selectedTopics))} className="w-full py-3 bg-syan-teal text-white font-bold rounded-xl">Create Plan</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PlannerDashboard: React.FC<any> = ({ examPlan, daysLeft, trackedTopics, dailyTasks, onGenerateSchedule, loading, weakAreas }) => {
    const completed = trackedTopics.filter((t: any) => t.status === 'COMPLETED').length;
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                    <div className="text-4xl font-black mb-1">{daysLeft}</div>
                    <p className="text-sm font-medium opacity-80">Days to Exam</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border">
                     <div className="text-4xl font-black text-slate-800 dark:text-white mb-1">{trackedTopics.length - completed}</div>
                    <p className="text-xs text-slate-400 uppercase">Topics Left</p>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Smart Schedule</h3>
                        <button onClick={onGenerateSchedule} disabled={loading} className="text-syan-teal font-bold text-sm flex items-center gap-2"><RefreshCw size={16} className={loading?'animate-spin':''}/> Refresh</button>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow border min-h-[200px]">
                        {dailyTasks.length > 0 ? dailyTasks.map((task: any) => (
                             <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border mb-2 bg-slate-50">
                                <div className={`p-3 rounded-full ${task.type==='QUIZ'?'bg-pink-100 text-pink-600':'bg-blue-100 text-blue-600'}`}>{task.type==='QUIZ'?<Target size={20}/>:<BookOpen size={20}/>}</div>
                                <div><h4 className="font-bold text-slate-800">{task.title}</h4><p className="text-xs text-slate-500">{task.durationMins}m • {task.priority} Priority</p></div>
                             </div>
                        )) : <div className="text-center py-10 text-slate-400">No schedule generated yet.</div>}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow border">
                     <h3 className="font-bold mb-4">Focus Areas</h3>
                     {weakAreas.length > 0 ? weakAreas.map((w: string) => <div key={w} className="p-3 bg-red-50 text-red-700 rounded-xl mb-2 text-sm font-bold border border-red-100">{w}</div>) : <div className="text-sm text-slate-400">No weak areas yet.</div>}
                </div>
             </div>
        </div>
    );
};

const TopicTrackerView: React.FC<{ topics: TopicTracker[], onUpdateStatus: (id: string, status: TopicStatus) => void }> = ({ topics, onUpdateStatus }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow border overflow-hidden">
             <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 font-bold text-xs uppercase text-slate-500">
                 <div className="col-span-8">Topic</div>
                 <div className="col-span-4 text-center">Status</div>
             </div>
             {topics.map(t => (
                 <div key={t.topicId} className="grid grid-cols-12 gap-4 p-4 border-t items-center hover:bg-slate-50">
                     <div className="col-span-8 font-bold text-slate-800">{t.topicName}</div>
                     <div className="col-span-4 flex justify-center">
                         <select value={t.status} onChange={(e) => onUpdateStatus(t.topicId, e.target.value as TopicStatus)} className="p-2 rounded border text-xs font-bold uppercase">
                             <option value="NOT_STARTED">Todo</option>
                             <option value="IN_PROGRESS">Progress</option>
                             <option value="COMPLETED">Done</option>
                         </select>
                     </div>
                 </div>
             ))}
        </div>
    );
};
