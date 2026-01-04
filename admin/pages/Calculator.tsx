import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, Plus, Search, Edit, Trash2, 
  Archive, MoreVertical, Globe, RefreshCw, AlertCircle
} from 'lucide-react';
import { CalculatorDef, fetchCalculators, archiveCalculator, duplicateCalculator } from '../services/calculatorService';
import { CalculatorEditor } from '../components/CalculatorEditor';

export const Calculator: React.FC = () => {
  const [calculators, setCalculators] = useState<CalculatorDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingCalc, setEditingCalc] = useState<CalculatorDef | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCalculators();
      setCalculators(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleArchive = async (id: string) => {
    if (window.confirm("Archive this calculator? It will no longer be available to students.")) {
      await archiveCalculator(id);
      loadData();
    }
  };

  const handleDuplicate = async (calc: CalculatorDef) => {
    await duplicateCalculator(calc);
    loadData();
  };

  const handleEdit = (calc: CalculatorDef) => {
    setEditingCalc(calc);
    setShowEditor(true);
  };

  const filtered = calculators.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Medical Calculators</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design and manage clinical scoring systems and calculators.</p>
        </div>
        <button 
          onClick={() => { setEditingCalc(null); setShowEditor(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all"
        >
          <Plus size={20} /> Create Calculator
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name or slug..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 rounded-xl text-slate-400 hover:text-primary-600 transition-all">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Calculator</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-center">Variables</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && calculators.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse font-black text-slate-300 tracking-widest uppercase">Fetching Calculator Library...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic">No calculators found.</td></tr>
              ) : (
                filtered.map((calc) => (
                  <tr key={calc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                          <CalcIcon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{calc.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Updated {new Date(calc.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{calc.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400">{calc.inputs.length} Inputs</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        calc.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${calc.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                        {calc.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(calc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Edit size={18} /></button>
                        <button onClick={() => handleDuplicate(calc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><MoreVertical size={18} /></button>
                        <button onClick={() => handleArchive(calc.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Archive size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
            <Globe size={20} /> Deploying Formulas
          </h3>
          <p className="text-xs text-primary-100 leading-relaxed relative z-10">
            Once a calculator is marked as <strong>Active</strong>, it will automatically appear in the student's "Tools" menu during practice and exam modes unless specific assessment overrides are in place.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-syan flex items-center gap-6">
           <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0">
             <AlertCircle size={28} />
           </div>
           <div>
             <h3 className="font-bold text-slate-800 dark:text-white">Validation Warning</h3>
             <p className="text-xs text-slate-500">Ensure your formula uses only defined variables. Broken formulas will be automatically disabled to prevent student-side runtime errors.</p>
           </div>
        </div>
      </div>

      {showEditor && (
        <CalculatorEditor 
          calculator={editingCalc}
          onClose={() => setShowEditor(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
};
