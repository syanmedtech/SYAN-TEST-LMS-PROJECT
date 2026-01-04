import React from 'react';
import { QBankQuestion, QuestionType, QuestionDifficulty } from '../services/qbankAdminService';
import { HierarchyPicker } from './HierarchyPicker';
import { OptionEditor } from './OptionEditor';
import { FileText, Settings, BookOpen, Tag as TagIcon, Hash } from 'lucide-react';

interface QuestionFormProps {
  data: Partial<QBankQuestion>;
  onChange: (updates: Partial<QBankQuestion>) => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ data, onChange }) => {
  const handleTypeChange = (newType: QuestionType) => {
    let options = data.options || [];
    if (newType === 'truefalse') {
      options = [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ];
      // Fix: Removed redundant 'newType !== "truefalse"' check which caused a TypeScript narrowing error because newType is already narrowed in the else branch
    } else if (data.type === 'truefalse') {
      options = [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];
    }
    onChange({ type: newType, options });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
    onChange({ tags });
  };

  return (
    <div className="space-y-10">
      {/* Step 1: Content */}
      <section className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FileText className="text-primary-600" size={20} /> Question Content
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Stem (The scenario or question text)</label>
            <textarea 
              value={data.stem || ''}
              onChange={(e) => onChange({ stem: e.target.value })}
              rows={4}
              placeholder="e.g. A 45-year-old male presents with acute abdominal pain..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold leading-relaxed shadow-inner"
            />
          </div>
          
          <OptionEditor 
            type={data.type || 'mcq'} 
            options={data.options || []} 
            onChange={(options) => onChange({ options })} 
          />

          <div className="space-y-2 pt-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Explanation</label>
            <textarea 
              value={data.explanation || ''}
              onChange={(e) => onChange({ explanation: e.target.value })}
              rows={5}
              placeholder="Provide a detailed clinical rationale for the correct answer..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* Step 2: Taxonomy */}
      <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-emerald-600" size={20} /> Classification & Mapping
        </h3>
        <HierarchyPicker 
          subjectId={data.subjectId}
          topicId={data.topicId}
          subtopicId={data.subtopicId}
          subjectName={data.subjectName}
          topicName={data.topicName}
          subtopicName={data.subtopicName}
          onChange={(updates) => onChange(updates)}
        />
      </section>

      {/* Step 3: Metadata */}
      <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Settings className="text-purple-600" size={20} /> Metadata & Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Format Type</label>
            <select 
              value={data.type || 'mcq'}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="sba">Single Best Answer (SBA)</option>
              <option value="truefalse">True or False</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Difficulty</label>
            <select 
              value={data.difficulty || 'medium'}
              onChange={(e) => onChange({ difficulty: e.target.value as QuestionDifficulty })}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
            >
              <option value="easy">Easy (Knowledge)</option>
              <option value="medium">Medium (Application)</option>
              <option value="hard">Hard (Analysis)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <TagIcon size={10} /> Tags (Comma separated)
            </label>
            <input 
              value={data.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="e.g. radiology, fcps-part-1, high-yield"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
