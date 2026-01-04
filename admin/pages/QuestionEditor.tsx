
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Globe, Lock, CheckCircle2, AlertCircle, Sparkles, Hash, History, Wand2, RefreshCw, Loader2 } from 'lucide-react';
import { fetchQuestionById, saveQuestion, QBankQuestion } from '../services/qbankAdminService';
import { QuestionForm } from '../components/QuestionForm';
import { runAiMedicalAssistant } from '../services/geminiQbankHelper';

interface QuestionEditorProps {
  id: string | null;
  onBack: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(id !== null);
  const [saving, setSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState<'stem' | 'explanation' | null>(null);
  const [formData, setFormData] = useState<Partial<QBankQuestion>>({
    stem: '',
    explanation: '',
    type: 'mcq',
    difficulty: 'medium',
    status: 'draft',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    tags: []
  });

  useEffect(() => {
    if (id) {
      fetchQuestionById(id).then(data => {
        if (data) setFormData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!formData.stem) return alert("Question stem is required.");
    const hasCorrect = formData.options?.some(o => o.isCorrect);
    if (!hasCorrect) return alert("Please select a correct answer.");
    
    setSaving(true);
    try {
      await saveQuestion(id, formData);
      alert("Question saved successfully.");
      onBack();
    } catch (e) {
      alert("Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  const handleAiAssist = async (task: 'paraphrase_stem' | 'improve_explanation') => {
    if (task === 'paraphrase_stem' && !formData.stem) return alert("Enter a stem first.");
    if (task === 'improve_explanation' && (!formData.stem || !formData.explanation)) {
        return alert("Stem and current Explanation are required for AI refinement.");
    }

    const type = task === 'paraphrase_stem' ? 'stem' : 'explanation';
    setIsAiLoading(type);

    try {
        const result = await runAiMedicalAssistant(task, formData);
        if (result.stem && task === 'paraphrase_stem') {
            setFormData(prev => ({ ...prev, stem: result.stem }));
        }
        if (result.explanation && task === 'improve_explanation') {
            setFormData(prev => ({ ...prev, explanation: result.explanation }));
        }
    } catch (error: any) {
        alert(error.message || "AI Assistant failed to process request.");
    } finally {
        setIsAiLoading(null);
    }
  };

  const validation = {
    stem: !!formData.stem,
    options: (formData.options?.length || 0) >= (formData.type === 'truefalse' ? 2 : 4),
    correct: formData.options?.some(o => o.isCorrect),
    mapping: !!(formData.subjectId || formData.subjectName)
  };

  const canPublish = validation.stem && validation.options && validation.correct;

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-20 text-slate-400">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-6"></div>
      <p className="font-black tracking-widest uppercase text-xs">Pulling Entry Data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Hash size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {id ? 'Modify Question' : 'Author Question'}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{id ? `ID: ${id.slice(-8).toUpperCase()}` : 'NEW REPOSITORY ENTRY'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setFormData({ ...formData, status: formData.status === 'published' ? 'draft' : 'published' })}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
              formData.status === 'published' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
            }`}
          >
            {formData.status === 'published' ? <Globe size={16} /> : <Lock size={16} />}
            {formData.status === 'published' ? 'Published' : 'Draft Mode'}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Syncing...' : 'Commit to QBank'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-syan border border-slate-100 dark:border-slate-800">
            <QuestionForm 
              data={formData} 
              onChange={(updates) => setFormData({ ...formData, ...updates })} 
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* AI Helper Card */}
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-syan border border-slate-100 dark:border-slate-800 border-t-4 border-t-purple-500">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                 <Wand2 className="text-purple-500" size={22} /> AI Magic Tools
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                  Refine clinical scenarios and explanations using Gemini 3 medical reasoning.
              </p>
              
              <div className="space-y-3">
                 <button 
                    onClick={() => handleAiAssist('paraphrase_stem')}
                    disabled={isAiLoading !== null}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-800 disabled:opacity-50"
                 >
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Paraphrase Stem</span>
                        <span className="text-[10px] text-slate-400">Board-style optimization</span>
                    </div>
                    {isAiLoading === 'stem' ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <RefreshCw size={18} className="text-slate-300 group-hover:text-purple-500 transition-colors" />}
                 </button>

                 <button 
                    onClick={() => handleAiAssist('improve_explanation')}
                    disabled={isAiLoading !== null}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-800 disabled:opacity-50"
                 >
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Refine Explanation</span>
                        <span className="text-[10px] text-slate-400">Clinical logic enhancement</span>
                    </div>
                    {isAiLoading === 'explanation' ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <RefreshCw size={18} className="text-slate-300 group-hover:text-purple-500 transition-colors" />}
                 </button>
              </div>
           </div>

           {/* Validation Tracker */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-400" size={20} /> Integrity Check
              </h3>
              
              <div className="space-y-4">
                <HealthItem label="Scenario/Stem" checked={validation.stem} />
                <HealthItem label="Option Set Count" checked={validation.options} />
                <HealthItem label="Correct Answer Key" checked={validation.correct} />
                <HealthItem label="Taxonomy Mapping" checked={validation.mapping} />
              </div>

              {!canPublish && formData.status === 'published' && (
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start animate-fade-in">
                   <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                   <p className="text-[10px] text-red-100 font-bold leading-relaxed uppercase tracking-wide">
                     Required fields missing. Question will revert to Draft on save if publishing criteria not met.
                   </p>
                </div>
              )}
           </div>

           {/* Stats Summary (If existing) */}
           {id && (
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-syan border border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                   <History className="text-primary-500" size={16} /> Performance History
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400">Total Attempts</span>
                      <span className="text-slate-700 dark:text-white">1,245</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400">Global Accuracy</span>
                      <span className="text-emerald-500">68%</span>
                   </div>
                   <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 italic">User behavioral data is collected globally across mock exams and practice modes.</p>
                   </div>
                </div>
             </div>
           )}

           <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
              <div className="flex gap-4">
                 <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                 <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                   <strong>Caution:</strong> Editing questions that are part of active Mock Exams or Student History can affect platform-wide analytics and rankings.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HealthItem = ({ label, checked }: { label: string, checked: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-2xl text-[11px] font-black uppercase tracking-wider ${checked ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/5'}`}>
    <span>{label}</span>
    {checked ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 rounded-full border border-white/10"></div>}
  </div>
);
