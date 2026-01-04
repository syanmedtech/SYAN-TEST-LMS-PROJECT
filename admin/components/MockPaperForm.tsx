import React from 'react';
import { MockPaper } from '../services/mockPaperAdminService';
import { Info, Globe, Clock, Layout, FileText, GraduationCap } from 'lucide-react';

interface MockPaperFormProps {
  data: Partial<MockPaper>;
  onChange: (updates: Partial<MockPaper>) => void;
}

export const MockPaperForm: React.FC<MockPaperFormProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'number') val = parseInt(value) || 0;
    onChange({ [name]: val });
  };

  const programs = ["MBBS", "FCPS", "NRE", "USMLE", "NLE", "MRCP"];

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Info className="text-primary-600" size={20} /> Paper Metadata
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Title*</label>
            <input 
              name="title"
              required
              value={data.title || ''}
              onChange={handleChange}
              placeholder="e.g. Surgery Final Grand Mock 2024"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold text-lg shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary Description</label>
            <textarea 
              name="description"
              value={data.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Provide a high-level overview of the topics covered..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Track / Exam</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    name="targetProgramId"
                    value={data.targetProgramId || ''}
                    onChange={handleChange}
                    className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="">Select Category</option>
                    {programs.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Limit (Mins)*</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    name="durationMinutes"
                    type="number"
                    required
                    min="1"
                    value={data.durationMinutes || ''}
                    onChange={handleChange}
                    className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold text-lg"
                  />
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FileText className="text-amber-600" size={20} /> Pre-Exam Instructions
        </h3>
        <p className="text-xs text-slate-500 italic">Visible to students before clicking "Start Exam".</p>
        <textarea 
          name="instructions"
          value={data.instructions || ''}
          onChange={handleChange}
          rows={6}
          placeholder="e.g. 1. Do not use external materials. 2. Each question carries equal marks. 3. Section switching is enabled..."
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white leading-relaxed"
        />
      </section>
    </div>
  );
};