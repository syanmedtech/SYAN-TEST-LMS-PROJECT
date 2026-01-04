import React, { useState, useEffect } from 'react';
import { X, LayoutGrid, CheckCircle, Info, Loader2, Play, Plus, Trash2, Layers, FileText, List, Clock, Target } from 'lucide-react';
import { saveMockPaper, MockPaper } from '../services/mockPaperAdminService';
import { dbGetHierarchy } from '../../services/db';
import { Topic } from '../../types';

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

type QuestionStrategy = 'empty' | 'blueprint';
type TitleMode = 'sequence' | 'list';

export const BulkMockTestCreator: React.FC<Props> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<'setup' | 'processing' | 'results'>('setup');
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  
  const [config, setConfig] = useState({
    titleMode: 'sequence' as TitleMode,
    prefix: 'Mock Exam',
    numTests: 5,
    customTitles: '', // For list mode
    qPerTest: 50,
    programId: 'MBBS',
    durationMinutes: 60,
    maxAttempts: 1,
    strategy: 'blueprint' as QuestionStrategy
  });

  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');

  useEffect(() => {
    dbGetHierarchy().then(res => {
      setAllTopics(res);
      setLoading(false);
    });
  }, []);

  const handleStart = async () => {
    // Validations
    let titles: string[] = [];
    if (config.titleMode === 'sequence') {
      if (!config.prefix.trim()) return alert("Please enter a title prefix.");
      for (let i = 1; i <= config.numTests; i++) titles.push(`${config.prefix} ${i}`);
    } else {
      titles = config.customTitles.split('\n').map(t => t.trim()).filter(Boolean);
      if (titles.length === 0) return alert("Please enter at least one title in the list.");
    }

    if (config.strategy === 'blueprint' && selectedTopicIds.size === 0) {
      return alert("Please select at least one topic for the blueprint strategy.");
    }

    setStep('processing');
    setProgress(0);

    const topicIdsArray: string[] = Array.from(selectedTopicIds);

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      setCurrentAction(`Creating: ${title}`);
      
      const payload: Partial<MockPaper> = {
        title,
        targetProgramId: config.programId,
        targetProgramName: config.programId,
        durationMinutes: config.durationMinutes,
        status: 'draft' as const,
        totalSections: 1,
        totalQuestions: config.strategy === 'blueprint' ? config.qPerTest : 0,
        maxAttempts: config.maxAttempts,
        sections: [
          {
            id: `s_${Date.now()}_${i}`,
            title: 'Section 1',
            questionCount: config.strategy === 'blueprint' ? config.qPerTest : 0,
            blueprint: {
              type: config.strategy === 'blueprint' ? 'hierarchy' : 'fixed',
              questionIds: [],
              hierarchyConfig: config.strategy === 'blueprint' ? {
                subjectIds: [],
                topicIds: topicIdsArray,
                subtopicIds: [],
                difficultyMix: { easy: 30, medium: 50, hard: 20 }
              } : undefined
            }
          }
        ]
      };

      await saveMockPaper(null, payload);
      setProgress(Math.round(((i + 1) / titles.length) * 100));
    }

    setStep('results');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Bulk Exam Provisioning</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">High-volume assessment creation engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {step === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              {/* Left Side: General Config */}
              <div className="lg:col-span-7 space-y-8">
                {/* Mode Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
                  <button 
                    onClick={() => setConfig({...config, titleMode: 'sequence'})}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.titleMode === 'sequence' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Auto-Sequence
                  </button>
                  <button 
                    onClick={() => setConfig({...config, titleMode: 'list'})}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.titleMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Custom List
                  </button>
                </div>

                <div className="space-y-6">
                  {config.titleMode === 'sequence' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title Prefix</label>
                        <input 
                            value={config.prefix}
                            onChange={e => setConfig({...config, prefix: e.target.value})}
                            placeholder="e.g. Grand Mock"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Number of Exams</label>
                        <input 
                            type="number" 
                            min="1"
                            max="50"
                            value={config.numTests}
                            onChange={e => setConfig({...config, numTests: parseInt(e.target.value) || 1})}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Titles (One per line)</label>
                      <textarea 
                        value={config.customTitles}
                        onChange={e => setConfig({...config, customTitles: e.target.value})}
                        placeholder="Pathology Mock 1&#10;Pathology Mock 2&#10;Emergency Med Grand Test..."
                        className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold resize-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Mins)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="number" 
                            value={config.durationMinutes}
                            onChange={e => setConfig({...config, durationMinutes: parseInt(e.target.value) || 0})}
                            className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Attempts</label>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            type="number" 
                            value={config.maxAttempts}
                            onChange={e => setConfig({...config, maxAttempts: parseInt(e.target.value) || 1})}
                            className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program ID</label>
                      <select 
                        value={config.programId}
                        onChange={e => setConfig({...config, programId: e.target.value})}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 font-bold"
                      >
                        {['MBBS', 'FCPS', 'NRE', 'USMLE', 'NLE', 'MRCP'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Layers size={18} className="text-primary-600" /> Question Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setConfig({...config, strategy: 'empty'})}
                      className={`p-6 rounded-[2rem] border-2 text-left transition-all ${config.strategy === 'empty' ? 'border-primary-500 bg-primary-50/50 shadow-md ring-1 ring-primary-500' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className={config.strategy === 'empty' ? 'text-primary-600' : 'text-slate-400'} />
                        <span className="font-black text-xs uppercase tracking-widest">Manual (Empty)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Create containers only. You will select questions for each exam manually later.</p>
                    </button>
                    <button 
                      onClick={() => setConfig({...config, strategy: 'blueprint'})}
                      className={`p-6 rounded-[2rem] border-2 text-left transition-all ${config.strategy === 'blueprint' ? 'border-primary-500 bg-primary-50/50 shadow-md ring-1 ring-primary-500' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Play className={config.strategy === 'blueprint' ? 'text-primary-600' : 'text-slate-400'} />
                        <span className="font-black text-xs uppercase tracking-widest">Auto-Blueprint</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Automatically populate exams with questions based on topic filters.</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Topic Selector for Blueprint */}
              <div className="lg:col-span-5 border-l border-slate-100 dark:border-slate-800 pl-8 space-y-6">
                <div className={`space-y-4 transition-opacity duration-300 ${config.strategy === 'blueprint' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <List size={18} className="text-emerald-500" /> Blueprint Scope
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Questions per Exam</label>
                      <input 
                        type="number" 
                        value={config.qPerTest}
                        onChange={e => setConfig({...config, qPerTest: parseInt(e.target.value) || 0})}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 font-bold"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden h-[250px] flex flex-col">
                      <div className="p-3 bg-slate-100/50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 border-b">Select Topics</div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {loading ? (
                          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
                        ) : allTopics.map(subject => (
                          <div key={subject.id}>
                            <p className="text-[10px] font-black text-primary-500 uppercase px-2 mb-1 mt-3">{subject.name}</p>
                            {subject.children?.map(topic => (
                              <button
                                key={topic.id}
                                onClick={() => {
                                  const next = new Set(selectedTopicIds);
                                  if (next.has(topic.id)) next.delete(topic.id);
                                  else next.add(topic.id);
                                  setSelectedTopicIds(next);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                                  selectedTopicIds.has(topic.id) 
                                  ? 'bg-primary-600 text-white shadow-md' 
                                  : 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTopicIds.has(topic.id) ? 'bg-white border-white' : 'border-slate-300 bg-white'}`}>
                                  {selectedTopicIds.has(topic.id) && <CheckCircle size={10} className="text-primary-600" />}
                                </div>
                                {topic.name}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <div className="flex gap-3">
                    <Info className="text-amber-600 shrink-0" size={18} />
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-tight">
                      Provisioning creates exams as <strong>Draft</strong>. You must explicitly publish them from the main dashboard after review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-24 text-center space-y-10 animate-fade-in">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={48} className="text-primary-500 animate-spin" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Writing Assessments...</h3>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">{currentAction}</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="flex justify-between text-xs font-black text-slate-500">
                   <span className="uppercase tracking-widest">Platform Commit</span>
                   <span>{progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div 
                    className="h-full bg-primary-600 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                    style={{ width: `${progress}%` }}
                   ></div>
                </div>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="py-24 text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-2xl shadow-emerald-500/20">
                <CheckCircle size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Provisioning Complete!</h3>
                <p className="text-slate-500 mt-2 font-medium">Cloud repository successfully updated with the new assessment batch.</p>
              </div>
              <div className="flex justify-center gap-6">
                <div className="text-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 w-40">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Created</p>
                   <p className="text-2xl font-black text-slate-800 dark:text-white">{progress === 100 ? (config.titleMode === 'sequence' ? config.numTests : config.customTitles.split('\n').filter(Boolean).length) : 0}</p>
                </div>
                <div className="text-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 w-40">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                   <p className="text-lg font-black text-amber-500 uppercase">Draft</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          {step === 'setup' && (
            <>
              <button onClick={onClose} className="px-8 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
              <button 
                onClick={handleStart} 
                className="px-12 py-4 bg-primary-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:scale-[1.02] transition-all flex items-center gap-3"
              >
                <Play size={20} fill="currentColor" /> Commit Batch
              </button>
            </>
          )}
          {step === 'results' && (
            <button onClick={() => { onComplete(); onClose(); }} className="px-16 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]">Access Repository</button>
          )}
        </div>
      </div>
    </div>
  );
};