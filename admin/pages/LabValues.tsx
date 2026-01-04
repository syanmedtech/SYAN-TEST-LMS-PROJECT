import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, Search, Edit, Trash2, Filter, Download, Database, RefreshCw, AlertCircle, Trash, Globe } from 'lucide-react';
import { LabValue, fetchLabValues, deleteLabValueSoft, seedPakistaniLabValues } from '../services/labValuesService';
import { LabValueEditorModal } from '../components/LabValueEditorModal';
import { LabValueBulkImportModal } from '../components/LabValueBulkImportModal';

export const LabValues: React.FC = () => {
  const [items, setItems] = useState<LabValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', region: 'all', category: 'all' });
  const [showEditor, setShowEditor] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState<LabValue | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLabValues({ ...filters, pageSize: 100 });
      setItems(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Archive this reference value? Students will no longer see it.")) {
      await deleteLabValueSoft(id);
      loadData();
    }
  };

  const handleSeed = async () => {
    if (window.confirm("Initialize with basic Pakistani reference ranges? Existing duplicates will be updated.")) {
      setIsSeeding(true);
      try {
        await seedPakistaniLabValues();
        loadData();
      } catch (e) {
        alert("Seed failed.");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleEdit = (item: LabValue) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reference Lab Values</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage standard reference ranges shown to students during exams.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-emerald-500 transition-all shadow-sm"
          >
            {isSeeding ? <RefreshCw className="animate-spin" size={16}/> : <Database size={16} />} Seed Pakistan
          </button>
          <button 
            onClick={() => { setEditingItem(null); setShowEditor(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all"
          >
            <Plus size={20} /> Add Entry
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by test name..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold transition-all"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-xs font-bold text-slate-500 outline-none"
                value={filters.region}
                onChange={e => setFilters({...filters, region: e.target.value})}
              >
                <option value="all">All Regions</option>
                <option value="Pakistan">Pakistan</option>
                <option value="MiddleEast">Middle East</option>
                <option value="International">International</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <select 
                className="bg-transparent text-xs font-bold text-slate-500 outline-none"
                value={filters.category}
                onChange={e => setFilters({...filters, category: e.target.value})}
              >
                <option value="all">All Categories</option>
                <option value="CBC">CBC</option>
                <option value="LFT">LFT</option>
                <option value="RFT">RFT</option>
                <option value="Electrolytes">Electrolytes</option>
                <option value="Lipids">Lipids</option>
                <option value="Thyroid">Thyroid</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <button 
              onClick={() => setShowImport(true)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-slate-100 dark:border-slate-800"
              title="Bulk Import"
            >
              <Download size={18} className="rotate-180" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Standard Range</th>
                <th className="px-6 py-4">Region / Context</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse font-black text-slate-300 tracking-widest uppercase">Fetching Reference Library...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic">No lab values found for active filters.</td></tr>
              ) : (
                items.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{lab.testName}</p>
                        {lab.notes && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">{lab.notes}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-0.5 rounded-full">{lab.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{lab.normalRange}</span>
                        <span className="text-[10px] font-bold text-slate-400">{lab.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                          <Globe size={10} /> {lab.region}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-1.5 rounded">
                          {lab.ageGroup.toUpperCase()} • {lab.sex.toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(lab)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(lab.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditor && (
        <LabValueEditorModal 
          editingItem={editingItem}
          onClose={() => setShowEditor(false)}
          onSave={loadData}
        />
      )}

      {showImport && (
        <LabValueBulkImportModal 
          onClose={() => setShowImport(false)}
          onImportComplete={loadData}
        />
      )}
    </div>
  );
};