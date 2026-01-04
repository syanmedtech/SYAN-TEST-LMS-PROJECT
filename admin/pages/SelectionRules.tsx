
import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Settings2, 
  Save, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Layout
} from 'lucide-react';
import { 
  SelectionRules, 
  DEFAULT_RULES, 
  fetchGlobalRules, 
  saveGlobalRules,
  fetchExamOverride,
  saveExamOverride,
  resetExamOverride
} from '../services/selectionRulesService';
import { SelectionRulesForm } from '../components/SelectionRulesForm';
import { ExamOverridePicker } from '../components/ExamOverridePicker';
import { MockPaper } from '../services/mockPaperAdminService';

export const SelectionRulesPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'GLOBAL' | 'OVERRIDE'>('GLOBAL');
  const [globalRules, setGlobalRules] = useState<SelectionRules>(DEFAULT_RULES);
  const [selectedPaper, setSelectedPaper] = useState<MockPaper | null>(null);
  const [overrides, setOverrides] = useState<Partial<SelectionRules>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchGlobalRules().then(res => {
      setGlobalRules(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedPaper) {
      fetchExamOverride(selectedPaper.id).then(res => {
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
        // Validate
        const total = globalRules.difficultyMix.easy + globalRules.difficultyMix.medium + globalRules.difficultyMix.hard;
        if (total !== 100) throw new Error("Difficulty mix must equal 100%");

        await saveGlobalRules(globalRules, 'admin_001'); // In real app use auth hook
        showToast('success', 'Global rules saved successfully!');
      } else if (selectedPaper) {
        await saveExamOverride(selectedPaper.id, overrides, 'admin_001');
        showToast('success', `Overrides saved for ${selectedPaper.title}`);
      }
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset these rules to system defaults?")) return;
    if (activeMode === 'GLOBAL') {
      setGlobalRules(DEFAULT_RULES);
    } else if (selectedPaper) {
      await resetExamOverride(selectedPaper.id, 'admin_001');
      setOverrides({});
      showToast('success', 'Overrides cleared. This exam will now inherit global rules.');
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Rules Engine...</div>;

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
            <Layout size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Selection Rules</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Algorithm & Resource Overrides</p>
          </div>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveMode('GLOBAL')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeMode === 'GLOBAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Globe size={16} /> GLOBAL RULES
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
                <FileText size={64} className="mx-auto text-slate-100" />
                <h3 className="text-xl font-black text-slate-400">Select an exam from the list to manage overrides</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">Overrides allow specific exams to deviate from the global selection logic.</p>
             </div>
           ) : (
             <SelectionRulesForm 
               rules={activeMode === 'GLOBAL' ? globalRules : { ...globalRules, ...overrides }}
               isOverride={activeMode === 'OVERRIDE'}
               onChange={(updates) => {
                 if (activeMode === 'GLOBAL') setGlobalRules(prev => ({ ...prev, ...updates }));
                 else setOverrides(prev => ({ ...prev, ...updates }));
               }}
             />
           )}
        </div>

        {/* Right Column: Context/Picker */}
        <div className="lg:col-span-4 space-y-6">
           {activeMode === 'OVERRIDE' ? (
             <div className="h-[70vh]">
               <ExamOverridePicker 
                 selectedId={selectedPaper?.id} 
                 onSelect={setSelectedPaper} 
               />
             </div>
           ) : (
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                   <Settings2 className="text-yellow-400" size={20} /> Selection Logic
                </h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">
                  Global rules apply to all Mock Papers and Practice Quizzes unless an explicit override is set for a specific exam.
                </p>
                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                      <span>Status</span>
                      <span className="text-emerald-400">Live & Enforced</span>
                   </div>
                   <div className="flex justify-between text-xs font-black uppercase text-slate-500">
                      <span>Published Pool</span>
                      <span className="text-emerald-400">Forced ON</span>
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
