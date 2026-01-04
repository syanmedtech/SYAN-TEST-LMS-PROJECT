
import React from 'react';
import { Plan } from '../services/planAdminService';
import { Hash, DollarSign, Clock, Layout } from 'lucide-react';

interface PlanEditorProps {
  plan: Partial<Plan>;
  onChange: (data: Partial<Plan>) => void;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({ plan, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...plan,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Name</label>
          <div className="relative">
            <Layout size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="name"
              value={plan.name || ''}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
              placeholder="e.g. Syan Elite Monthly"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (PKR)</label>
          <div className="relative">
            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="price"
              type="number"
              value={plan.price ?? 0}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
          <div className="relative">
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="durationDays"
              type="number"
              value={plan.durationDays ?? 30}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
          <div className="relative">
            <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="sortOrder"
              type="number"
              value={plan.sortOrder ?? 0}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 font-bold"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={plan.isActive ?? true}
          onChange={handleChange}
          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
        />
        <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Plan is Active (Visible to students)
        </label>
      </div>
    </div>
  );
};
