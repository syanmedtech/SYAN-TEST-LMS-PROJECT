import React, { useState, useEffect } from 'react';
import { X, Save, FlaskConical, Hash, Type, Info, Globe } from 'lucide-react';
import { LabValue, saveLabValue } from '../services/labValuesService';

interface Props {
  onClose: () => void;
  onSave: () => void;
  editingItem: LabValue | null;
}

export const LabValueEditorModal: React.FC<Props> = ({ onClose, onSave, editingItem }) => {
  const [formData, setFormData] = useState<Partial<LabValue>>({
    region: "Pakistan",
    category: "CBC",
    testName: "",
    normalRange: "",
    unit: "",
    notes: "",
    sex: "all",
    ageGroup: "adult",
    sortOrder: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingItem) setFormData(editingItem);
  }, [editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.testName || !formData.normalRange || !formData.unit) {
      alert("Test Name, Range, and Unit are required.");
      return;
    }
    setIsSaving(true);
    try {
      await saveLabValue(editingItem?.id || null, formData);
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save lab value.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'number') val = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white">
              <FlaskConical size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              {editingItem ? 'Edit Lab Entry' : 'New Lab Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Name*</label>
              <input name="testName" value={formData.testName} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold">
                <option value="CBC">CBC</option>
                <option value="LFT">LFT</option>
                <option value="RFT">RFT</option>
                <option value="Electrolytes">Electrolytes</option>
                <option value="Lipids">Lipids</option>
                <option value="Thyroid">Thyroid</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Normal Range*</label>
              <input name="normalRange" value={formData.normalRange} onChange={handleChange} required placeholder="e.g. 13.5–17.5" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit*</label>
              <input name="unit" value={formData.unit} onChange={handleChange} required placeholder="e.g. g/dL" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
              <select name="region" value={formData.region} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold">
                <option value="Pakistan">Pakistan</option>
                <option value="MiddleEast">Middle East</option>
                <option value="International">International</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sex</label>
              <select name="sex" value={formData.sex} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold">
                <option value="all">All / Both</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Remarks</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500" />
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? 'Processing...' : <><Save size={20}/> Save Entry</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};