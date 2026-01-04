
import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, BarChart3, ChevronLeft, Menu, LogOut, 
  Shield, CreditCard, Package, Video, BookOpen, Layers, 
  Settings2, Zap, FlaskConical, Calculator, ShieldAlert
} from 'lucide-react';
import { Logo } from '../../components/Logo';

interface AdminLayoutProps {
  children: React.ReactNode; // Fixed React.Node to React.ReactNode
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeView, onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const mainItems = [
    { id: 'ADMIN_DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ADMIN_HIERARCHY', label: 'Hierarchy', icon: Layers },
    { id: 'ADMIN_QBANK', label: 'Question Bank', icon: BookOpen },
    { id: 'TESTS', label: 'Mock Exams', icon: FileText },
  ];

  const configItems = [
    { id: 'ADMIN_SELECTION_RULES', label: 'Selection Rules', icon: Settings2 },
    { id: 'ADMIN_QUIZ_CONTROLS', label: 'Quiz Controls', icon: Zap },
    { id: 'ADMIN_INTEGRITY', label: 'Integrity Center', icon: ShieldAlert },
    { id: 'ADMIN_SUBSCRIPTIONS', label: 'Subscriptions', icon: CreditCard },
    { id: 'ADMIN_PACKAGES', label: 'Packages', icon: Package },
    { id: 'ADMIN_VIDEO_COURSES', label: 'Video Courses', icon: Video },
    { id: 'ADMIN_ANALYTICS', label: 'Analytics Center', icon: BarChart3 },
  ];

  const toolItems = [
    { id: 'ADMIN_LAB_VALUES', label: 'Lab Values', icon: FlaskConical },
    { id: 'ADMIN_NOTES_TEMPLATE', label: 'Notes Template', icon: FileText },
    { id: 'ADMIN_CALCULATOR', label: 'Calculator', icon: Calculator },
  ];

  const renderMenuItem = (item: any) => {
    const isActive = activeView === item.id || 
                    (item.id === 'TESTS' && (activeView === 'ADMIN_MOCK_PAPER_EDITOR' || activeView === 'ADMIN_MOCK_PAPER_NEW'));
    
    return (
      <button
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={`
          w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
          ${isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'}
          ${!isSidebarOpen ? 'justify-center' : ''}
        `}
        title={!isSidebarOpen ? item.label : ''}
      >
        <item.icon size={22} className={isActive ? 'scale-110' : ''} />
        {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <aside className={`
        bg-slate-900 text-white h-full transition-all duration-300 ease-in-out relative z-50
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        hidden md:flex flex-col
      `}>
        <div className="p-6 h-24 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <Logo withText={false} className="w-8 h-8" />
              <span className="font-black text-xl tracking-tighter">SYAN ADMIN</span>
            </div>
          ) : (
            <Logo withText={false} className="w-8 h-8 mx-auto" />
          )}
        </div>

        <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto custom-scrollbar pb-10">
          <div className="space-y-1">
            {mainItems.map(renderMenuItem)}
          </div>

          <div className="space-y-1">
            {isSidebarOpen && <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] px-4 mb-2">Configurations</p>}
            {configItems.map(renderMenuItem)}
          </div>

          <div className="space-y-1">
            {isSidebarOpen && <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] px-4 mb-2">Tools</p>}
            {toolItems.map(renderMenuItem)}
          </div>

          <div className="space-y-1 pt-4 border-t border-white/5">
             {renderMenuItem({ id: 'ADMIN_PANEL', label: 'Legacy Panel', icon: Shield })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={() => onNavigate('DASHBOARD')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <ChevronLeft size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Student App</span>}
          </button>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 text-white z-50 hover:scale-110 transition-transform"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-6 z-40">
        <Logo withText={false} className="w-8 h-8" />
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside className="w-64 bg-slate-900 h-full p-6 space-y-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <span className="font-black text-xl">SYAN ADMIN</span>
              <button onClick={() => setIsSidebarOpen(false)}><ChevronLeft /></button>
            </div>
            <nav className="space-y-6">
               <div className="space-y-1">
                 {mainItems.map(item => (
                    <button key={item.id} onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl ${activeView === item.id ? 'bg-primary-600 text-white' : 'text-slate-400'}`}>
                      <item.icon size={20} /> <span className="font-bold">{item.label}</span>
                    </button>
                 ))}
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] px-4 mb-2">Tools</p>
                 {toolItems.map(item => (
                    <button key={item.id} onClick={() => { onNavigate(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl ${activeView === item.id ? 'bg-primary-600 text-white' : 'text-slate-400'}`}>
                      <item.icon size={20} /> <span className="font-bold">{item.label}</span>
                    </button>
                 ))}
               </div>
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pt-20 md:pt-0 p-6 md:p-10 scroll-smooth">
        <div className="max-w-7xl auto">
          {children}
        </div>
      </main>
    </div>
  );
};
