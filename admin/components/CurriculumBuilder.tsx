
import React from 'react';
import { Module } from '../services/videoCourseAdminService';
import { Plus, ListTree } from 'lucide-react';
import { ModuleEditor } from './ModuleEditor';

interface CurriculumBuilderProps {
  curriculum: Module[];
  onChange: (curriculum: Module[]) => void;
  courseId?: string;
}

export const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({ curriculum, onChange, courseId }) => {
  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      lessons: []
    };
    onChange([...curriculum, newModule]);
  };

  const updateModule = (index: number, updated: Module) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index] = updated;
    onChange(newCurriculum);
  };

  const removeModule = (index: number) => {
    const newCurriculum = curriculum.filter((_, i) => i !== index);
    onChange(newCurriculum);
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newCurriculum = [...curriculum];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCurriculum.length) return;
    [newCurriculum[index], newCurriculum[targetIndex]] = [newCurriculum[targetIndex], newCurriculum[index]];
    onChange(newCurriculum);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <ListTree className="text-primary-600" size={20} /> Course Curriculum
        </h3>
        <button 
          onClick={addModule}
          className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-sm hover:bg-primary-100 transition-all"
        >
          <Plus size={18} /> Add Module
        </button>
      </div>

      <div className="space-y-6">
        {curriculum.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-400">
            <ListTree size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold">No modules added yet.</p>
            <p className="text-sm mt-1">Start by adding a module to define your course structure.</p>
          </div>
        ) : (
          curriculum.map((module, index) => (
            <ModuleEditor 
              key={module.id}
              module={module}
              index={index}
              isFirst={index === 0}
              isLast={index === curriculum.length - 1}
              onUpdate={(u) => updateModule(index, u)}
              onRemove={() => removeModule(index)}
              onMove={(d) => moveModule(index, d)}
              courseId={courseId}
            />
          ))
        )}
      </div>
    </div>
  );
};
