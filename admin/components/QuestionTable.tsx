
import React from 'react';
import { Edit, Copy, Eye, EyeOff, Archive, Trash2, CheckCircle, AlertCircle, Clock, Hash } from 'lucide-react';
import { QBankQuestion } from '../services/qbankAdminService';

interface QuestionTableProps {
  questions: QBankQuestion[];
  loading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (all: boolean) => void;
  onEdit: (q: QBankQuestion) => void;
  onDuplicate: (q: QBankQuestion) => void;
  onStatusToggle: (id: string, current: string) => void;
  onArchive: (id: string) => void;
}

export const QuestionTable: React.FC<QuestionTableProps> = ({ 
  questions, loading, selectedIds, onToggleSelect, onSelectAll, onEdit, onDuplicate, onStatusToggle, onArchive 
}) => {
  if (loading && questions.length === 0) return (
    <div className="py-24 flex flex-col items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-6"></div>
      <p className="font-black tracking-widest uppercase text-xs">Syncing Knowledge Base...</p>
    </div>
  );
  
  if (questions.length === 0) return (
    <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
      <Hash size={64} className="mx-auto text-slate-200 mb-6" />
      <h3 className="text-xl font-black text-slate-800 dark:text-white">Empty Repository</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-3">No questions found. Start building your bank by creating a new entry.</p>
    </div>
  );

  const allSelected = questions.length > 0 && selectedIds.size === questions.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-5 w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-5">Question Stem</th>
              <th className="px-6 py-5">Classification</th>
              <th className="px-6 py-5">Difficulty</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Updated</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-5">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedIds.has(q.id)}
                    onChange={() => onToggleSelect(q.id)}
                  />
                </td>
                <td className="px-6 py-5 max-w-md">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">{q.stem}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        {q.type}
                      </span>
                      {q.tags?.map(tag => (
                        <span key={tag} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex flex-col gap-1">
                     <p className="text-xs font-black text-slate-700 dark:text-slate-300">{q.subjectName || q.subjectId || 'Uncategorized'}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{q.topicName || q.topicId || 'N/A'}</p>
                   </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : 
                    q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 
                    'bg-red-50 text-red-600'
                  }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    q.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${q.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                    <Clock size={12} />
                    {new Date(q.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(q)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDuplicate(q)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => onStatusToggle(q.id, q.status)}
                      className={`p-2 rounded-xl transition-all ${q.status === 'published' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={q.status === 'published' ? "Unpublish" : "Publish"}
                    >
                      {q.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      onClick={() => onArchive(q.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Archive"
                    >
                      <Archive size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
