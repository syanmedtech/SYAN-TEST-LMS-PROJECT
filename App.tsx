
import React, { useState, useEffect } from 'react';
import { User, Topic, QuizSession, QuizHistoryItem, VideoProgress, Course, Question } from './types';
import { 
  mockLogin, getUserVideoProgress 
} from './services/mockService';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { Courses } from './components/Courses';
import { QuizSelection } from './components/QuizSelection';
import { SubscriptionModule } from './components/SubscriptionModule';
import { SettingsModule } from './components/SettingsModule';
import { VideoCourses as StudentVideoCourses } from './components/VideoCourses';
import { VideoPlayer } from './components/VideoPlayer';
import { StatisticsModule } from './components/StatisticsModule';
import { BookmarksModule } from './components/BookmarksModule';
import { StudyPlanner } from './components/StudyPlanner';
import { AdminPanel } from './components/AdminPanel';
import { MockExamsList } from './components/MockExamsList';
import { ExamStartScreen } from './components/ExamStartScreen';
import { FlashcardPlayer } from './components/FlashcardPlayer';

// Admin Pages
import { AdminLayout } from './admin/layout/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { ExamList } from './admin/pages/ExamList';
import { ExamEditor } from './admin/pages/ExamEditor';
import { QuestionBank } from './admin/pages/QuestionBank';
import { QuestionEditor } from './admin/pages/QuestionEditor';
import { Hierarchy } from './admin/pages/Hierarchy';
import { SelectionRulesPage } from './admin/pages/SelectionRules';
import { QuizControlsPage } from './admin/pages/QuizControls';
import { IntegrityCenter } from './admin/pages/IntegrityCenter';
import { Subscriptions } from './admin/pages/Subscriptions';
import { SubscriptionDetail } from './admin/pages/SubscriptionDetail';
import { SubscriptionSettings } from './admin/pages/SubscriptionSettings';
import { Packages } from './admin/pages/Packages';
import { PackageEditor } from './admin/pages/PackageEditor';
import { VideoCourses as AdminVideoCourses } from './admin/pages/VideoCourses';
import { VideoCourseEditor } from './admin/pages/VideoCourseEditor';
import { LabValues } from './admin/pages/LabValues';
import { NotesTemplate } from './admin/pages/NotesTemplate';
import { Calculator } from './admin/pages/Calculator';

import { fsLogUser, fsLogAttempt, fsGetRecentAttempts } from './services/db/firestore';
import { dbGetHierarchy, dbGetQuestionsByFilters } from './services/db';

/**
 * Main Application Component
 * Manages state for student/admin flows and handles high-level navigation.
 * Fixes "Cannot find name 'view'", "'user'", etc. errors and provides default export.
 */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('DASHBOARD');
  const [adminView, setAdminView] = useState<string>('ADMIN_DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [videoHistory, setVideoHistory] = useState<VideoProgress[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizSession | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('MBBS');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dbGetHierarchy().then(setTopics);
      getUserVideoProgress().then(setVideoHistory);
      fsGetRecentAttempts(user.id).then(setHistory);
    }
  }, [user]);

  const handleLogin = async (username: string) => {
    setIsLoading(true);
    try {
      const u = await mockLogin(username);
      setUser(u);
      await fsLogUser(u);
    } catch (e) {
      console.error("Login failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('DASHBOARD');
  };

  const handleStartQuiz = async (
    topicIds: string[], 
    title: string, 
    durationMins?: number, 
    mode: 'TUTOR' | 'EXAM' | 'FLASHCARD' = 'TUTOR'
  ) => {
    setIsLoading(true);
    try {
      const questions = await dbGetQuestionsByFilters(topicIds);
      const session: QuizSession = {
        questions,
        answers: {},
        notes: {},
        flagged: new Set(),
        isSubmitted: false,
        score: 0,
        startTime: Date.now(),
        title,
        durationSeconds: durationMins ? durationMins * 60 : 0,
        mode
      };
      setCurrentQuiz(session);
      setView(mode === 'FLASHCARD' ? 'FLASHCARD' : 'QUIZ');
    } catch (e) {
      console.error("Failed to start quiz", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async (
    answers: Record<string, 'a' | 'b' | 'c' | 'd'>, 
    notes: Record<string, string>, 
    flagged: Set<string>,
    meta?: any
  ) => {
    if (!currentQuiz || !user) return;

    let correct = 0;
    currentQuiz.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const session: QuizSession = {
      ...currentQuiz,
      answers,
      notes,
      flagged,
      isSubmitted: true,
      score: correct,
      correctCount: correct,
      endTime: Date.now(),
      ...meta
    };

    setCurrentQuiz(session);
    setView('RESULTS');

    // Log to history
    const historyItem: QuizHistoryItem = {
      id: meta?.attemptId || `at_${Date.now()}`,
      date: Date.now(),
      title: session.title || 'Untitled Quiz',
      score: correct,
      total: session.questions.length,
      percentage: Math.round((correct / session.questions.length) * 100),
      mode: session.mode
    };
    setHistory([historyItem, ...history]);
    
    // Remote log
    await fsLogAttempt(user.id, session);
  };

  const handleNavigate = (target: any) => {
    if (typeof target === 'string') {
      if (target.startsWith('ADMIN_')) {
        setAdminView(target);
        setView('ADMIN_LAYOUT');
      } else {
        setView(target);
      }
    } else {
      setView(target.view);
      if (target.courseId) setSelectedCourseId(target.courseId);
      if (target.videoId) setSelectedId(target.videoId);
      if (target.id) setSelectedId(target.id);
    }
  };

  if (!user) return <Login onLogin={handleLogin} isLoading={isLoading} />;

  const renderAdminView = () => {
    switch (adminView) {
      case 'ADMIN_DASHBOARD': return <AdminDashboard onNavigate={setAdminView} />;
      case 'ADMIN_EXAMS': return <ExamList onEdit={(id) => { setSelectedId(id); setAdminView('ADMIN_MOCK_PAPER_EDITOR'); }} onCreate={() => setAdminView('ADMIN_MOCK_PAPER_NEW')} />;
      case 'ADMIN_MOCK_PAPER_EDITOR': return <ExamEditor examId={selectedId} onBack={() => setAdminView('ADMIN_EXAMS')} />;
      case 'ADMIN_MOCK_PAPER_NEW': return <ExamEditor examId={null} onBack={() => setAdminView('ADMIN_EXAMS')} />;
      case 'ADMIN_QBANK': return <QuestionBank onNavigate={(t) => { if (t.view) setAdminView(t.view); if (t.id) setSelectedId(t.id); }} />;
      case 'ADMIN_QUESTION_EDITOR': return <QuestionEditor id={selectedId} onBack={() => setAdminView('ADMIN_QBANK')} />;
      case 'ADMIN_QUESTION_EDITOR_NEW': return <QuestionEditor id={null} onBack={() => setAdminView('ADMIN_QBANK')} />;
      case 'ADMIN_HIERARCHY': return <Hierarchy />;
      case 'ADMIN_SELECTION_RULES': return <SelectionRulesPage />;
      case 'ADMIN_QUIZ_CONTROLS': return <QuizControlsPage />;
      case 'ADMIN_INTEGRITY': return <IntegrityCenter />;
      case 'ADMIN_SUBSCRIPTIONS': return <Subscriptions onNavigate={(t) => { setAdminView(t.view); if (t.id) setSelectedId(t.id); }} />;
      case 'ADMIN_SUBSCRIPTION_DETAIL': return <SubscriptionDetail id={selectedId!} onBack={() => setAdminView('ADMIN_SUBSCRIPTIONS')} currentUserUid={user.id} />;
      case 'ADMIN_SUBSCRIPTION_SETTINGS': return <SubscriptionSettings onBack={() => setAdminView('ADMIN_SUBSCRIPTIONS')} />;
      case 'ADMIN_PACKAGES': return <Packages onNavigate={(t) => { setAdminView(t.view); if (t.id) setSelectedId(t.id); }} />;
      case 'ADMIN_PACKAGE_EDITOR': return <PackageEditor id={selectedId} onBack={() => setAdminView('ADMIN_PACKAGES')} />;
      case 'ADMIN_PACKAGE_EDITOR_NEW': return <PackageEditor id={null} onBack={() => setAdminView('ADMIN_PACKAGES')} />;
      case 'ADMIN_VIDEO_COURSES': return <AdminVideoCourses onNavigate={(t) => { setAdminView(t.view); if (t.id) setSelectedId(t.id); }} />;
      case 'ADMIN_VIDEO_COURSE_EDITOR': return <VideoCourseEditor id={selectedId} onBack={() => setAdminView('ADMIN_VIDEO_COURSES')} />;
      case 'ADMIN_VIDEO_COURSE_EDITOR_NEW': return <VideoCourseEditor id={null} onBack={() => setAdminView('ADMIN_VIDEO_COURSES')} />;
      case 'ADMIN_LAB_VALUES': return <LabValues />;
      case 'ADMIN_NOTES_TEMPLATE': return <NotesTemplate />;
      case 'ADMIN_CALCULATOR': return <Calculator />;
      case 'ADMIN_PANEL': return <AdminPanel user={user} />;
      default: return <AdminDashboard onNavigate={setAdminView} />;
    }
  };

  return (
    <div className="h-full w-full">
      {view === 'QUIZ' && currentQuiz && (
        <Quiz 
          questions={currentQuiz.questions} 
          onSubmit={handleQuizSubmit} 
          onExit={() => setView('DASHBOARD')}
          durationSeconds={currentQuiz.durationSeconds}
          mode={currentQuiz.mode}
          userId={user.id}
        />
      )}
      
      {view === 'FLASHCARD' && currentQuiz && (
        <FlashcardPlayer 
          questions={currentQuiz.questions}
          userId={user.id}
          onExit={() => setView('DASHBOARD')}
          title={currentQuiz.title}
        />
      )}

      {view === 'ADMIN_LAYOUT' && (
        <AdminLayout activeView={adminView} onNavigate={setAdminView} onLogout={handleLogout}>
          {renderAdminView()}
        </AdminLayout>
      )}

      {view !== 'QUIZ' && view !== 'FLASHCARD' && view !== 'ADMIN_LAYOUT' && (
        <Layout user={user} onLogout={handleLogout} currentView={view} onNavigate={handleNavigate}>
          {view === 'DASHBOARD' && (
            <Dashboard 
              user={user} 
              history={history} 
              videoHistory={videoHistory} 
              subscription={user.subscription}
              onResume={() => {}}
              onNavigate={handleNavigate}
              onReattemptQuiz={(item) => handleStartQuiz(['random'], item.title, 30, item.mode)}
              onStartPractice={(ids, title) => handleStartQuiz(ids, title, 30, 'TUTOR')}
            />
          )}
          {view === 'COURSES' && <Courses onSelectCourse={(id) => { setSelectedCourseId(id); setView('QUIZ_SELECTION'); }} />}
          {view === 'QUIZ_SELECTION' && (
            <QuizSelection 
              courseId={selectedCourseId} 
              topics={topics} 
              onStartQuiz={handleStartQuiz} 
              onBack={() => setView('COURSES')} 
            />
          )}
          {view === 'MOCK_EXAMS' && <MockExamsList user={user} onSelectExam={(id) => { setSelectedTestId(id); setView('EXAM_START'); }} />}
          {view === 'EXAM_START' && selectedTestId && (
            <ExamStartScreen testId={selectedTestId} user={user} onBack={() => setView('MOCK_EXAMS')} onStart={handleStartQuiz} />
          )}
          {view === 'VIDEO_COURSES' && <StudentVideoCourses onSelectCourse={(id) => { setSelectedCourseId(id); setView('VIDEO_PLAYER'); }} />}
          {view === 'VIDEO_PLAYER' && (
            <VideoPlayer 
              courseId={selectedCourseId} 
              user={user}
              initialVideoId={selectedId || undefined}
              onBack={() => setView('VIDEO_COURSES')} 
              onTakeQuiz={(tid) => handleStartQuiz([tid], 'Video Quiz', 15, 'TUTOR')}
              onVideoProgress={() => {}}
            />
          )}
          {view === 'STATISTICS' && <StatisticsModule user={user} history={history} videoHistory={videoHistory} onNavigate={handleNavigate} />}
          {view === 'STUDY_PLANNER' && <StudyPlanner history={history} videoHistory={videoHistory} allTopics={topics} />}
          {view === 'BOOKMARKS' && <BookmarksModule onNavigate={handleNavigate} />}
          {view === 'SUBSCRIPTION' && <SubscriptionModule user={user} />}
          {view === 'SETTINGS' && <SettingsModule user={user} />}
          {view === 'RESULTS' && currentQuiz && <Results session={currentQuiz} onHome={() => setView('DASHBOARD')} />}
        </Layout>
      )}
    </div>
  );
}
