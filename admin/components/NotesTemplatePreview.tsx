import React from 'react';
import { NoteSection } from '../services/notesTemplateService';
import { Type, List, Table as TableIcon, Layout } from 'lucide-react';

interface Props {
  sections: NoteSection[];
  title: string;
}

export const NotesTemplatePreview: React.FC<Props> = ({ sections, title }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-syan h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Layout className="text-primary-500" size={24} />
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Form Preview</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Student View Emulation</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title || 'Untitled Note'}</h2>
        
        {sections.length === 0 ? (
          <div className="py-20 text-center text-slate-300 italic text-sm">
            Add sections to see a preview of the structured layout.
          </div>
        ) : (
          sections.map((section, idx) => (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{section.heading}</span>
                {section.isRequired && <span className="text-red-500 text-xs">*</span>}
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[60px] flex items-center justify-center text-slate-400 text-xs">
                {section.format === 'paragraph' && (
                  <div className="w-full space-y-2">
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full opacity-50"></div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6 opacity-50"></div>
                  </div>
                )}
                {section.format === 'bullets' && (
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div><div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></div>
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div><div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div></div>
                  </div>
                )}
                {section.format === 'table' && (
                  <div className="w-full border rounded-lg overflow-hidden border-slate-200">
                    <div className="grid grid-cols-2 bg-slate-100 h-6 border-b"></div>
                    <div className="grid grid-cols-2 h-6 border-b"></div>
                  </div>
                )}
                {section.format === 'mixed' && <span>[ Mixed Format Placeholder ]</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
