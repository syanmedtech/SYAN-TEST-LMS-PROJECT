import React, { useState, useEffect } from 'react';
import { CalculatorDef, CalculatorInput, saveCalculator } from '../services/calculatorService';
import { validateFormula } from '../../shared/utils/safeFormula';
import { 
  X, Save, Settings, Hash, Type, Plus, Trash2, 
  HelpCircle, Code, List, Info, Loader2, Play
} from 'lucide-react';
import { CalculatorTestPanel } from './CalculatorTestPanel';

interface Props {
  calculator: CalculatorDef | null;
  onClose: () => void;
  onSave: () => void;
}

export const CalculatorEditor: React.FC<Props> = ({ calculator, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CalculatorDef>>({
    name: '',
    slug: '',
    description: '',
    inputs: [],
    formula: '',
    result: { label: 'Result', unit: '', precision: 2 },
    isActive: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formulaError, setFormulaError] = useState<string | null>(null);

  useEffect(() => {
    if (calculator) setFormData(calculator);
  }, [calculator]);

  const addInput = () => {
    const newInput: CalculatorInput = { key: 'var_' + Date.now(), label: 'New Input', type: 'number', unit: '' };
    setFormData(prev => ({ ...prev, inputs: [...(prev.inputs || []), newInput] }));
  };

  const removeInput = (key: string) => {
    setFormData(prev => ({ ...prev, inputs: prev.inputs?.filter(i => i.key !== key) }));
  };

  const updateInput = (key: string, updates: Partial<CalculatorInput>) => {
    setFormData(prev => ({
      ...prev,
      inputs: prev.inputs?.map(i => i.key === key ? { ...i, ...updates } : i)
    }));
  };

  const handleFormulaChange = (formula: string) => {
    setFormData(prev => ({ ...prev, formula }));
    const availableKeys = formData.inputs?.map(i => i.key) || [];
    const val = validateFormula(formula, availableKeys);
    setFormulaError(val.error || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formulaError) return alert("Please fix the formula errors before saving.");
    
    setIsSaving(true);
    try {
      await saveCalculator(calculator?.id || null, formData);
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save calculator.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {calculator ? 'Edit Calculator' : 'New Medical Calculator'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Custom Clinical Formula Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Meta */}
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calculator Name*</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Body Mass Index (BMI)"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Slug*</label>
                  <input 
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="bmi"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </section>

            {/* Inputs Builder */}
            <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <List size={20} className="text-primary-600" /> Input Variables
                </h3>
                <button type="button" onClick={addInput} className="flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-100 transition-all">
                  <Plus size={14} /> Add Variable
                </button>
              </div>

              <div className="space-y-4">
                {formData.inputs?.map((input, idx) => (
                  <div key={input.key} className="bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Key (Used in Formula)</label>
                        <input value={input.key} onChange={e => updateInput(input.key, { key: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Display Label</label>
                        <input value={input.label} onChange={e => updateInput(input.key, { label: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Unit</label>
                        <input value={input.unit} onChange={e => updateInput(input.key, { unit: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Type</label>
                        <select value={input.type} onChange={e => updateInput(input.key, { type: e.target.value as any })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold">
                          <option value="number">Number</option>
                          <option value="select">Select (Static)</option>
                        </select>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeInput(input.key)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </section>

            {/* Formula Engine */}
            <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Code size={20} className="text-emerald-600" /> Mathematical Blueprint
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3 text-xs text-blue-700 dark:text-blue-300">
                  <Info size={18} className="shrink-0" />
                  <p>Use variables from above. Functions supported: <strong>min(a,b), max(a,b), pow(a,b), sqrt(a), round(a), abs(a)</strong>. Example: <code>weight / pow(height, 2)</code></p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Formula Equation*</label>
                  <input 
                    value={formData.formula}
                    onChange={e => handleFormulaChange(e.target.value)}
                    className={`w-full p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-lg border-4 transition-all focus:ring-0 ${formulaError ? 'border-red-500' : 'border-slate-800 focus:border-primary-500'}`}
                    placeholder="weight / (height * height)"
                  />
                  {formulaError && <p className="text-[10px] font-black text-red-500 uppercase tracking-tight ml-1">{formulaError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Result Label</label>
                    <input 
                      value={formData.result?.label}
                      onChange={e => setFormData({ ...formData, result: { ...formData.result!, label: e.target.value } })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Result Unit</label>
                    <input 
                      value={formData.result?.unit}
                      onChange={e => setFormData({ ...formData, result: { ...formData.result!, unit: e.target.value } })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precision</label>
                    <input 
                      type="number"
                      value={formData.result?.precision}
                      onChange={e => setFormData({ ...formData, result: { ...formData.result!, precision: parseInt(e.target.value) || 0 } })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar: Testing */}
          <div className="w-full lg:w-96 bg-slate-50 dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800 p-8 overflow-y-auto custom-scrollbar">
            <CalculatorTestPanel calculator={formData} />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSaving || !!formulaError}
            className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={20}/>}
            Save Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
