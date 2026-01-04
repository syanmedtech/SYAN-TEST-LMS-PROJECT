
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AnalyticsKpiProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  description?: string;
}

export const AnalyticsKpi: React.FC<AnalyticsKpiProps> = ({ label, value, icon: Icon, color, description }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 flex items-start justify-between">
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 dark:text-white">{value}</h3>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-white`}>
      <Icon className={`${color.replace('bg-', 'text-')}`} size={24} />
    </div>
  </div>
);
