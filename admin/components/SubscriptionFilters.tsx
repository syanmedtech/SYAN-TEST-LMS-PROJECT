
import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SubscriptionFiltersProps {
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onPlanChange: (val: string) => void;
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({ 
  onSearchChange, onStatusChange, onPlanChange 
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-80 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Search by email or name..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
          <Filter size={14} className="text-slate-400" />
          <select 
            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="canceled">Canceled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
          <select 
            className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
            onChange={(e) => onPlanChange(e.target.value)}
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic</option>
            <option value="pro">Syan Pro</option>
            <option value="elite">Syan Elite</option>
          </select>
        </div>
      </div>
    </div>
  );
};
