import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, Globe, Lock, CheckCircle2, 
  AlertCircle, Sparkles, FileText, Info, ListTree 
} from 'lucide-react';
import { MockPaper, fetchMockPaperById, saveMockPaper } from '../services/mockPaperAdminService';
import { MockPaperForm } from '../components/MockPaperForm';
import { SectionsBuilder } from '../components/SectionsBuilder';

interface MockPaperEditorProps {
  id: string | null;
  onBack: () => void;
}

export const MockPaperEditor: React.FC<MockPaperEditorProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(id !== null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'INFO' | 'STRUCTURE'>('INFO');
  const [formData, setFormData] = useState<Partial<MockPaper>>({
    title: '',
    description: '',
    durationMinutes: 0,
    status: 'draft',
    sections: []
  });

  useEffect(() => {
    if (id) {
      fetchMockPaperById(id).then(data => {
        if (data) setFormData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!formData.title || !formData.durationMinutes) {
      alert("Basic info (Title & Duration) is required to save.");
      return;
    }
    setSaving(true);
    
    // Auto-calculate summary statistics
    const sections = formData.sections || [];
    const totalSections = sections.length;
    const totalQuestions = sections.reduce((acc, s) => acc + (s.questionCount || 0), 0);

    try {
      await saveMockPaper(id, {
        ...formData,
        totalSections,
        totalQuestions
      });
      alert("Mock paper blueprint committed to repository!");
      onBack();
    } catch (e) {
      alert("Failed to save paper configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Validation Metrics
  const totalQuestions = formData.sections?.reduce((acc, s) => acc + (s.questionCount || 0), 0) || 0;
  const checks = {
    title: !!formData.title,
    duration: (formData.durationMinutes || 0) > 0,
    sections: (formData.sections?.length || 0) > 0,
    questions: totalQuestions > 0,
    sectionValidity: formData.sections?.every(s => s.questionCount > 0 && !!s.title) ?? true
  };

  const isPublishReady = Object.values(checks).every(Boolean);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-20 text-slate-400">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-6"></div>
      <p className="font-black tracking-widest uppercase text-xs">Accessing Assessment Schema...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {id ? 'Refine Mock Paper' : 'Design New Paper'}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formData.title || 'Draft Assessment Blueprint'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setFormData({ ...formData, status: formData.status === 'published' ? 'draft' : 'published' })}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${
              formData.status === 'published' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm shadow-emerald-100' 
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
            <Save size={18} /> {saving ? 'Processing...' : 'Save Assessment'}
          </button>
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-syan border border-slate-100 dark:border-slate-800 w-fit mx-auto md:mx-0">
        <button 
          onClick={() => setActiveTab('INFO')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'INFO' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Info size={16} /> General Info
        </button>
        <button 
          onClick={() => setActiveTab('STRUCTURE')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'STRUCTURE' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <ListTree size={16} /> Section Builder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-syan border border-slate-100 dark:border-slate-800">
             {activeTab === 'INFO' ? (
                <MockPaperForm 
                  data={formData} 
                  onChange={(updates) => setFormData({ ...formData, ...updates })} 
                />
             ) : (
                <SectionsBuilder 
                  sections={formData.sections || []} 
                  onChange={(sections) => setFormData({ ...formData, sections })} 
                />
             )}
          </div>
        </div>

        {/* Sidebar Summary & Validation */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-400" size={20} /> Readiness Scan
              </h3>
              
              <div className="space-y-4">
                <HealthItem label="Paper Metadata" checked={checks.title && checks.duration} />
                <HealthItem label="Sections Configured" checked={checks.sections} />
                <HealthItem label="Total Questions > 0" checked={checks.questions} />
                <HealthItem label="Section Validity" checked={checks.sectionValidity} />
                <HealthItem label="Safe for Launch" checked={isPublishReady} />
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Active Sections</span>
                    <span>{formData.sections?.length || 0}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Target MCQs</span>
                    <span className="text-primary-400">{totalQuestions}</span>
                 </div>
              </div>

              {!isPublishReady && formData.status === 'published' && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex gap-3 animate-slide-up">
                   <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                   <p className="text-[10px] font-black uppercase tracking-wide text-red-200 leading-relaxed">
                     Critical Validation Failed. Cannot launch assessment in current state.
                   </p>
                </div>
              )}
           </div>

           <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex gap-4">
                 <Info className="text-primary-500 flex-shrink-0" size={20} />
                 <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                   <strong>Blueprint Engine:</strong> Hierarchy and Tag strategies pick questions at start-time based on your configured range. Fixed strategy uses the exact question IDs you select.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HealthItem = ({ label, checked }: { label: string, checked: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${checked ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/5'}`}>
    <span>{label}</span>
    {checked ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-white/20"></div>}
  </div>
);