
import React from 'react';
import { Save, Archive, ArrowUp, ArrowDown, Info, Hash, Type } from 'lucide-react';
import { HierarchyNode } from '../services/hierarchyService';

interface HierarchyEditorProps {
  node: HierarchyNode;
  onSave: (data: Partial<HierarchyNode>) => void;
  onArchive: () => void;
  isSaving: boolean;
}

export const HierarchyEditor: React.FC<HierarchyEditorProps> = ({ node, onSave, onArchive, isSaving }) => {
  const [formData, setFormData] = React.useState<Partial<HierarchyNode>>(node);

  React.useEffect(() => {
    setFormData(node);
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 p-8 animate-fade-in sticky top-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
        <div className={`p-3 rounded-2xl ${
          node.type === 'subject' ? 'bg-primary-50 text-primary-600' : 
          node.type === 'topic' ? 'bg-syan-orange/10 text-syan-orange' : 
          'bg-syan-teal/10 text-syan-teal'
        }`}>
          <Info size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white capitalize">Edit {node.type}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{node.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
          <input 
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            placeholder="Display Name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
          <textarea 
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white min-h-[100px]"
            placeholder="Optional context for this node..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="number"
                value={formData.sortOrder || 0}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon Name</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={formData.icon || ''}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                placeholder="Lucide icon name"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex gap-3">
          <button 
            type="submit"
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save size={18} /> {isSaving ? 'Syncing...' : 'Save Changes'}
          </button>
          <button 
            type="button"
            onClick={onArchive}
            className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Archive Node"
          >
            <Archive size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
