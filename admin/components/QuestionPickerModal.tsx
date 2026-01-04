import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Hash, CheckCircle, Loader2, ChevronRight, Layers } from 'lucide-react';
import { querySelectableQuestions, QuestionQueryParams } from '../services/questionQueryService';
import { QBankQuestion } from '../services/qbankAdminService';
import { HierarchyPicker } from './HierarchyPicker';

interface QuestionPickerModalProps {
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  initialSelectedIds: string[];
}

export const QuestionPickerModal: React.FC<QuestionPickerModalProps> = ({ 
  onClose, onConfirm, initialSelectedIds 
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QBankQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [hierarchy, setHierarchy] = useState({ subjectId: '', topicId: '', subtopicId: '' });

  const PAGE_SIZE = 25;

  const loadQuestions = async (reset = false) => {
    setLoading(true);
    try {
      const params: QuestionQueryParams = {
        pageSize: PAGE_SIZE,
        lastDoc: reset ? undefined : lastDoc,
        search: search.trim() || undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        ...hierarchy
      };

      const res = await querySelectableQuestions(params);
      setResults(prev => reset ? res.items : [...prev, ...res.items]);
      setLastDoc(res.lastDoc);
      setHasMore(res.items.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadQuestions(true), 500);
    return () => clearTimeout(timer);
  }, [search, difficulty, hierarchy]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Layers className="text-primary-600" size={28} /> Select Questions
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Populate fixed question set from repository</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Filters Strip */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search stem text..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <HierarchyPicker 
            onChange={(updates) => setHierarchy(prev => ({ ...prev, ...updates }))}
            {...hierarchy}
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="space-y-3">
            {results.map(q => {
              const isSelected = selectedIds.has(q.id);
              return (
                <div 
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected 
                      ? 'border-primary-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-primary-500' 
                      : 'border-white dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                  }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-200 bg-white'
                  }`}>
                    {isSelected && <CheckCircle size={14} fill="currentColor" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">{q.stem}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{q.subjectName || 'Unmapped'}</span>
                       <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                         q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : 
                         q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                       }`}>{q.difficulty}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {!loading && results.length === 0 && (
              <div className="py-20 text-center text-slate-400 italic">No questions found matching criteria.</div>
            )}

            {loading && (
              <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Searching Repository...</span>
              </div>
            )}

            {hasMore && !loading && (
              <button 
                onClick={() => loadQuestions()}
                className="w-full py-4 text-slate-500 font-bold text-sm hover:text-primary-600 transition-colors"
              >
                Load More Questions (Limit {PAGE_SIZE})
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-4 py-2 rounded-xl font-black text-sm">
               {selectedIds.size} Selected
             </div>
             <button onClick={() => setSelectedIds(new Set())} className="text-xs font-bold text-slate-400 hover:text-red-500">Clear All</button>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none px-8 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(Array.from(selectedIds))}
              className="flex-1 md:flex-none px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-xl hover:scale-[1.02] transition-all"
            >
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};