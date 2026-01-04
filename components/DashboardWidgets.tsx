
import React from 'react';
import { User, QuizHistoryItem } from '../types';
import { Calendar as CalendarIcon, Target } from 'lucide-react';

interface DashboardWidgetsProps {
  user: User;
  history: QuizHistoryItem[];
  className?: string;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ user, history, className = "" }) => {
  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0 ? Math.round(history.reduce((a,b)=>a+b.percentage,0)/totalAttempts) : 0;

  return (
    <div className={`space-y-6 ${className}`}>
        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl shadow-syan border border-slate-200 p-6 text-center animate-fade-in">
        <div className="w-24 h-24 mx-auto bg-slate-200 rounded-full mb-4 border-4 border-white shadow-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0)}
            </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
        <p className="text-primary-600 font-medium text-sm mb-4">Medical Student • Year 3</p>
        
        <div className="flex justify-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
            <div className="px-3 border-r border-slate-200">
                <span className="block font-bold text-slate-800 text-lg">{totalAttempts}</span>
                Quizzes
            </div>
            <div className="px-3">
                <span className="block font-bold text-slate-800 text-lg">
                    {avgScore}%
                </span>
                Avg Score
            </div>
        </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-2xl shadow-syan border border-slate-200 p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon size={18} className="text-primary-500" /> Schedule
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase">{new Date().toLocaleString('default', { month: 'long' })}</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
                <span key={d} className="text-xs font-bold text-slate-400 py-1">{d}</span>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-600">
            {Array.from({length: 30}, (_, i) => i + 1).map(day => {
                const isToday = day === new Date().getDate();
                const hasEvent = [5, 12, 18, 25].includes(day);
                return (
                    <div key={day} className={`aspect-square flex items-center justify-center rounded-lg relative ${isToday ? 'bg-primary-500 text-white font-bold' : 'hover:bg-slate-50'}`}>
                        {day}
                        {hasEvent && !isToday && <div className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full"></div>}
                    </div>
                );
            })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    12
                </div>
                <div>
                    <p className="font-semibold text-slate-800">Mock Exam 2</p>
                    <p className="text-xs text-slate-500">10:00 AM • Pathology</p>
                </div>
            </div>
        </div>
        </div>

        {/* Vertical Ad Banner */}
        <div className="w-full h-[400px] bg-slate-800 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center text-center p-6 text-white shadow-lg animate-fade-in group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="relative z-10">
                <Target size={48} className="mx-auto mb-4 text-primary-400" />
                <h4 className="text-xl font-bold mb-2">Syan Rapid Review</h4>
                <p className="text-slate-300 text-sm mb-6">Boost your retention with our new high-yield flashcards.</p>
                <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-primary-50 transition-colors">
                    Try for Free
                </button>
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] text-white/30 uppercase border border-white/20 px-1 rounded">Ad</div>
        </div>
    </div>
  );
};
