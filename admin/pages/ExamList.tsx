
import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, 
  Eye, EyeOff, MoreVertical, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { getAdminExams, AdminPaper, togglePublishExam, deleteAdminExam, duplicateAdminExam } from '../services/examAdminService';

interface ExamListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({ onEdit, onCreate }) => {
  const [exams, setExams] = useState<AdminPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await getAdminExams();
      setExams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await togglePublishExam(id, !currentStatus);
    loadExams();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this exam permanently?")) {
      await deleteAdminExam(id);
      loadExams();
    }
  };

  const handleDuplicate = async (exam: AdminPaper) => {
    await duplicateAdminExam(exam);
    loadExams();
  };

  const filtered = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'PUBLISHED' ? e.isPublished : !e.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Exam Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage official mock papers and assessments.</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all"
        >
          <Plus size={20} /> Create New Exam
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search exams by title..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400 mr-2" />
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
              {['ALL', 'PUBLISHED', 'DRAFT'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s as any)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === s ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Exam Details</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4 text-center">Questions</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium">Fetching exam library...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium">No exams found matching criteria.</td></tr>
              ) : (
                filtered.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{exam.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">Updated: {new Date(exam.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{exam.category || 'MBBS'}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{exam.questionCount}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-1 mt-3">
                      <Clock size={14} /> {exam.durationMins}m
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        exam.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${exam.isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                        {exam.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onEdit(exam.id)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDuplicate(exam)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Duplicate"
                        >
                          <Copy size={18} />
                        </button>
                        <button 
                          onClick={() => handleTogglePublish(exam.id, exam.isPublished)}
                          className={`p-2 rounded-lg transition-all ${exam.isPublished ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={exam.isPublished ? "Unpublish" : "Publish"}
                        >
                          {exam.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
