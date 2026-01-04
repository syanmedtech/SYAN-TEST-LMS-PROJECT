
import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  value: number;
  onChange: (days: number) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
  const options = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
  ];

  return (
    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm items-center gap-1">
      <div className="px-2 text-slate-400">
        <Calendar size={16} />
      </div>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            value === opt.value 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
