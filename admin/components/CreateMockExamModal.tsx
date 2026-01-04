import React, { useState } from 'react';
import { X, Save, FileText, Clock, GraduationCap, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { saveTest } from '../../services/qbankService';
import { MockTest } from '../../types';

interface CreateMockExamModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMockExamModal: React.FC<CreateMockExamModalProps> = ({ onClose, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    programId: 'MBBS',
    overallTimeLimitMins: 60,
    maxAttempts: 1
  });

  const programs = ['MBBS', 'FCPS', 'NRE', 'USMLE', 'NLE', 'MRCP'];

  const validate = () => {
    if (!formData.title.trim()) return "Exam title is required.";
    if (!formData.programId) return "Target program is required.";
    if (formData.overallTimeLimitMins <= 0) return "Duration must be greater than zero.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setIsSaving(true);
    try {
      const testId = `test_${Date.now()}`;
      const payload: Partial<MockTest> = {
        id: testId,
        title: formData.title,
        description: formData.description,
        programId: formData.programId,
        durationMins: formData.overallTimeLimitMins,
        maxAttempts: formData.maxAttempts,
        type: 'MOCK',
        status: 'draft',
        archived: false,
        questions: [],
        createdAt: new Date().toISOString()
      };

      await saveTest(testId, payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to create exam. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Create Mock Exam</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Author a new assessment blueprint</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Title*</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Surgery Final Grand Mock 2024"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief overview of the assessment scope..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Program*</label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={formData.programId}
                  onChange={e => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold appearance-none cursor-pointer"
                >
                  {programs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Minutes)*</label>
              <div className="relative">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number"
                  required
                  min="1"
                  value={formData.overallTimeLimitMins}
                  onChange={e => setFormData({ ...formData, overallTimeLimitMins: parseInt(e.target.value) || 0 })}
                  className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Attempts</label>
              <input 
                type="number"
                min="1"
                value={formData.maxAttempts}
                onChange={e => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3 text-xs text-blue-700 dark:text-blue-300 font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <p>New exams are created as <strong>Drafts</strong>. You can add sections and questions later from the main manager table.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              Initialize Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};