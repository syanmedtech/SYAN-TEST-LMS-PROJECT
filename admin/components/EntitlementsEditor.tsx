
import React from 'react';
import { Entitlements } from '../services/planAdminService';
import { ShieldCheck, Cpu, PlayCircle, BookOpen, GraduationCap } from 'lucide-react';

interface EntitlementsEditorProps {
  entitlements: Entitlements;
  onChange: (data: Entitlements) => void;
}

export const EntitlementsEditor: React.FC<EntitlementsEditorProps> = ({ entitlements, onChange }) => {
  const toggleFullAccess = (field: keyof Entitlements) => {
    if (typeof entitlements[field] === 'boolean') {
      onChange({ ...entitlements, [field]: !entitlements[field] });
    }
  };

  const handleProgramToggle = (program: string) => {
    const programs = entitlements.programs.includes(program)
      ? entitlements.programs.filter(p => p !== program)
      : [...entitlements.programs, program];
    onChange({ ...entitlements, programs });
  };

  const commonPrograms = ["MBBS", "FCPS", "NRE", "USMLE", "NLE", "MRCP"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => toggleFullAccess('fullQbankAccess')}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            entitlements.fullQbankAccess 
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' 
              : 'border-slate-100 dark:border-slate-800 text-slate-500'
          }`}
        >
          <BookOpen className={entitlements.fullQbankAccess ? 'text-emerald-500' : 'text-slate-400'} />
          <div className="text-left">
            <p className="text-sm font-bold">Full QBank Access</p>
            <p className="text-[10px] opacity-70">Unlock all subjects & subtopics</p>
          </div>
        </button>

        <button
          onClick={() => toggleFullAccess('aiTutorAccess')}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
            entitlements.aiTutorAccess 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700' 
              : 'border-slate-100 dark:border-slate-800 text-slate-500'
          }`}
        >
          <Cpu className={entitlements.aiTutorAccess ? 'text-purple-500' : 'text-slate-400'} />
          <div className="text-left">
            <p className="text-sm font-bold">AI Tutor Enabled</p>
            <p className="text-[10px] opacity-70">Gemini-powered deep explanations</p>
          </div>
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <GraduationCap size={14} /> Programs / Exam Tracks
        </label>
        <div className="flex flex-wrap gap-2">
          {commonPrograms.map(prog => (
            <button
              key={prog}
              onClick={() => handleProgramToggle(prog)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                entitlements.programs.includes(prog)
                ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
              }`}
            >
              {prog}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
        <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed italic">
          <strong>Note:</strong> Advanced granular control for individual courses and specific mock exams will be available in the upcoming "Resource Mapping" update. Currently, plan tracks are primarily defined by Program categories.
        </p>
      </div>
    </div>
  );
};
