
import React from 'react';
import { Package } from '../services/packageAdminService';
import { Layout, DollarSign, Clock, Calendar, Hash, Tag } from 'lucide-react';

interface PackageFormProps {
  data: Partial<Package>;
  onChange: (data: Partial<Package>) => void;
}

export const PackageForm: React.FC<PackageFormProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    
    if (type === 'number') val = parseFloat(value) || 0;
    if (name === 'startAt' || name === 'endAt') val = value ? new Date(value).getTime() : undefined;

    onChange({ ...data, [name]: val });
  };

  return (
    <div className="space-y-8">
      {/* Basic Details */}
      <section className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Layout className="text-primary-500" size={20} /> Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Package Name*</label>
            <input 
              name="name"
              required
              value={data.name || ''}
              onChange={handleChange}
              placeholder="e.g. Syan Elite Monthly"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Badge / Tag</label>
            <div className="relative">
              <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                name="badge"
                value={data.badge || ''}
                onChange={handleChange}
                placeholder="e.g. Best Seller"
                className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order</label>
            <div className="relative">
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                name="sortOrder"
                type="number"
                value={data.sortOrder || 0}
                onChange={handleChange}
                className="w-full pl-12 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              name="description"
              value={data.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed description of what's inside..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <DollarSign className="text-emerald-500" size={20} /> Pricing Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price Amount*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{data.currency || 'PKR'}</span>
              <input 
                name="price"
                type="number"
                required
                value={data.price ?? 0}
                onChange={handleChange}
                className="w-full pl-16 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <select 
              name="status"
              value={data.status || 'inactive'}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            >
              <option value="active">Active (Visible)</option>
              <option value="inactive">Inactive (Hidden)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </section>

      {/* Validity */}
      <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock className="text-amber-500" size={20} /> Validity & Access Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
            <input 
              name="durationDays"
              type="number"
              value={data.durationDays || ''}
              onChange={handleChange}
              placeholder="e.g. 30"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            />
            <p className="text-[10px] text-slate-400 px-1 italic">Leave blank to use fixed date range instead.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <input 
              name="startAt"
              type="date"
              value={data.startAt ? new Date(data.startAt).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
            <input 
              name="endAt"
              type="date"
              value={data.endAt ? new Date(data.endAt).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
