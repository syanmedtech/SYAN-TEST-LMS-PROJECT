import React, { useState, useEffect } from 'react';
import { PaperSection } from '../services/mockPaperAdminService';
// Added Loader2 to lucide-react imports to fix "Cannot find name 'Loader2'" error on line 125
import { Target, Layers, Tag as TagIcon, Search, AlertCircle, Trash2, Plus, BrainCircuit, ListCheck, Loader2 } from 'lucide-react';
import { QBankQuestion } from '../services/qbankAdminService';
import { fetchQuestionsByIds } from '../services/questionQueryService';
import { HierarchyPicker } from './HierarchyPicker';
import { QuestionPickerModal } from './QuestionPickerModal';

interface BlueprintEditorProps {
  blueprint: PaperSection['blueprint'];
  onChange: (blueprint: PaperSection['blueprint']) => void;
  targetCount: number;
}

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ blueprint, onChange, targetCount }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<QBankQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync metadata for selected IDs
  useEffect(() => {
    if (blueprint.type === 'fixed' && blueprint.questionIds?.length) {
      setLoading(true);
      fetchQuestionsByIds(blueprint.questionIds)
        .then(setSelectedQuestions)
        .finally(() => setLoading(false));
    } else {
      setSelectedQuestions([]);
    }
  }, [blueprint.questionIds, blueprint.type]);

  const handlePickerConfirm = (ids: string[]) => {
    onChange({ ...blueprint, questionIds: ids });
    setShowPicker(false);
  };

  const removeQuestion = (id: string) => {
    const next = blueprint.questionIds?.filter(i => i !== id) || [];
    onChange({ ...blueprint, questionIds: next });
  };

  const handleHierarchyChange = (updates: any) => {
    const config = blueprint.hierarchyConfig || { subjectIds: [], topicIds: [], subtopicIds: [], difficultyMix: {} };
    if (updates.subtopicId) config.subtopicIds = [updates.subtopicId];
    else if (updates.topicId) config.topicIds = [updates.topicId];
    else if (updates.subjectId) config.subjectIds = [updates.subjectId];
    
    onChange({ ...blueprint, hierarchyConfig: config });
  };

  return (
    <div className="space-y-6">
      {showPicker && (
        <QuestionPickerModal 
          onClose={() => setShowPicker(false)}
          onConfirm={handlePickerConfirm}
          initialSelectedIds={blueprint.questionIds || []}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'hierarchy', label: 'Hierarchy-based', icon: Layers, desc: 'Pick from Subject Structure' },
          { id: 'fixed', label: 'Fixed set', icon: Target, desc: 'Select exact MCQs' },
          { id: 'tags', label: 'Random from tags', icon: TagIcon, desc: 'Filter by metadata tags' }
        ].map(type => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange({ ...blueprint, type: type.id as any })}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              blueprint.type === type.id 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500 shadow-md' 
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-1">
              <type.icon className={blueprint.type === type.id ? 'text-primary-600' : 'text-slate-400'} size={20} />
              <span className={`text-sm font-black uppercase tracking-tight ${blueprint.type === type.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400'}`}>
                {type.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{type.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
         {blueprint.type === 'hierarchy' && (
           <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-xs text-primary-700 dark:text-primary-300 font-medium">
                 <AlertCircle className="flex-shrink-0" size={16} />
                 <span>Specify subject/topic range. Engine will pick {targetCount} questions at attempt time.</span>
              </div>
              <HierarchyPicker 
                subjectId={blueprint.hierarchyConfig?.subjectIds?.[0]}
                topicId={blueprint.hierarchyConfig?.topicIds?.[0]}
                subtopicId={blueprint.hierarchyConfig?.subtopicIds?.[0]}
                onChange={handleHierarchyChange}
              />
           </div>
         )}

         {blueprint.type === 'fixed' && (
           <div className="space-y-6 animate-fade-in">
              <button 
                type="button"
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-bold hover:border-primary-500 hover:text-primary-600 transition-all bg-white dark:bg-slate-900"
              >
                <ListCheck size={20} /> Select Questions from Library
              </button>

              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between px-1">
                    Selected Items ({blueprint.questionIds?.length || 0} / {targetCount})
                    {blueprint.questionIds?.length !== targetCount && targetCount > 0 && (
                      <span className="text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Count mismatch</span>
                    )}
                 </p>
                 
                 <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {loading ? (
                      <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>
                    ) : selectedQuestions.length > 0 ? (
                      selectedQuestions.map(q => (
                        <div key={q.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-medium shadow-sm group">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-slate-800 dark:text-slate-200 truncate">{q.stem}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] font-black uppercase text-slate-400">{q.subjectName || 'Unmapped'}</span>
                            </div>
                          </div>
                          <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={14}/></button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-300 italic text-xs">No questions selected. Use the picker to add content.</div>
                    )}
                 </div>
              </div>
           </div>
         )}

         {blueprint.type === 'tags' && (
           <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Required Tags (comma separated)</label>
                <input 
                  placeholder="e.g. high-yield, radiology, imaging"
                  className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold"
                  value={blueprint.tagConfig?.tags.join(', ') || ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    onChange({ ...blueprint, tagConfig: { tags } });
                  }}
                />
                <p className="text-[10px] text-slate-400 italic px-1">Questions having ALL these tags will be eligible for selection.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
