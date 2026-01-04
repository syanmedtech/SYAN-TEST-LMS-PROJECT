
import React from 'react';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';

interface QuestionFiltersProps {
  onSearchChange: (val: string) => void;
  onFilterChange: (key: string, val: string) => void;
  onCreate: () => void;
  activeFilters: any;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({ 
  onSearchChange, onFilterChange, onCreate, activeFilters 
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col gap-6 mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search questions by stem text or tags..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm outline-none transition-all"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <button 
          onClick={onCreate}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={20} /> Create Question
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <Filter size={14} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Filters:</span>
          
          <select 
            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
            value={activeFilters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2"></div>

          <select 
            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
            value={activeFilters.difficulty}
            onChange={(e) => onFilterChange('difficulty', e.target.value)}
          >
            <option value="all">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2"></div>

          <select 
            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
            value={activeFilters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="sba">SBA</option>
            <option value="truefalse">True/False</option>
          </select>
        </div>
      </div>
    </div>
  );
};
