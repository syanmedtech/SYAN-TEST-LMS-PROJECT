
import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface OptionEditorProps {
  type: "mcq" | "sba" | "truefalse";
  options: { id?: string; text: string; isCorrect: boolean }[];
  onChange: (options: { id?: string; text: string; isCorrect: boolean }[]) => void;
}

export const OptionEditor: React.FC<OptionEditorProps> = ({ type, options, onChange }) => {
  const addOption = () => {
    if (type === 'truefalse') return;
    const newOption = { text: '', isCorrect: false };
    onChange([...options, newOption]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    onChange(newOptions);
  };

  const toggleCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
          Answer Options
          <span className="text-[10px] text-slate-400 font-bold lowercase italic">(Select one correct answer)</span>
        </label>
        {type !== 'truefalse' && (
          <button 
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-primary-600 hover:text-primary-700 tracking-wider bg-primary-50 px-2 py-1 rounded-lg"
          >
            <Plus size={14} /> Add Option
          </button>
        )}
      </div>

      <div className="space-y-3">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-fade-in">
            <button
              type="button"
              onClick={() => toggleCorrect(idx)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                opt.isCorrect 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-emerald-200'
              }`}
            >
              {opt.isCorrect ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            
            <div className="flex-1 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Option {String.fromCharCode(65 + idx)}</span>
              <input 
                value={opt.text}
                disabled={type === 'truefalse'}
                onChange={(e) => updateOptionText(idx, e.target.value)}
                placeholder={`Type option text...`}
                className={`w-full pl-20 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-2xl focus:ring-2 transition-all font-bold ${
                  opt.isCorrect ? 'border-emerald-500/30 ring-emerald-500/10' : 'border-slate-100 dark:border-slate-700 focus:ring-primary-500/20'
                }`}
              />
            </div>

            {type !== 'truefalse' && options.length > 2 && (
              <button 
                type="button"
                onClick={() => removeOption(idx)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
