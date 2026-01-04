
import React from 'react';
import { LayoutDashboard, BookOpen, Settings, CreditCard } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const items = [
    { 
      id: 'DASHBOARD', 
      label: 'Home', 
      icon: LayoutDashboard, 
      activeClass: 'text-syan-teal' 
    },
    { 
      id: 'COURSES', 
      label: 'Courses', 
      icon: BookOpen, 
      activeClass: 'text-syan-darkteal' 
    },
    { 
      id: 'SUBSCRIPTION', 
      label: 'Subscrip', 
      icon: CreditCard, 
      activeClass: 'text-syan-orange' 
    },
    { 
      id: 'SETTINGS', 
      label: 'Settings', 
      icon: Settings, 
      activeClass: 'text-syan-pink' 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe transition-all duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = currentView === item.id || (currentView === 'QUIZ_SELECTION' && item.id === 'COURSES');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative group ${
                isActive ? item.activeClass : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              {/* Active Indicator Line (Top) */}
              {isActive && (
                <span className={`absolute top-0 w-8 h-1 rounded-b-full ${item.activeClass.replace('text-', 'bg-')}`} />
              )}
              
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-slate-50 dark:bg-slate-800 scale-110' : ''}`}>
                 <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-sm' : ''} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'scale-105' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
