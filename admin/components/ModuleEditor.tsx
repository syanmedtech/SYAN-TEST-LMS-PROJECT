
import React from 'react';
import { Module, Lesson } from '../services/videoCourseAdminService';
import { Trash2, ChevronUp, ChevronDown, Plus, Layers, GripVertical } from 'lucide-react';
import { LessonEditor } from './LessonEditor';

interface ModuleEditorProps {
  module: Module;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updated: Module) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  courseId?: string;
}

export const ModuleEditor: React.FC<ModuleEditorProps> = ({ 
  module, index, isFirst, isLast, onUpdate, onRemove, onMove, courseId 
}) => {
  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: 'New Lesson',
      type: 'video',
      isFreePreview: false
    };
    onUpdate({ ...module, lessons: [...module.lessons, newLesson] });
  };

  const updateLesson = (lessonIndex: number, updated: Lesson) => {
    const lessons = [...module.lessons];
    lessons[lessonIndex] = updated;
    onUpdate({ ...module, lessons });
  };

  const removeLesson = (lessonIndex: number) => {
    const lessons = module.lessons.filter((_, i) => i !== lessonIndex);
    onUpdate({ ...module, lessons });
  };

  const moveLesson = (lessonIndex: number, direction: 'up' | 'down') => {
    const lessons = [...module.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    [lessons[lessonIndex], lessons[targetIndex]] = [lessons[targetIndex], lessons[lessonIndex]];
    onUpdate({ ...module, lessons });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-slate-400 cursor-default"><GripVertical size={18} /></div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-500">M{index + 1}</span>
            <input 
              value={module.title}
              onChange={(e) => onUpdate({ ...module, title: e.target.value })}
              className="bg-transparent border-none focus:ring-0 font-black text-slate-800 dark:text-white text-lg w-full md:w-96"
              placeholder="Module Title..."
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove('up')} disabled={isFirst} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ChevronUp size={18}/></button>
          <button onClick={() => onMove('down')} disabled={isLast} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20"><ChevronDown size={18}/></button>
          <button onClick={onRemove} className="p-2 text-slate-400 hover:text-red-600 ml-2"><Trash2 size={18}/></button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {module.lessons.map((lesson, lIdx) => (
          <LessonEditor 
            key={lesson.id}
            lesson={lesson}
            index={lIdx}
            isFirst={lIdx === 0}
            isLast={lIdx === module.lessons.length - 1}
            onUpdate={(u) => updateLesson(lIdx, u)}
            onRemove={() => removeLesson(lIdx)}
            onMove={(d) => moveLesson(lIdx, d)}
            courseId={courseId}
            moduleId={module.id}
          />
        ))}

        <button 
          onClick={addLesson}
          className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 hover:border-primary-100 dark:hover:border-primary-900 hover:bg-primary-50/30 transition-all font-bold text-sm flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Lesson to Module
        </button>
      </div>
    </div>
  );
};
