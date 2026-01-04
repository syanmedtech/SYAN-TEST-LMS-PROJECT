
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, Globe, Lock, Info, 
  Settings, Clock, Target, ListChecks, CheckCircle2, 
  AlertCircle, Sparkles, Video, Layout, ListTree, Eye
} from 'lucide-react';
import { fetchVideoCourseById, saveVideoCourse, VideoCourse, Module } from '../services/videoCourseAdminService';
import { VideoCourseForm } from '../components/VideoCourseForm';
import { CurriculumBuilder } from '../components/CurriculumBuilder';

interface VideoCourseEditorProps {
  id: string | null;
  onBack: () => void;
}

export const VideoCourseEditor: React.FC<VideoCourseEditorProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(id !== null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'INFO' | 'CURRICULUM'>('INFO');
  const [formData, setFormData] = useState<Partial<VideoCourse>>({
    title: '',
    subtitle: '',
    description: '',
    status: 'draft',
    level: 'Intermediate',
    language: 'English',
    curriculum: []
  });

  useEffect(() => {
    if (id) {
      fetchVideoCourseById(id).then(data => {
        if (data) setFormData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!formData.title) {
      alert("Course Title is required.");
      return;
    }
    setSaving(true);
    
    // Auto-calculate stats before save
    const curriculum = formData.curriculum || [];
    const totalModules = curriculum.length;
    const totalLessons = curriculum.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);

    try {
      const savedId = await saveVideoCourse(id, {
        ...formData,
        totalModules,
        totalLessons
      });
      alert("Course saved successfully!");
      if (!id) {
        // If it was a new course, we might want to update the ID in state so uploads work
        setFormData(prev => ({ ...prev, id: savedId }));
      }
      onBack();
    } catch (e) {
      alert("Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const hasCurriculum = (formData.curriculum?.length || 0) > 0;
  const hasLessons = formData.curriculum?.some(m => m.lessons.length > 0);

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Syncing catalog data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Video size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {id ? 'Update Course' : 'Create Course'}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formData.title || 'Drafting Lecture Series'}</p>
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
            <Save size={18} /> {saving ? 'Saving...' : 'Sync Catalog'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-syan border border-slate-100 dark:border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab('INFO')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'INFO' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Basic Info
        </button>
        <button 
          onClick={() => setActiveTab('CURRICULUM')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'CURRICULUM' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Curriculum Builder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-syan border border-slate-100 dark:border-slate-800">
             {activeTab === 'INFO' ? (
                <VideoCourseForm 
                  data={formData} 
                  onChange={(updates) => setFormData({ ...formData, ...updates })} 
                />
             ) : (
                <CurriculumBuilder 
                  curriculum={formData.curriculum || []} 
                  onChange={(curriculum) => setFormData({ ...formData, curriculum })}
                  courseId={id || undefined}
                />
             )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* Preview Card */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-400" size={20} /> Content Health
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <HealthItem label="Basic Information" checked={!!formData.title && !!formData.description} />
                  <HealthItem label="Modules Defined" checked={hasCurriculum} />
                  <HealthItem label="Lesson Content" checked={hasLessons} />
                  <HealthItem label="Ready to Publish" checked={!!formData.title && hasCurriculum && hasLessons} />
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Modules</span>
                      <span className="font-black">{formData.curriculum?.length || 0}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Lessons</span>
                      <span className="font-black">{formData.curriculum?.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
                   </div>
                </div>

                <button 
                  disabled={!id}
                  className="w-full py-4 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                >
                  <Eye size={16} /> Preview as Student
                </button>
              </div>
           </div>

           <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
              <div className="flex gap-4">
                 <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                 <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                   <strong>Publication Policy:</strong> Courses must have at least one module and one lesson before they can be marked as "Published". Published courses are immediately visible to all eligible students in the Course Catalog.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HealthItem = ({ label, checked }: { label: string, checked: boolean | undefined }) => (
  <div className={`flex items-center justify-between p-3 rounded-2xl text-[11px] font-black uppercase tracking-wider ${checked ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/5'}`}>
    <span>{label}</span>
    {checked ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 rounded-full border border-white/10"></div>}
  </div>
);
