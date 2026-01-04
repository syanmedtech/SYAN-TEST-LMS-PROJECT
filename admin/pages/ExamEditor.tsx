
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, Globe, Lock, Info, 
  Settings, Clock, Target, ListChecks, CheckCircle2, AlertCircle
} from 'lucide-react';
import { getAdminExamById, saveAdminExam, AdminPaper } from '../services/examAdminService';

interface ExamEditorProps {
  examId: string | null;
  onBack: () => void;
}

export const ExamEditor: React.FC<ExamEditorProps> = ({ examId, onBack }) => {
  const [loading, setLoading] = useState(examId !== null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminPaper>>({
    title: '',
    description: '',
    durationMins: 60,
    difficulty: 'Medium',
    category: 'MBBS',
    instructions: '',
    attemptsAllowed: 1,
    isPublished: false,
    questionSource: { type: 'hierarchy', config: {} },
    questionCount: 0
  });

  useEffect(() => {
    if (examId) {
      getAdminExamById(examId).then(data => {
        if (data) setFormData(data);
        setLoading(false);
      });
    }
  }, [examId]);

  const handleSave = async () => {
    if (!formData.title || !formData.durationMins) {
      alert("Please fill in required fields (Title, Duration).");
      return;
    }
    setSaving(true);
    try {
      await saveAdminExam(examId, formData);
      alert("Exam saved successfully!");
      onBack();
    } catch (e) {
      alert("Failed to save exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400">Loading exam details...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {examId ? 'Edit Exam' : 'Create New Exam'}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{formData.title || 'Untitled Assessment'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              formData.isPublished 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            {formData.isPublished ? <Globe size={18} /> : <Lock size={18} />}
            {formData.isPublished ? 'Public' : 'Draft'}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 disabled:opacity-50 transition-all"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Exam'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-syan border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Info className="text-primary-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Exam Title*</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                  placeholder="e.g. Surgery Mock Grand Test 2024"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white min-h-[100px]"
                  placeholder="Briefly describe the scope of this exam..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Program / Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="MBBS">MBBS</option>
                    <option value="FCPS">FCPS</option>
                    <option value="NRE">NRE</option>
                    <option value="USMLE">USMLE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Difficulty</label>
                  <select 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
                    value={formData.difficulty}
                    onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Question Source Picker Placeholder */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-syan border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <ListChecks className="text-primary-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Question Content</h2>
            </div>
            <div className="p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-4">
              <p className="text-slate-500 text-sm">Select how you want to populate this exam.</p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setFormData({...formData, questionSource: { type: 'hierarchy', config: {} }})}
                  className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.questionSource?.type === 'hierarchy' ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-slate-100 text-slate-400'}`}
                >
                  Topic Hierarchy
                </button>
                <button 
                  className="px-6 py-3 rounded-xl text-sm font-bold border-2 border-slate-100 text-slate-300 cursor-not-allowed"
                >
                  Manual Select
                </button>
              </div>
              <div className="pt-4 max-w-xs mx-auto">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Target MCQ Count</label>
                 <input 
                    type="number" 
                    className="w-full text-center p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold text-2xl"
                    value={formData.questionCount}
                    onChange={e => setFormData({...formData, questionCount: parseInt(e.target.value) || 0})}
                 />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Scheduling Sidebar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-syan border border-slate-100 dark:border-slate-800 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-primary-500" /> Exam Rules
            </h3>
            
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                    value={formData.durationMins}
                    onChange={e => setFormData({...formData, durationMins: parseInt(e.target.value) || 0})}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempts Per Student</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                    value={formData.attemptsAllowed}
                    onChange={e => setFormData({...formData, attemptsAllowed: parseInt(e.target.value) || 1})}
                  />
               </div>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-syan border border-slate-100 dark:border-slate-800 space-y-4">
             <h3 className="font-bold text-slate-800 dark:text-white">Publishing Readiness</h3>
             <div className="space-y-3">
                <CheckItem label="Exam Title Present" checked={!!formData.title} />
                <CheckItem label="Duration Set" checked={(formData.durationMins || 0) > 0} />
                <CheckItem label="Question Goal > 0" checked={(formData.questionCount || 0) > 0} />
                <CheckItem label="Instructions Added" checked={!!formData.instructions} optional />
             </div>
             {(!formData.title || (formData.durationMins || 0) <= 0 || (formData.questionCount || 0) <= 0) && (
               <div className="p-3 bg-amber-50 rounded-xl flex gap-3 text-[10px] text-amber-700 font-bold border border-amber-100">
                  <AlertCircle size={16} /> Cannot publish until critical items are checked.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem = ({ label, checked, optional }: { label: string, checked: boolean, optional?: boolean }) => (
  <div className={`flex items-center justify-between p-2 rounded-lg ${checked ? 'text-emerald-600' : optional ? 'text-slate-400' : 'text-red-500'}`}>
    <span className="text-xs font-bold">{label}</span>
    {checked ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-20"></div>}
  </div>
);
