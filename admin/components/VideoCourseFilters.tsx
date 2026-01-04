
import React from 'react';
import { Search, Filter, Plus, Video } from 'lucide-react';

interface VideoCourseFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  onCreate: () => void;
}

export const VideoCourseFilters: React.FC<VideoCourseFiltersProps> = ({ 
  search, onSearchChange, status, onStatusChange, onCreate 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
      <div className="flex flex-1 gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search courses by title..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary-500/10 text-sm outline-none shadow-sm transition-all"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer pr-2"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <button 
        onClick={onCreate}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
      >
        <Plus size={20} /> Create Course
      </button>
    </div>
  );
};
