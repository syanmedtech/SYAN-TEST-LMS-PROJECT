
import React, { useState, useEffect } from 'react';
import { NoteTemplate, NoteSection, saveTemplate, SectionFormat } from '../services/notesTemplateService';
import { 
  X, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, 
  Save, Layout, Type, List, Table as TableIcon, Layers, Info
} from 'lucide-react';
// Import NotesTemplatePreview to fix 'Cannot find name' error
import { NotesTemplatePreview } from './NotesTemplatePreview';

interface Props {
  template: Partial<NoteTemplate> | null;
  onClose: () => void;
  onSave: () => void;
}

export const NotesTemplateEditor: React.FC<Props> = ({ template, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<NoteTemplate>>({
    title: '',
    templateType: 'clinical',
    sections: [],
    isActive: false,
    version: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) setFormData(template);
  }, [template]);

  const addSection = () => {
    const newSection: NoteSection = {
      id: Math.random().toString(36).substr(2, 9),
      heading: '',
      format: 'paragraph',
      isRequired: false
    };
    setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
  };

  const removeSection = (id: string) => {
    setFormData(prev => ({ ...prev, sections: prev.sections?.filter(s => s.id !== id) }));
  };

  const updateSection = (id: string, updates: Partial<NoteSection>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...(formData.sections || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setFormData(prev => ({ ...prev, sections }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("Title is required.");
    if (!formData.sections?.length) return alert("At least one section is required.");
    
    setIsSaving(true);
    try {
      await saveTemplate(formData);
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg">
              <Layout size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {template?.id ? `Edit Template (v${template.version})` : 'New Clinical Template'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Define structured data points</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Title*</label>
                <input 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Myocardial Infarction Detailed Note"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={formData.templateType}
                    onChange={e => setFormData({ ...formData, templateType: e.target.value as any })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                  >
                    <option value="clinical">Clinical Vignette</option>
                    <option value="notes">General Study Notes</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mt-4">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-600 dark:text-slate-400">Published (v{template?.isActive && template.version ? template.version + 1 : formData.version})</label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Layers size={18} className="text-primary-600" /> Structure Design
                </h3>
                <button 
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-100 transition-all"
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>

              <div className="space-y-4">
                {formData.sections?.map((section, idx) => (
                  <div key={section.id} className="bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up">
                    <div className="p-4 flex items-center gap-4">
                      <div className="text-slate-300 cursor-grab"><GripVertical size={18} /></div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                          <input 
                            value={section.heading}
                            onChange={e => updateSection(section.id, { heading: e.target.value })}
                            placeholder="Section Heading (e.g. Clinical Presentation)"
                            className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <select 
                            value={section.format}
                            onChange={e => updateSection(section.id, { format: e.target.value as SectionFormat })}
                            className="w-full bg-white dark:bg-slate-900 p-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight"
                          >
                            <option value="paragraph">Paragraph</option>
                            <option value="bullets">Bullets</option>
                            <option value="table">Table</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                        <div className="md:col-span-3 flex items-center gap-2 px-2">
                          <input 
                            type="checkbox" 
                            id={`req-${section.id}`}
                            checked={section.isRequired}
                            onChange={e => updateSection(section.id, { isRequired: e.target.checked })}
                          />
                          <label htmlFor={`req-${section.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Required</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronUp size={16}/></button>
                        <button type="button" onClick={() => moveSection(idx, 'down')} disabled={idx === (formData.sections?.length || 0) - 1} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronDown size={16}/></button>
                        <button type="button" onClick={() => removeSection(section.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Preview */}
          <div className="hidden lg:block w-96 bg-slate-50 dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800 p-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/30 flex gap-3">
                <Info size={20} className="text-primary-600 flex-shrink-0" />
                <p className="text-[10px] text-primary-700 dark:text-primary-400 leading-relaxed font-medium uppercase tracking-tight">
                  Students will see this layout when creating or editing clinical notes for relevant topics.
                </p>
              </div>
              
              <div className="scale-90 origin-top h-[600px]">
                <NotesTemplatePreview sections={formData.sections || []} title={formData.title || ''} />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-white rounded-xl">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
            {template?.id && template.isActive ? 'Save New Version' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin h-5 w-5 ${className}`} viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
