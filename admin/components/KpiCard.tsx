
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-syan border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">{value}</h3>
          {trend && (
            <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
              <span>{trend}</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`${color.replace('bg-', 'text-')}`} size={24} />
        </div>
      </div>
    </div>
  );
};
