import React, { useState, useEffect } from 'react';
import { 
  fetchTemplates, 
  duplicateTemplate, 
  archiveTemplate, 
  setTemplateActive, 
  NoteTemplate 
} from '../services/notesTemplateService';
import { NotesTemplateEditor } from '../components/NotesTemplateEditor';
import { 
  FileText, Plus, Search, Edit, Trash2, Copy, 
  CheckCircle, Globe, History, AlertTriangle, RefreshCw, Zap
} from 'lucide-react';
import { FEATURES } from '../../config/features';

export const NotesTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(FEATURES.notesTemplateEnabled);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFeature = () => {
    const newState = !isFeatureEnabled;
    setIsFeatureEnabled(newState);
    // In a real app, you would persist this to /settings/app or feature service
    alert(`Feature flag updated: ${newState ? 'ENABLED' : 'DISABLED'} for student app.`);
  };

  const handleDuplicate = async (tpl: NoteTemplate) => {
    await duplicateTemplate(tpl);
    loadData();
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Archive this template? Active students won't see it for new notes.")) {
      await archiveTemplate(id);
      loadData();
    }
  };

  const handleActivate = async (id: string, rootId: string) => {
    if (window.confirm("Set this version as the primary active template? Previous active versions will be deactivated.")) {
      await setTemplateActive(id, rootId);
      loadData();
    }
  };

  const filtered = templates.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Notes Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure structured formats for students to use when taking notes.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleToggleFeature}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
              isFeatureEnabled 
                ? 'bg-primary-50 border-primary-100 text-primary-600' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
            }`}
          >
            <Zap size={14} fill={isFeatureEnabled ? 'currentColor' : 'none'} />
            Student UI: {isFeatureEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
          
          <button 
            onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all"
          >
            <Plus size={20} /> Create Template
          </button>
        </div>
      </div>

      {templates.length === 0 && !loading ? (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <FileText size={64} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white">No Templates Found</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-3">Start by creating a structured template for clinical case notes.</p>
          <button 
             onClick={() => setShowEditor(true)}
             className="mt-8 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Add First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tpl) => (
            <div key={tpl.id} className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-syan border-2 transition-all group relative overflow-hidden ${tpl.isActive ? 'border-primary-500/30' : 'border-slate-50 dark:border-slate-800 hover:border-primary-500/20'}`}>
              
              {tpl.isActive && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white p-2 rounded-bl-2xl">
                  <Globe size={14} />
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tpl.templateType === 'clinical' ? 'bg-amber-50 text-amber-600' : 'bg-primary-50 text-primary-600'}`}>
                  <FileText size={28} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingTemplate(tpl); setShowEditor(true); }}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit New Version"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDuplicate(tpl)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Duplicate"
                  >
                    <Copy size={18} />
                  </button>
                  {!tpl.isActive && (
                    <button 
                      onClick={() => handleActivate(tpl.id, tpl.rootId || tpl.id)}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Set Active"
                    >
                      <Globe size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleArchive(tpl.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Archive"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2">{tpl.title}</h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">v{tpl.version}</span>
                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{tpl.templateType}</span>
                {tpl.isActive && <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Active</span>}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800 mt-auto">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <History size={12} />
                  {new Date(tpl.updatedAt).toLocaleDateString()}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {tpl.sections?.length || 0} Sections
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <NotesTemplateEditor 
          template={editingTemplate}
          onClose={() => setShowEditor(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
};
