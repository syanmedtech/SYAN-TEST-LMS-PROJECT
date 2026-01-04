import React, { useState } from 'react';
import { PaperSection } from '../services/mockPaperAdminService';
import { Trash2, ChevronUp, ChevronDown, Settings, Hash, BrainCircuit, Type, Clock, AlertTriangle } from 'lucide-react';
import { BlueprintEditor } from './BlueprintEditor';

interface SectionEditorProps {
  section: PaperSection;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updated: PaperSection) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ 
  section, index, isFirst, isLast, onUpdate, onRemove, onMove 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-[10px] font-black text-white shadow-md">S{index + 1}</span>
            <input 
              value={section.title}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              className="bg-transparent border-none focus:ring-0 font-black text-slate-800 dark:text-white text-lg w-full md:w-80"
              placeholder="e.g. Medicine & Clinical Vignettes..."
            />
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase text-slate-400">
            <Hash size={12} className="text-primary-500" /> {section.questionCount || 0} MCQs
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove('up')} disabled={isFirst} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ChevronUp size={18}/></button>
          <button type="button" onClick={() => onMove('down')} disabled={isLast} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ChevronDown size={18}/></button>
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`} title="Configure Section">
            <Settings size={18} />
          </button>
          <button type="button" onClick={onRemove} className="p-2 text-slate-300 hover:text-red-500 ml-2 transition-colors"><Trash2 size={18}/></button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 space-y-10 animate-fade-in bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Hash size={10} className="text-primary-500" /> Question Count*
                </label>
                <input 
                  type="number"
                  min="0"
                  value={section.questionCount || ''}
                  onChange={(e) => onUpdate({ ...section, questionCount: parseInt(e.target.value) || 0 })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                  placeholder="How many questions?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} className="text-amber-500" /> Time Limit (Mins)
                </label>
                <input 
                  type="number"
                  min="0"
                  value={section.durationMinutes || ''}
                  placeholder="Optional section-specific limit"
                  onChange={(e) => onUpdate({ ...section, durationMinutes: parseInt(e.target.value) || undefined })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                />
              </div>
            </div>
            <div className="space-y-6">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Type size={10} className="text-slate-400" /> Description
                </label>
                <textarea 
                  value={section.description || ''}
                  onChange={(e) => onUpdate({ ...section, description: e.target.value })}
                  rows={2}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
                  placeholder="Helpful context for students..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle size={10} className="text-red-500" /> Negative Marking
                </label>
                <input 
                  type="number"
                  step="0.05"
                  min="0"
                  value={section.negativeMarking || ''}
                  onChange={(e) => onUpdate({ ...section, negativeMarking: parseFloat(e.target.value) || undefined })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                  placeholder="e.g. 0.25"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600">
                  <BrainCircuit size={18} />
                </div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Question Sourcing Strategy</h4>
             </div>
             <BlueprintEditor 
                blueprint={section.blueprint} 
                targetCount={section.questionCount || 0}
                onChange={(blueprint) => onUpdate({ ...section, blueprint })} 
             />
          </div>
        </div>
      )}
    </div>
  );
};