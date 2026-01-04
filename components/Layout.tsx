
import React, { useState } from 'react';
import { 
  LogOut, Home, Layers, Moon, Sun,
  PlayCircle, BarChart2, Bookmark, Calendar, CreditCard, ShieldCheck, FileText, Settings, Menu, ChevronLeft
} from 'lucide-react';
import { Logo } from './Logo';
import { BottomNav } from './BottomNav';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'DASHBOARD', label: 'Home', icon: Home, activeColor: 'text-syan-teal' },
    ...(isAdmin ? [{ id: 'ADMIN_PANEL', label: 'Admin Panel', icon: ShieldCheck, activeColor: 'text-purple-600' }] : []),
    { id: 'COURSES', label: 'My QBank', icon: Layers, activeColor: 'text-syan-darkteal' },
    { id: 'MOCK_EXAMS', label: 'Mock Exams', icon: FileText, activeColor: 'text-syan-orange' },
    { id: 'VIDEO_COURSES', label: 'Exam Courses', icon: PlayCircle, activeColor: 'text-syan-orange' },
    { id: 'STATISTICS', label: 'Statistics', icon: BarChart2, activeColor: 'text-syan-pink' },
    { id: 'STUDY_PLANNER', label: 'Study Planner', icon: Calendar, activeColor: 'text-syan-darkteal' },
    { id: 'BOOKMARKS', label: 'Bookmarks', icon: Bookmark, activeColor: 'text-syan-teal' },
    { id: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard, activeColor: 'text-syan-orange' },
    { id: 'SETTINGS', label: 'Settings', icon: Settings, activeColor: 'text-slate-600 dark:text-slate-300' },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-screen flex flex-col overflow-hidden`}>
      <div className="flex h-full bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel z-40 flex items-center justify-between px-4 transition-all duration-300">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8" withText={false} />
              <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">SYAN</span>
            </div>
            <div className="w-8"></div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl animate-slide-in-left flex flex-col border-r border-slate-200 dark:border-slate-800">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Logo className="w-8 h-8" withText={false} />
                          <span className="font-bold text-xl text-slate-800 dark:text-white">Syan Medical</span>
                      </div>
                      <button onClick={() => setIsMobileMenuOpen(false)}><ChevronLeft size={24} className="text-slate-400" /></button>
                  </div>
                  <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                      {menuItems.map(item => (
                          <button 
                              key={item.id}
                              onClick={() => handleNavigate(item.id)}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl font-medium transition-colors ${currentView === item.id ? 'bg-primary-50 dark:bg-slate-800 ' + item.activeColor : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                              <item.icon size={20} />
                              {item.label}
                          </button>
                      ))}
                  </div>
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={onLogout} className="flex items-center gap-2 text-syan-pink font-medium p-2 w-full hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <LogOut size={20} /> Logout
                      </button>
                  </div>
              </div>
          </div>
        )}

        {/* DESKTOP SIDEBAR */}
        <aside 
          onMouseEnter={() => setIsCollapsed(false)}
          onMouseLeave={() => setIsCollapsed(true)}
          className={`hidden md:flex fixed top-0 left-0 bottom-0 z-[60] glass-panel border-r border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-200 transition-all duration-300 ease-in-out h-full flex-col flex-shrink-0 shadow-2xl
            ${isCollapsed ? 'w-20' : 'w-72'}
          `}
        >
          {/* Header */}
          <div className="h-24 flex items-center justify-between px-6 flex-shrink-0 overflow-hidden">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 animate-fade-in">
                  <Logo className="w-10 h-10" withText={false} />
                  <span className="font-bold text-2xl tracking-tight whitespace-nowrap">
                      <span className="text-syan-orange">S</span>
                      <span className="text-syan-pink">Y</span>
                      <span className="text-syan-teal">A</span>
                      <span className="text-syan-darkteal">N</span>
                  </span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                  <Logo className="w-8 h-8" withText={false} />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-3 overflow-y-auto mt-4 overflow-x-hidden no-scrollbar">
            {menuItems.map((item) => {
              const isActive = currentView === item.id || 
                (currentView === 'VIDEO_PLAYER' && item.id === 'VIDEO_COURSES') ||
                (currentView === 'EXAM_LANDING' && item.id === 'MOCK_EXAMS');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative whitespace-nowrap
                    ${isActive 
                      ? `bg-white dark:bg-slate-800 shadow-syan-sm ${item.activeColor}` 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={22} className={`flex-shrink-0 ${isActive ? '' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span className={`font-semibold tracking-wide transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                      {item.label}
                  </span>
                  
                  {isActive && !isCollapsed && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${item.activeColor.replace('text-', 'bg-')}`}></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer & Dark Mode */}
          <div className="p-6 flex-shrink-0 space-y-4 overflow-hidden">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors border border-slate-200 dark:border-slate-800 whitespace-nowrap ${isCollapsed ? 'justify-center' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Toggle Theme"
            >
                {isDarkMode ? <Sun size={20} className="text-syan-orange flex-shrink-0" /> : <Moon size={20} className="text-syan-darkteal flex-shrink-0" />}
                <span className={`text-sm font-bold transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
            </button>

            {user && (
              <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} pt-2 border-t border-slate-100 dark:border-slate-800 whitespace-nowrap`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-syan-teal to-syan-darkteal flex items-center justify-center text-white font-bold shadow-lg shadow-syan-teal/20 cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                    <button onClick={onLogout} className="text-xs text-slate-400 hover:text-syan-pink flex items-center gap-1 mt-0.5 transition-colors font-medium">
                      <LogOut size={12} /> Logout
                    </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0 relative z-0 md:ml-20 transition-all duration-300">
          <main className="flex-1 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
            {children}
          </main>
          
          {(currentView !== 'QUIZ' && currentView !== 'RESULTS' && currentView !== 'VIDEO_PLAYER' && currentView !== 'EXAM_LANDING') && (
              <BottomNav currentView={currentView} onNavigate={onNavigate} />
          )}
        </div>
      </div>
    </div>
  );
};
