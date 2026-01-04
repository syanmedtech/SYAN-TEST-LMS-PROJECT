import React from 'react';
import { PaperSection } from '../services/mockPaperAdminService';
import { Plus, ListTree, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionEditor } from './SectionEditor';

interface SectionsBuilderProps {
  sections: PaperSection[];
  onChange: (sections: PaperSection[]) => void;
}

export const SectionsBuilder: React.FC<SectionsBuilderProps> = ({ sections, onChange }) => {
  const addSection = () => {
    const newSection: PaperSection = {
      id: Date.now().toString(),
      title: 'New Section',
      questionCount: 0,
      blueprint: { 
        type: 'hierarchy',
        questionIds: [] 
      }
    };
    onChange([...sections, newSection]);
  };

  const updateSection = (index: number, updated: PaperSection) => {
    const newSections = [...sections];
    newSections[index] = updated;
    onChange(newSections);
  };

  const removeSection = (index: number) => {
    if (window.confirm("Remove this entire section and its question blueprint?")) {
      onChange(sections.filter((_, i) => i !== index));
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newSections.length) return;
    
    const temp = newSections[index];
    newSections[index] = newSections[target];
    newSections[target] = temp;
    
    onChange(newSections);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <ListTree className="text-primary-600" size={24} /> Assessment Architecture
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Define multi-section structure & question sets</p>
        </div>
        <button 
          type="button"
          onClick={addSection}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={18} /> New Section
        </button>
      </div>

      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="p-20 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/30 dark:bg-slate-900/30">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-200">
               <ListTree size={40} />
            </div>
            <h4 className="text-lg font-black text-slate-700 dark:text-slate-300">No Sections Defined</h4>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Mock papers require at least one section to distribute questions.</p>
            <button 
              type="button"
              onClick={addSection}
              className="mt-6 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest"
            >
              Add First Section
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <SectionEditor 
                key={section.id}
                section={section}
                index={idx}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
                onUpdate={(u) => updateSection(idx, u)}
                onRemove={() => removeSection(idx)}
                onMove={(d) => moveSection(idx, d)}
              />
            ))}
          </div>
        )}
      </div>
      
      {sections.length > 0 && (
         <div className="flex justify-center pt-8">
            <button 
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
            >
              <Plus size={18} /> Append Another Section
            </button>
         </div>
      )}
    </div>
  );
};