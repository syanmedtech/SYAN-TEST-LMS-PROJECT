import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Settings2, 
  Save, 
  RotateCcw, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Layout,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  QuizControls, 
  DEFAULT_QUIZ_CONTROLS, 
  fetchGlobalQuizControls, 
  saveGlobalQuizControls,
  fetchQuizControlOverride,
  saveQuizControlOverride,
  resetQuizControlOverride
} from '../services/quizControlsService';
import { QuizControlsForm } from '../components/QuizControlsForm';
import { QuizControlsOverridePicker } from '../components/QuizControlsOverridePicker';
import { MockPaper } from '../services/mockPaperAdminService';

export const QuizControlsPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'GLOBAL' | 'OVERRIDE'>('GLOBAL');
  const [globalControls, setGlobalControls] = useState<QuizControls>(DEFAULT_QUIZ_CONTROLS);
  const [selectedPaper, setSelectedPaper] = useState<MockPaper | null>(null);
  const [overrides, setOverrides] = useState<Partial<QuizControls>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchGlobalQuizControls().then(res => {
      setGlobalControls(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedPaper) {
      fetchQuizControlOverride(selectedPaper.id).then(res => {
        setOverrides(res || {});
      });
    }
  }, [selectedPaper]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeMode === 'GLOBAL') {
        await saveGlobalQuizControls(globalControls, 'admin_001');
        showToast('success', 'Global quiz controls updated successfully!');
      } else if (selectedPaper) {
        await saveQuizControlOverride(selectedPaper.id, overrides, 'admin_001');
        showToast('success', `Overrides saved for ${selectedPaper.title}`);
      }
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset these controls to platform defaults?")) return;
    if (activeMode === 'GLOBAL') {
      setGlobalControls(DEFAULT_QUIZ_CONTROLS);
    } else if (selectedPaper) {
      await resetQuizControlOverride(selectedPaper.id, 'admin_001');
      setOverrides({});
      showToast('success', 'Overrides cleared. This exam will now inherit global rules.');
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">
      Initializing Control Schema...
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in relative pb-32">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-red-600 text-white border-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-black tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Settings2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Quiz Controls</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Governance & Anti-Cheat Rules</p>
          </div>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveMode('GLOBAL')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeMode === 'GLOBAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Globe size={16} /> GLOBAL CONTROLS
          </button>
          <button 
            onClick={() => setActiveMode('OVERRIDE')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeMode === 'OVERRIDE' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <FileText size={16} /> EXAM OVERRIDES
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-syan border border-slate-100 dark:border-slate-800">
           {activeMode === 'OVERRIDE' && !selectedPaper ? (
             <div className="py-20 text-center space-y-4">
                <ShieldCheck size={64} className="mx-auto text-slate-100" />
                <h3 className="text-xl font-black text-slate-400">Select an assessment to define secure overrides</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">Exam-specific rules override global settings for higher-stakes testing.</p>
             </div>
           ) : (
             <QuizControlsForm 
               controls={activeMode === 'GLOBAL' ? globalControls : { ...globalControls, ...overrides }}
               isOverride={activeMode === 'OVERRIDE'}
               onChange={(updates) => {
                 if (activeMode === 'GLOBAL') setGlobalControls(prev => ({ ...prev, ...updates }));
                 else setOverrides(prev => ({ ...prev, ...updates }));
               }}
             />
           )}
        </div>

        {/* Right Column: Context/Picker */}
        <div className="lg:col-span-4 space-y-6">
           {activeMode === 'OVERRIDE' ? (
             <div className="h-[70vh]">
               <QuizControlsOverridePicker 
                 selectedId={selectedPaper?.id} 
                 onSelect={setSelectedPaper} 
               />
             </div>
           ) : (
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                   <Zap className="text-yellow-400" size={20} /> Governance
                </h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
                  Platform-wide rules enforce standard behavior for all quizzes. Use overrides for high-stakes clinical simulations.
                </p>
                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                      <span>Integrity Engine</span>
                      <span className="text-emerald-400">Active</span>
                   </div>
                   <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                      <span>Proctoring Support</span>
                      <span className="text-primary-400">V2.4 Enabled</span>
                   </div>
                </div>
             </div>
           )}

           {/* Actions */}
           {(activeMode === 'GLOBAL' || selectedPaper) && (
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-[2rem] font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  <Save size={18} /> {saving ? 'SYNCING CONFIG...' : 'COMMIT CHANGES'}
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 rounded-[2rem] font-black hover:border-red-500 hover:text-red-500 transition-all"
                >
                  <RotateCcw size={18} /> RESET TO DEFAULTS
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};