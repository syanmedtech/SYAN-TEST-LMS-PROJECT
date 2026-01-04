import React, { useState, useEffect } from 'react';
import { Search, FileText, ChevronRight, Layout } from 'lucide-react';
import { fetchMockPapers, MockPaper } from '../services/mockPaperAdminService';

interface QuizControlsOverridePickerProps {
  onSelect: (paper: MockPaper) => void;
  selectedId?: string;
}

export const QuizControlsOverridePicker: React.FC<QuizControlsOverridePickerProps> = ({ onSelect, selectedId }) => {
  const [papers, setPapers] = useState<MockPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMockPapers({ pageSize: 100, status: 'all' }).then(res => {
      setPapers(res.items);
      setLoading(false);
    });
  }, []);

  const filtered = papers.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs mb-4">Target Assessments</h3>
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search exams..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold italic">No exams found.</div>
        ) : (
          filtered.map(paper => (
            <button
              key={paper.id}
              onClick={() => onSelect(paper)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                selectedId === paper.id 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className={selectedId === paper.id ? 'text-white' : 'text-slate-400'} />
                <div>
                  <p className="text-sm font-black line-clamp-1">{paper.title}</p>
                  <p className={`text-[10px] font-bold uppercase ${selectedId === paper.id ? 'text-white/70' : 'text-slate-400'}`}>{paper.targetProgramName || 'General'}</p>
                </div>
              </div>
              <ChevronRight size={16} className={selectedId === paper.id ? 'text-white' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
            </button>
          ))
        )}
      </div>
    </div>
  );
};