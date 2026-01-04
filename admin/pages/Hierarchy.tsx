
import React, { useState, useEffect } from 'react';
import { Hash, ChevronDown, ChevronUp, Layers, Plus, Star, ShieldCheck } from 'lucide-react';
import { HierarchyToolbar } from '../components/HierarchyToolbar';
import { HierarchyTree } from '../components/HierarchyTree';
import { HierarchyEditor } from '../components/HierarchyEditor';
import { ResolveLinksPanel } from '../components/ResolveLinksPanel';
import { 
  HierarchyNode, 
  fetchSubjects, 
  saveNode, 
  archiveNode, 
  HierarchyType,
  fetchTaxonomies,
  createTaxonomy,
  setTaxonomyActive,
  Taxonomy
} from '../services/hierarchyService';

export const Hierarchy: React.FC = () => {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
  const [subjects, setSubjects] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showResolveTool, setShowResolveTool] = useState(false);

  const loadHierarchyData = async (tax: Taxonomy) => {
    setLoading(true);
    try {
      const data = await fetchSubjects(tax);
      setSubjects(data);
    } catch (e) {
      console.error(e);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const init = async () => {
    const taxList = await fetchTaxonomies();
    setTaxonomies(taxList);
    const active = taxList.find(t => t.isActive) || taxList[0];
    if (active) {
      setSelectedTaxonomy(active);
      loadHierarchyData(active);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleTaxonomyChange = (id: string) => {
    const tax = taxonomies.find(t => t.id === id);
    if (tax) {
      setSelectedTaxonomy(tax);
      setSelectedNode(null);
      loadHierarchyData(tax);
    }
  };

  const handleNewTaxonomy = async () => {
    const name = window.prompt("Enter name for the new taxonomy version:");
    if (!name) return;
    try {
      const id = await createTaxonomy(name);
      await init();
      handleTaxonomyChange(id);
    } catch (e) {
      alert("Failed to create taxonomy.");
    }
  };

  const handleSetActive = async () => {
    if (!selectedTaxonomy) return;
    if (window.confirm(`Set "${selectedTaxonomy.name}" as the active platform taxonomy?`)) {
      await setTaxonomyActive(selectedTaxonomy.id);
      await init();
    }
  };

  const handleAdd = (type: HierarchyType) => {
    const newNode: HierarchyNode = {
      id: '',
      name: `New ${type}`,
      type,
      sortOrder: 0,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (type === 'topic' && selectedNode) {
      newNode.parentId = selectedNode.type === 'subject' ? selectedNode.id : selectedNode.parentId;
      newNode.subjectId = newNode.parentId;
    } else if (type === 'subtopic' && selectedNode) {
      newNode.parentId = selectedNode.type === 'topic' ? selectedNode.id : selectedNode.parentId;
      newNode.subjectId = selectedNode.subjectId;
    }

    setSelectedNode(newNode);
  };

  const handleSave = async (data: Partial<HierarchyNode>) => {
    if (!selectedTaxonomy) return;
    setIsSaving(true);
    try {
      await saveNode(selectedTaxonomy, data);
      alert("Hierarchy updated successfully.");
      loadHierarchyData(selectedTaxonomy);
    } catch (e) {
      alert("Failed to save hierarchy node.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedNode || !selectedTaxonomy) return;
    if (window.confirm("Are you sure you want to archive this node? Linked items might be affected.")) {
      await archiveNode(selectedTaxonomy, selectedNode.id, selectedNode.type);
      setSelectedNode(null);
      loadHierarchyData(selectedTaxonomy);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Taxonomy & Hierarchy</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Define the core subject structure for the entire LMS.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Taxonomy Version Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <Layers size={16} className="text-slate-400 ml-2" />
             <select 
               value={selectedTaxonomy?.id || ''}
               onChange={(e) => handleTaxonomyChange(e.target.value)}
               className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none pr-8 cursor-pointer"
             >
               {taxonomies.map(t => (
                 <option key={t.id} value={t.id}>{t.name} {t.isActive ? '(Active)' : ''}</option>
               ))}
             </select>
             <button 
               onClick={handleNewTaxonomy}
               className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 hover:text-primary-600 rounded-xl text-slate-400 transition-all"
               title="New Taxonomy Version"
             >
               <Plus size={18} />
             </button>
          </div>

          {selectedTaxonomy && !selectedTaxonomy.isActive && (
            <button 
              onClick={handleSetActive}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
            >
              <Star size={14} fill="currentColor" /> Set Active
            </button>
          )}

          <button 
            onClick={() => setShowResolveTool(!showResolveTool)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showResolveTool ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 text-slate-400 hover:text-slate-600'}`}
          >
            {showResolveTool ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
            Maintenance
          </button>
        </div>
      </div>

      {showResolveTool && (
        <div className="max-w-xl animate-slide-up">
          <ResolveLinksPanel />
        </div>
      )}

      {selectedTaxonomy?.isActive && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-[2rem] flex items-center gap-3 animate-fade-in">
          <ShieldCheck size={20} className="text-emerald-600" />
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
            This is the <strong>Active Taxonomy</strong>. Changes will reflect platform-wide for all students.
          </p>
        </div>
      )}

      <HierarchyToolbar 
        onAdd={handleAdd} 
        onSearch={setSearchQuery} 
        selectedType={selectedNode?.type}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-syan border border-slate-100 dark:border-slate-800 h-fit max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Navigation Tree</h3>
            {loading && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>
          {selectedTaxonomy && (
            <HierarchyTree 
              key={selectedTaxonomy.id} // Re-mount tree when switching taxonomies
              subjects={subjects} 
              onSelect={setSelectedNode} 
              selectedId={selectedNode?.id}
              searchQuery={searchQuery}
            />
          )}
        </div>

        <div className="lg:col-span-7">
          {selectedNode ? (
            <HierarchyEditor 
              node={selectedNode} 
              onSave={handleSave} 
              onArchive={handleArchive}
              isSaving={isSaving}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                <Hash size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-400">Select a node to begin editing</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">You can also add new subjects or topics using the toolbar above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
