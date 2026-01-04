import React from 'react';
import { 
  Edit, Copy, Eye, EyeOff, Archive, 
  FileText, Layers, Clock, CheckCircle, 
  AlertCircle, ChevronRight, MoreVertical, List, Users, Share2, Trophy
} from 'lucide-react';
import { MockPaper } from '../services/mockPaperAdminService';

interface MockPapersTableProps {
  papers: MockPaper[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDuplicate: (paper: MockPaper) => void;
  onStatusToggle: (id: string, current: string) => void;
  onArchive: (id: string) => void;
  onOpenPicker: (paper: MockPaper) => void;
  onOpenAttempts: (testId: string) => void;
  onOpenLeaderboard: (testId: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export const MockPapersTable: React.FC<MockPapersTableProps> = ({ 
  papers, loading, onEdit, onDuplicate, onStatusToggle, onArchive, onOpenPicker, onOpenAttempts, onOpenLeaderboard, selectedIds, onToggleSelect
}) => {
  if (loading && papers.length === 0) return (
    <div className="py-24 flex flex-col items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-6"></div>
      <p className="font-black tracking-widest uppercase text-xs">Accessing Exam Repository...</p>
    </div>
  );
  
  if (papers.length === 0) return (
    <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
      <FileText size={64} className="mx-auto text-slate-200 mb-6" />
      <h3 className="text-xl font-black text-slate-800 dark:text-white">No Mock Papers</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-3">Ready to author your first assessment? Click "Create Mock Paper" to begin.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-5 w-12">
                {/* Header checkbox logic would go here if needed */}
              </th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Title / Program</th>
              <th className="px-8 py-5">Type</th>
              <th className="px-8 py-5 text-center">Max Attempts</th>
              <th className="px-8 py-5 text-center">Questions</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {papers.map((paper) => {
              /* Fixed: Removed type cast for questionIds and questions as they are now defined in MockPaper interface */
              const qCount = paper.questionIds?.length || paper.questions?.length || paper.totalQuestions || 0;
              
              return (
                <tr key={paper.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedIds.has(paper.id)}
                      onChange={() => onToggleSelect(paper.id)}
                    />
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      paper.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${paper.status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-black text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{paper.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{paper.targetProgramName || 'General Program'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                      MOCK
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-xs font-bold text-slate-600 dark:text-slate-400">
                    {/* Fixed: Removed type cast for maxAttempts */}
                    {paper.maxAttempts || 1}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                      <List size={14} className="text-emerald-500" /> {qCount}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onOpenLeaderboard(paper.id)}
                        className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-[10px] font-black uppercase tracking-widest text-yellow-600 hover:text-yellow-700 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Trophy size={12} /> Rankings
                      </button>
                      <button 
                        onClick={() => onOpenAttempts(paper.id)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-600 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Users size={12} /> Attempts
                      </button>
                      <button 
                        onClick={() => onOpenPicker(paper)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <FileText size={12} /> Questions
                      </button>
                      <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mx-1"></div>
                      <button onClick={() => alert("Share Link Copied!")} className="p-2 text-slate-300 hover:text-primary-600 transition-all"><Share2 size={16}/></button>
                      <button onClick={() => onEdit(paper.id)} className="p-2 text-slate-300 hover:text-primary-600 transition-all"><Edit size={16}/></button>
                      <button onClick={() => onDuplicate(paper)} className="p-2 text-slate-300 hover:text-blue-500 transition-all"><Copy size={16}/></button>
                      <button onClick={() => onArchive(paper.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Archive size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
