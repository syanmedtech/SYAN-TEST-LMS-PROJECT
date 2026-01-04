
import React, { useState, useEffect } from 'react';
import { QuestionFilters } from '../components/QuestionFilters';
import { QuestionTable } from '../components/QuestionTable';
import { QbankBulkImportModal } from '../components/QbankBulkImportModal';
import { 
  QBankQuestion, 
  fetchQuestions, 
  updateQuestionStatus, 
  bulkUpdateStatus, 
  duplicateQuestion 
} from '../services/qbankAdminService';
import { ChevronRight, X, CheckCircle, Trash2, Download } from 'lucide-react';

interface QuestionBankProps {
  onNavigate: (target: any) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ onNavigate }) => {
  const [questions, setQuestions] = useState<QBankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    type: 'all'
  });

  const loadData = async (reset = false) => {
    setLoading(true);
    try {
      const result = await fetchQuestions({
        pageSize: 20,
        lastDoc: reset ? undefined : lastDoc,
        filters: filters
      });

      let items = result.items;
      if (search) {
        items = items.filter(i => 
          i.stem.toLowerCase().includes(search.toLowerCase()) || 
          i.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
        );
      }

      setQuestions(reset ? items : [...questions, ...items]);
      setLastDoc(result.lastDoc);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [filters, search]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (all: boolean) => {
    if (all) setSelectedIds(new Set(questions.map(q => q.id)));
    else setSelectedIds(new Set());
  };

  const handleBulkStatus = async (status: 'published' | 'archived') => {
    if (selectedIds.size === 0) return;
    if (status === 'archived' && !window.confirm(`Archive ${selectedIds.size} questions?`)) return;
    
    setLoading(true);
    await bulkUpdateStatus(Array.from(selectedIds), status);
    setSelectedIds(new Set());
    loadData(true);
  };

  const handleStatusToggle = async (id: string, current: string) => {
    const next = current === 'published' ? 'draft' : 'published';
    await updateQuestionStatus(id, next as any);
    loadData(true);
  };

  const handleDuplicate = async (q: QBankQuestion) => {
    await duplicateQuestion(q);
    loadData(true);
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Archive this question? It will be hidden from students.")) {
      await updateQuestionStatus(id, 'archived');
      loadData(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Question Bank</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage the core medical content library and MCQ assets.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-primary-500 transition-all shadow-sm"
          >
            <Download size={16} className="rotate-180" /> Bulk Import (CSV)
          </button>
        </div>
      </div>

      <QuestionFilters 
        activeFilters={filters}
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        onCreate={() => onNavigate('ADMIN_QUESTION_EDITOR_NEW')}
      />

      {selectedIds.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 animate-slide-up">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-black text-sm">{selectedIds.size}</span>
            <span className="text-xs font-black uppercase tracking-widest">Selected Items</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleBulkStatus('published')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <CheckCircle size={14} /> Bulk Publish
            </button>
            <button 
              onClick={() => handleBulkStatus('archived')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <Trash2 size={14} /> Bulk Archive
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="p-2 text-white/30 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <QuestionTable 
        questions={questions} 
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onEdit={(q) => onNavigate({ view: 'ADMIN_QUESTION_EDITOR', id: q.id })}
        onDuplicate={handleDuplicate}
        onStatusToggle={handleStatusToggle}
        onArchive={handleArchive}
      />

      {lastDoc && !loading && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => loadData()}
            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all"
          >
            Load More Content <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showImportModal && (
        <QbankBulkImportModal 
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => loadData(true)}
        />
      )}
    </div>
  );
};
