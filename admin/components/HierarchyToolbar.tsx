
import React from 'react';
import { Plus, Search, Layers, ListTree, BrainCircuit } from 'lucide-react';
import { HierarchyType } from '../services/hierarchyService';

interface HierarchyToolbarProps {
  onAdd: (type: HierarchyType) => void;
  onSearch: (val: string) => void;
  selectedType?: HierarchyType;
}

export const HierarchyToolbar: React.FC<HierarchyToolbarProps> = ({ onAdd, onSearch, selectedType }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800">
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500" size={18} />
        <input 
          type="text"
          placeholder="Search hierarchy..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/10 text-sm"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={() => onAdd('subject')}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-200"
        >
          <Layers size={16} /> Add Subject
        </button>
        <button 
          onClick={() => onAdd('topic')}
          disabled={selectedType !== 'subject' && selectedType !== 'topic'}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-syan-orange text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-100 disabled:opacity-30"
        >
          <ListTree size={16} /> Add Topic
        </button>
        <button 
          onClick={() => onAdd('subtopic')}
          disabled={selectedType !== 'topic' && selectedType !== 'subtopic'}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-syan-teal text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-teal-100 disabled:opacity-30"
        >
          <BrainCircuit size={16} /> Add Subtopic
        </button>
      </div>
    </div>
  );
};
