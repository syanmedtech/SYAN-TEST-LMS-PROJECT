import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, LayoutGrid
} from 'lucide-react';
import { MockPaper, fetchMockPapers, archiveMockPaper, duplicateMockPaper } from '../services/mockPaperAdminService';
import { saveTest, publishTest } from '../../services/qbankService';
import { getAttemptCountForTest } from '../services/attemptsAdminService';
import { BulkMockTestCreator } from '../components/BulkMockTestCreator';
import { CreateMockExamModal } from '../components/CreateMockExamModal';
import { MockPapersTable } from '../components/MockPapersTable';
import { QuestionPickerModal } from '../components/QuestionPickerModal';
import { AttemptListModal } from '../components/AttemptListModal';
import { MockTestLeaderboardModal } from '../components/MockTestLeaderboardModal';

interface MockTestManagerProps {
  onNavigate: (target: any) => void;
}

export const MockPapers: React.FC<MockTestManagerProps> = ({ onNavigate }) => {
  const [papers, setPapers] = useState<MockPaper[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modals state
  const [pickingForPaper, setPickingForPaper] = useState<MockPaper | null>(null);
  const [viewingAttemptsFor, setViewingAttemptsFor] = useState<{ id: string, title: string } | null>(null);
  const [viewingLeaderboardFor, setViewingLeaderboardFor] = useState<{ id: string, title: string } | null>(null);

  const loadData = async (reset = false) => {
    setLoading(true);
    try {
      const result = await fetchMockPapers({
        pageSize: 20,
        lastDoc: reset ? undefined : lastDoc,
        status: statusFilter,
        search: search
      });
      
      const newPapers = reset ? result.items : [...papers, ...result.items];
      setPapers(newPapers);
      setLastDoc(result.lastDoc);

      // Fetch attempt counts for these papers
      const counts: Record<string, number> = { ...attemptCounts };
      await Promise.all(result.items.map(async (p) => {
        if (counts[p.id] === undefined) {
           counts[p.id] = await getAttemptCountForTest(p.id);
        }
      }));
      setAttemptCounts(counts);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadData(true), 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleStatusToggle = async (id: string, current: string) => {
    const isPublished = current !== 'published';
    await publishTest(id, isPublished);
    loadData(true);
  };

  const handleDuplicate = async (paper: MockPaper) => {
    await duplicateMockPaper(paper);
    loadData(true);
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Archive this paper? It will be hidden from students.")) {
      await archiveMockPaper(id);
      loadData(true);
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleOpenPicker = (paper: MockPaper) => {
    setPickingForPaper(paper);
  };

  const handlePickerConfirm = async (ids: string[]) => {
    if (pickingForPaper) {
      setLoading(true);
      try {
        await saveTest(pickingForPaper.id, { 
          questionIds: ids,
          questions: [], 
          totalQuestions: ids.length
        });
        await loadData(true);
      } catch (e) {
        alert("Failed to update questions.");
      } finally {
        setLoading(false);
      }
    }
    setPickingForPaper(null);
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mock Exams</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design high-stakes simulations and practice assessments.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setShowBulkCreator(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold shadow-sm hover:border-primary-500 transition-all"
            >
                <LayoutGrid size={18} /> Bulk Create
            </button>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all"
            >
                <Plus size={20} /> Create New Exam
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search papers by title..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400 mr-2" />
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
            {['all', 'published', 'draft'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${statusFilter === s ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MockPapersTable 
        papers={papers} 
        loading={loading}
        onEdit={(id) => onNavigate({ view: 'ADMIN_MOCK_PAPER_EDITOR', id })}
        onDuplicate={handleDuplicate}
        onStatusToggle={handleStatusToggle}
        onArchive={handleArchive}
        onOpenPicker={handleOpenPicker}
        onOpenAttempts={(id) => {
          const p = papers.find(i => i.id === id);
          if (p) setViewingAttemptsFor({ id, title: p.title });
        }}
        onOpenLeaderboard={(id) => {
          const p = papers.find(i => i.id === id);
          if (p) setViewingLeaderboardFor({ id, title: p.title });
        }}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />

      {showBulkCreator && (
        <BulkMockTestCreator 
            onClose={() => setShowBulkCreator(false)}
            onComplete={() => {
                setShowBulkCreator(false);
                loadData(true);
            }}
        />
      )}

      {showCreateModal && (
        <CreateMockExamModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData(true);
          }}
        />
      )}

      {pickingForPaper && (
        <QuestionPickerModal 
          onClose={() => setPickingForPaper(null)}
          onConfirm={handlePickerConfirm}
          initialSelectedIds={(pickingForPaper as any).questionIds || []}
        />
      )}

      {viewingAttemptsFor && (
        <AttemptListModal 
          testId={viewingAttemptsFor.id}
          testTitle={viewingAttemptsFor.title}
          onClose={() => setViewingAttemptsFor(null)}
        />
      )}

      {viewingLeaderboardFor && (
        <MockTestLeaderboardModal 
          testId={viewingLeaderboardFor.id}
          testTitle={viewingLeaderboardFor.title}
          onClose={() => setViewingLeaderboardFor(null)}
        />
      )}
    </div>
  );
};