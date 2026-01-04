
import React, { useState, useEffect } from 'react';
import { Topic, Paper, Subscription } from '../types';
import { 
    ChevronRight, BrainCircuit, FileText, BarChart3, Play, Clock, 
    Check, Activity, Package, Layers, Settings, ListTree, Filter, Hash, Gauge, RefreshCw
} from 'lucide-react';
import { dbGetPapers } from '../services/db';

interface QuizSelectionProps {
  courseId: string;
  topics: Topic[];
  onStartQuiz: (
      selectedTopicIds: string[], 
      title: string, 
      durationMins: number | undefined, 
      mode: 'TUTOR' | 'EXAM' | 'FLASHCARD',
      config?: {
          questionMode: string;
          difficulty: string[];
          questionCount: number;
      }
  ) => void;
  onBack: () => void;
  initialSelection?: { subjectId: string; topicId: string };
  preSelectedTopicIds?: string[];
}

type Tab = 'PRACTICE' | 'PAPERS';
type SelectionStep = 'SUBJECT' | 'TOPIC' | 'SUBTOPIC' | 'CONFIG';

export const QuizSelection: React.FC<QuizSelectionProps> = ({ courseId, topics, onStartQuiz, onBack, initialSelection, preSelectedTopicIds }) => {
  const [activeTab, setActiveTab] = useState<Tab>('PRACTICE');
  const [papers, setPapers] = useState<Paper[]>([]);
  
  // Selection Flow State
  const [step, setStep] = useState<SelectionStep>('SUBJECT');
  
  // Use Sets for multi-selection
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(new Set());

  // Custom Quiz Configuration State
  const [customTimeLimit, setCustomTimeLimit] = useState<number>(0); // 0 = unlimited
  
  // NEW CONFIG STATE
  const [questionMode, setQuestionMode] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<Set<string>>(new Set(['Easy', 'Medium', 'Hard']));
  const [questionCount, setQuestionCount] = useState<string>('20'); 
  const [customQuizMode, setCustomQuizMode] = useState<'TUTOR' | 'EXAM' | 'FLASHCARD'>('TUTOR');

  // Mock Exam Config Modal State
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [examMode, setExamMode] = useState<'TUTOR' | 'EXAM'>('EXAM');
  const [tutorTimeLimit, setTutorTimeLimit] = useState<number>(0);

  // Derived display names for video quiz summary
  const [selectedPath, setSelectedPath] = useState<{ subject: string, topic: string, subtopic?: string }>({ subject: '', topic: '' });

  const questionModes = ['All', 'Unattempted Only', 'Attempted Incorrect', 'Attempted Only', 'Marked Questions'];
  const difficultyLevels = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
      dbGetPapers().then(setPapers);
  }, []);

  // Handle Automatic Selection (Video Player OR Revision Quiz)
  useEffect(() => {
      // Scenario A: Pre-selected Topic IDs (Revision Quiz)
      if (preSelectedTopicIds && preSelectedTopicIds.length > 0 && topics.length > 0) {
          const newSubjects = new Set<string>();
          const newTopics = new Set<string>();
          const newSubtopics = new Set<string>();

          // Iterate to find where these IDs belong in hierarchy
          const findAndSelect = (list: Topic[], parentId?: string, grantParentId?: string) => {
              for (const t of list) {
                  if (preSelectedTopicIds.includes(t.id)) {
                      // It's a match
                      if (grantParentId) {
                          newSubjects.add(grantParentId);
                          newTopics.add(parentId!);
                          newSubtopics.add(t.id);
                      } else if (parentId) {
                          newSubjects.add(parentId);
                          newTopics.add(t.id);
                      } else {
                          newSubjects.add(t.id);
                      }
                  }
                  if (t.children) findAndSelect(t.children, t.id, parentId);
              }
          };
          findAndSelect(topics);

          setSelectedSubjects(newSubjects);
          setSelectedTopics(newTopics);
          setSelectedSubtopics(newSubtopics);
          
          // Set Question Mode to 'Attempted Incorrect' automatically for Revision
          setQuestionMode('Attempted Incorrect');
          
          // Jump to Config
          setStep('CONFIG');
          return;
      }

      // Scenario B: Single path selection (from Video)
      if (initialSelection && topics.length > 0) {
          // 1. Select Subject
          const newSubjects = new Set([initialSelection.subjectId]);
          setSelectedSubjects(newSubjects);

          // 2. Select Topic (if applicable)
          let foundAsTopic = false;
          let foundAsSubtopic = false;
          let names = { subject: '', topic: '', subtopic: '' };

          const subject = topics.find(t => t.id === initialSelection.subjectId);
          if (subject) {
              names.subject = subject.name;
              
              if (subject.children) {
                const targetId = initialSelection.topicId;
                
                // Check direct children (Topics)
                const directChild = subject.children.find(c => c.id === targetId);
                if (directChild) {
                    setSelectedTopics(new Set([targetId]));
                    foundAsTopic = true;
                    names.topic = directChild.name;
                } else {
                    // Check grandchildren (Subtopics)
                    for (const child of subject.children) {
                        if (child.children) {
                            const grandchild = child.children.find(gc => gc.id === targetId);
                            if (grandchild) {
                                setSelectedTopics(new Set([child.id])); // Select parent topic
                                setSelectedSubtopics(new Set([targetId])); // Select specific subtopic
                                foundAsSubtopic = true;
                                names.topic = child.name;
                                names.subtopic = grandchild.name;
                                break;
                            }
                        }
                    }
                }
             }
          }
          setSelectedPath(names);

          // 3. Move to appropriate step
          if (foundAsSubtopic) setStep('CONFIG');
          else if (foundAsTopic) setStep('SUBTOPIC');
          else setStep('TOPIC');
      }
  }, [initialSelection, preSelectedTopicIds, topics]);

  const toggleSelection = (id: string, currentSet: Set<string>, setFunction: React.Dispatch<React.SetStateAction<Set<string>>>) => {
      const newSet = new Set(currentSet);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setFunction(newSet);
  };

  const toggleDifficulty = (level: string) => {
      const newSet = new Set(difficulty);
      if (newSet.has(level)) {
        if (newSet.size > 1) {
            newSet.delete(level); // Ensure at least one remains selected
        }
      } else {
        newSet.add(level);
      }
      setDifficulty(newSet);
  };

  const handleNextStep = () => {
      if (step === 'SUBJECT' && selectedSubjects.size > 0) setStep('TOPIC');
      else if (step === 'TOPIC') setStep('SUBTOPIC');
      else if (step === 'SUBTOPIC') setStep('CONFIG');
  };
  
  const handleBackStep = () => {
      if (step === 'CONFIG') {
          // If we came from pre-selection, going back might need to jump steps or go to start
          if (preSelectedTopicIds) {
             // Reset and go to start
             onBack(); 
             return;
          }
          setStep('SUBTOPIC');
      }
      else if (step === 'SUBTOPIC') setStep('TOPIC');
      else if (step === 'TOPIC') setStep('SUBJECT');
      else if (step === 'SUBJECT') onBack();
  };

  const handleStartCustomQuiz = () => {
      const finalIds = Array.from(selectedSubtopics);
      if (finalIds.length === 0) selectedTopics.forEach(t => finalIds.push(t));
      if (finalIds.length === 0) selectedSubjects.forEach(s => finalIds.push(s));

      const count = parseInt(questionCount) || 10;

      onStartQuiz(
          finalIds, 
          preSelectedTopicIds ? 'Revision Quiz' : `${courseId} Practice Quiz`, 
          customTimeLimit > 0 ? customTimeLimit : undefined,
          customQuizMode,
          {
              questionMode,
              difficulty: Array.from(difficulty),
              questionCount: Math.min(count, 300)
          }
      );
  };

  const handleStartMockExam = () => {
      if (!selectedPaper) return;
      const duration = examMode === 'EXAM' ? selectedPaper.durationMins : (tutorTimeLimit > 0 ? tutorTimeLimit : undefined);
      
      onStartQuiz(
          ['mock_paper', selectedPaper.id], // Use explicit prefix to resolve rules correctly
          selectedPaper.title,
          duration,
          examMode
      );
      setSelectedPaper(null);
  };

  // Helper to find parent subject name
  const getSubjectName = (parentId?: string) => topics.find(t => t.id === parentId)?.name;

  // Derived lists and names
  const availableTopics = topics
    .filter(subject => selectedSubjects.has(subject.id))
    .flatMap(subject => subject.children || []);

  const getSelectedSubjectNames = () => {
    return topics.filter(t => selectedSubjects.has(t.id)).map(t => t.name).join(', ');
  };

  const getSelectedTopicNames = () => {
    return availableTopics.filter(t => selectedTopics.has(t.id)).map(t => t.name).join(', ');
  };

  // --- RENDER DEDICATED VIDEO QUIZ SETUP ---
  if (initialSelection) {
      return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 transition-colors text-sm">
                    Cancel
                </button>
                <ChevronRight size={14} className="text-slate-300" />
                <h1 className="text-xl font-bold text-slate-800">Solve Video Quiz</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-syan border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Selected Topics</h2>
                    <p className="text-sm text-slate-500">The quiz will cover content from the following hierarchy:</p>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                             <div className="w-10 h-10 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center flex-shrink-0">
                                 <Activity size={20} />
                             </div>
                             <div>
                                 <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">Subject</span>
                                 <h3 className="font-bold text-slate-800 text-lg">{selectedPath.subject}</h3>
                             </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 ml-8 relative">
                             <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-slate-200"></div>
                             <div className="absolute -left-6 top-0 bottom-1/2 w-0.5 bg-slate-200"></div>
                             
                             <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                                 <ListTree size={20} />
                             </div>
                             <div>
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Topic</span>
                                 <h3 className="font-bold text-slate-800 text-lg">{selectedPath.topic || 'All Topics'}</h3>
                             </div>
                        </div>

                        {selectedPath.subtopic && (
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 ml-16 relative">
                                <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-slate-200"></div>
                                <div className="absolute -left-6 -top-24 bottom-1/2 w-0.5 bg-slate-200"></div>
                                
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                                    <BrainCircuit size={20} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subtopic</span>
                                    <h3 className="font-bold text-slate-800 text-lg">{selectedPath.subtopic}</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-syan border border-slate-200 p-6 md:p-8 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 md:mb-4 flex items-center gap-2"><Clock size={16} className="text-syan-orange" /> Time Limit</label>
                    <div className="flex flex-wrap items-center gap-3">
                        {[{val:0,label:'No Limit'},{val:15,label:'15m'},{val:30,label:'30m'},{val:60,label:'1h'}].map(opt=>(
                            <button key={opt.val} onClick={()=>setCustomTimeLimit(opt.val)} className={`py-2 md:py-3 px-3 md:px-5 rounded-xl border-2 font-medium text-sm md:text-base transition-all ${customTimeLimit===opt.val?'border-syan-orange bg-white text-syan-orange':'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{opt.label}</button>
                        ))}
                        <div className="relative flex-1 min-w-[120px] max-w-[200px]">
                            <input 
                                type="number" 
                                min="0" 
                                placeholder="Custom"
                                value={customTimeLimit > 0 ? customTimeLimit : ''} 
                                onChange={(e) => setCustomTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                                className={`w-full py-2 md:py-3 pl-4 pr-10 rounded-xl border-2 font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-syan-orange/20 transition-all bg-white ${![0, 15, 30, 60].includes(customTimeLimit) && customTimeLimit > 0 ? 'border-syan-orange text-syan-orange' : 'border-slate-200 text-slate-600 focus:border-syan-orange'}`}
                            />
                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">min</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleStartCustomQuiz} className="bg-gradient-to-r from-syan-teal to-syan-darkteal text-white py-3 md:py-4 px-8 md:px-12 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                        <Play size={20} fill="currentColor" /> Start Video Quiz
                    </button>
                </div>
            </div>
        </div>
        </div>
      );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12 animate-slide-in">
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 text-sm md:text-base">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-800 transition-colors">
                Back to Courses
            </button>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{courseId} Program</h1>
        </div>

      <div className="flex justify-center mb-4">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 inline-flex gap-1 md:gap-2">
            {[
                { id: 'PRACTICE', icon: Layers, label: 'Practice Quiz', color: 'bg-syan-teal', shadow: 'shadow-syan-teal/20' },
                { id: 'PAPERS', icon: FileText, label: 'Mock Exams', color: 'bg-syan-orange', shadow: 'shadow-syan-orange/20' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                        activeTab === tab.id 
                        ? `${tab.color} text-white shadow-md ${tab.shadow}` 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <tab.icon size={16} />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'PRACTICE' && (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs md:text-sm text-slate-500 mb-4 md:mb-6 bg-white px-3 py-2 md:px-4 md:py-3 rounded-lg border border-slate-100 shadow-sm w-fit mx-auto md:mx-0">
                <span className={`font-medium ${step === 'SUBJECT' ? 'text-syan-pink' : ''}`}>Subjects</span>
                <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                <span className={`font-medium ${step === 'TOPIC' ? 'text-syan-orange' : ''}`}>Topics</span>
                <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                <span className={`font-medium ${step === 'SUBTOPIC' ? 'text-syan-teal' : ''}`}>Subtopics</span>
                <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                <span className={`font-medium ${step === 'CONFIG' ? 'text-syan-darkteal' : ''}`}>Confirm</span>
            </div>

            {step === 'SUBJECT' && (
                <div className="space-y-4 md:space-y-6">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">Select Subjects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {topics.map(subject => {
                            const isSelected = selectedSubjects.has(subject.id);
                            return (
                                <div 
                                    key={subject.id}
                                    onClick={() => toggleSelection(subject.id, selectedSubjects, setSelectedSubjects)}
                                    className={`group cursor-pointer rounded-2xl p-4 md:p-6 border-2 transition-all relative ${
                                        isSelected ? 'border-syan-pink bg-pink-50 shadow-syan' : 'border-slate-200 bg-white hover:border-syan-pink/50'
                                    }`}
                                >
                                    <div className="flex justify-between mb-3 md:mb-4">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-syan-pink text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            <Activity size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        {isSelected && <div className="w-5 h-5 md:w-6 md:h-6 bg-syan-pink rounded-full flex items-center justify-center text-white"><Check size={12} className="md:w-3.5 md:h-3.5" /></div>}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-slate-800">{subject.name}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm">{subject.children?.length || 0} Topics</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleNextStep} 
                            disabled={selectedSubjects.size === 0}
                            className="bg-syan-pink text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50 transition-all flex items-center gap-2 text-sm md:text-base shadow-lg shadow-syan-pink/20"
                        >
                            Next Step <ChevronRight size={16} className="md:w-[18px]" />
                        </button>
                    </div>
                </div>
            )}

            {step === 'TOPIC' && (
                <div className="space-y-8 animate-slide-in">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900">Select Topics</h2>
                        {selectedSubjects.size > 0 && (
                            <p className="text-sm text-syan-pink font-medium mt-1">In: {getSelectedSubjectNames()}</p>
                        )}
                    </div>
                    
                    <div className="space-y-8">
                        {topics.filter(subject => selectedSubjects.has(subject.id)).map(subject => (
                            <div key={subject.id} className="animate-slide-up">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Activity size={16} className="text-syan-pink" />
                                    <span className="text-slate-500">{subject.name}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {subject.children?.map(topic => {
                                         const isSelected = selectedTopics.has(topic.id);
                                         return (
                                            <div 
                                                key={topic.id}
                                                onClick={() => toggleSelection(topic.id, selectedTopics, setSelectedTopics)}
                                                className={`flex items-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    isSelected ? 'border-syan-orange bg-orange-50' : 'border-slate-100 bg-white hover:border-syan-orange/30'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded border flex items-center justify-center mr-3 md:mr-4 transition-colors flex-shrink-0 ${isSelected ? 'bg-syan-orange border-syan-orange text-white' : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check size={12} className="md:w-3.5 md:h-3.5" />}
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-semibold text-sm md:text-base text-slate-800">{topic.name}</h4>
                                                </div>
                                            </div>
                                         );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-200">
                         <button onClick={handleBackStep} className="text-slate-500 font-medium text-sm md:text-base">Back</button>
                         <button onClick={handleNextStep} disabled={selectedTopics.size === 0} className="bg-syan-orange text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-2 text-sm md:text-base shadow-lg shadow-syan-orange/20">Next Step <ChevronRight size={16} className="md:w-[18px]" /></button>
                    </div>
                </div>
            )}

            {step === 'SUBTOPIC' && (
                <div className="space-y-6 animate-slide-in">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900">Select Subtopics</h2>
                        {selectedTopics.size > 0 && (
                            <p className="text-sm text-syan-orange font-medium mt-1">In: {getSelectedTopicNames()}</p>
                        )}
                    </div>
                    
                    <div className="space-y-8">
                        {availableTopics.filter(t => selectedTopics.has(t.id)).map(topic => (
                            <div key={topic.id} className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-lg w-fit border border-slate-100">
                                    <span className="text-syan-pink font-medium">{getSubjectName(topic.parentId)}</span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                    <span className="text-syan-orange">{topic.name}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {topic.children?.map(sub => {
                                        const isSelected = selectedSubtopics.has(sub.id);
                                        return (
                                            <div 
                                                key={sub.id}
                                                onClick={() => toggleSelection(sub.id, selectedSubtopics, setSelectedSubtopics)}
                                                className={`flex items-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    isSelected ? 'border-syan-teal bg-teal-50' : 'border-slate-100 bg-white hover:border-syan-teal/30'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded border flex items-center justify-center mr-3 md:mr-4 transition-colors flex-shrink-0 ${isSelected ? 'bg-syan-teal border-syan-teal text-white' : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check size={12} className="md:w-3.5 md:h-3.5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm md:text-base text-slate-800">{sub.name}</h4>
                                                    <p className="text-[10px] md:text-xs text-slate-500">{sub.questionCount} Questions</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                     <div className="flex justify-between pt-4 border-t border-slate-200">
                         <button onClick={handleBackStep} className="text-slate-500 font-medium text-sm md:text-base">Back</button>
                         <button onClick={handleNextStep} className="bg-syan-teal text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-50 transition-all flex items-center gap-2 text-sm md:text-base shadow-lg shadow-syan-teal/20">Configure Quiz <ChevronRight size={16} className="md:w-[18px]" /></button>
                    </div>
                </div>
            )}

            {step === 'CONFIG' && (
                <div className="space-y-6 md:space-y-8 animate-slide-in">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">Quiz Configuration</h2>
                    
                    <div className="syan-card p-6 md:p-8 space-y-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                             <Settings size={18} className="text-syan-pink" /> Quiz Mode
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => setCustomQuizMode('TUTOR')} className={`p-4 rounded-xl border-2 text-left transition-all ${customQuizMode === 'TUTOR' ? 'border-syan-pink bg-pink-50 ring-1 ring-syan-pink' : 'border-slate-200 hover:border-slate-300'}`}>
                                <div className="font-bold flex items-center gap-2 mb-1 text-slate-800"><BrainCircuit size={18} className={customQuizMode==='TUTOR'?'text-syan-pink':'text-slate-400'}/> Tutor Mode</div>
                                <p className="text-[10px] text-slate-500">Immediate feedback.</p>
                            </button>
                            <button onClick={() => setCustomQuizMode('EXAM')} className={`p-4 rounded-xl border-2 text-left transition-all ${customQuizMode === 'EXAM' ? 'border-syan-pink bg-pink-50 ring-1 ring-syan-pink' : 'border-slate-200 hover:border-slate-300'}`}>
                                <div className="font-bold flex items-center gap-2 mb-1 text-slate-800"><FileText size={18} className={customQuizMode==='EXAM'?'text-syan-pink':'text-slate-400'}/> Exam Mode</div>
                                <p className="text-[10px] text-slate-500">Submit at end.</p>
                            </button>
                            <button onClick={() => setCustomQuizMode('FLASHCARD')} className={`p-4 rounded-xl border-2 text-left transition-all ${customQuizMode === 'FLASHCARD' ? 'border-syan-pink bg-pink-50 ring-1 ring-syan-pink' : 'border-slate-200 hover:border-slate-300'}`}>
                                <div className="font-bold flex items-center gap-2 mb-1 text-slate-800"><RefreshCw size={18} className={customQuizMode==='FLASHCARD'?'text-syan-pink':'text-slate-400'}/> Flashcard</div>
                                <p className="text-[10px] text-slate-500">Spaced repetition.</p>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {customQuizMode !== 'FLASHCARD' && (
                            <div className="syan-card p-6 md:p-8 space-y-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={18} className="text-syan-orange" /> Time Limit
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {[{val:0,label:'No Limit'},{val:15,label:'15m'},{val:30,label:'30m'},{val:60,label:'1h'}].map(opt=>(
                                        <button 
                                            key={opt.val} 
                                            onClick={()=>setCustomTimeLimit(opt.val)} 
                                            className={`py-2 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                                customTimeLimit===opt.val
                                                ?'border-syan-orange bg-white text-syan-orange'
                                                :'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                    <div className="relative flex-1 min-w-[100px]">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            placeholder="Custom"
                                            value={customTimeLimit > 0 ? customTimeLimit : ''} 
                                            onChange={(e) => setCustomTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                                            className={`w-full py-2 pl-3 pr-8 rounded-xl border-2 font-bold text-sm focus:outline-none focus:ring-0 transition-all bg-white ${
                                                ![0, 15, 30, 60].includes(customTimeLimit) && customTimeLimit > 0 
                                                ? 'border-syan-orange text-syan-orange' 
                                                : 'border-slate-200 text-slate-600 focus:border-syan-orange'
                                            }`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">m</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`syan-card p-6 md:p-8 space-y-4 ${customQuizMode === 'FLASHCARD' ? 'md:col-span-2' : ''}`}>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Hash size={18} className="text-syan-teal" /> {customQuizMode === 'FLASHCARD' ? 'Daily Goal (Cards)' : 'Number of Questions'}
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-32">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="300"
                                        placeholder="0"
                                        value={questionCount}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val > 300) return;
                                            setQuestionCount(e.target.value);
                                        }}
                                        className="w-full p-3 text-center text-lg font-bold border-2 border-syan-teal rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-4 focus:ring-syan-teal/10"
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    Max allowed per session: 300
                                </span>
                            </div>
                        </div>
                    </div>

                    {customQuizMode !== 'FLASHCARD' && (
                        <>
                            <div className="syan-card p-6 md:p-8 space-y-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Filter size={18} className="text-syan-darkteal" /> Question Mode
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {questionModes.map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setQuestionMode(mode)}
                                            className={`py-2 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                                questionMode === mode
                                                ? 'border-syan-darkteal bg-teal-50 text-syan-darkteal'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="syan-card p-6 md:p-8 space-y-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Gauge size={18} className="text-syan-darkteal" /> Difficulty Level
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {difficultyLevels.map(level => {
                                        const isSelected = difficulty.has(level);
                                        return (
                                            <div 
                                                key={level} 
                                                onClick={() => toggleDifficulty(level)}
                                                className="flex items-center gap-3 cursor-pointer group"
                                            >
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                                                    isSelected 
                                                    ? 'bg-syan-darkteal border-syan-darkteal' 
                                                    : 'border-slate-300 bg-white group-hover:border-syan-darkteal'
                                                }`}>
                                                    {isSelected && <Check size={14} className="text-white" />}
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full border-2 text-sm font-bold transition-colors ${
                                                    isSelected
                                                    ? 'border-syan-darkteal text-syan-darkteal bg-teal-50'
                                                    : 'border-slate-200 text-slate-500 group-hover:border-slate-300'
                                                }`}>
                                                    {level}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <button onClick={handleBackStep} className="text-slate-500 font-medium text-sm md:text-base hover:text-slate-800 transition-colors">Back</button>
                        <button onClick={handleStartCustomQuiz} className="bg-gradient-to-r from-syan-teal to-syan-darkteal text-white py-3 md:py-4 px-6 md:px-8 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl flex items-center gap-2 transform transition-all active:scale-95">
                            <Play size={20} fill="currentColor" /> Start {customQuizMode === 'FLASHCARD' ? 'Study' : 'Quiz'}
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}

      {activeTab === 'PAPERS' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
                {papers.map(paper => (
                    <div key={paper.id} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-syan-hover transition-all">
                        <div className="flex justify-between mb-3 md:mb-4">
                            <span className={`px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase ${paper.difficulty==='Hard'?'bg-red-100 text-red-600':paper.difficulty==='Medium'?'bg-amber-100 text-amber-600':'bg-green-100 text-green-600'}`}>{paper.difficulty}</span>
                            <span className="text-slate-400 text-xs md:text-sm flex items-center gap-1"><Clock size={14}/> {paper.durationMins}m</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">{paper.title}</h3>
                        <p className="text-slate-500 text-xs md:text-sm mb-4 md:mb-6">{paper.description}</p>
                        <button onClick={() => setSelectedPaper(paper)} className="w-full bg-slate-900 hover:bg-syan-orange text-white py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base">Solve Paper</button>
                    </div>
                ))}
            </div>

            {selectedPaper && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="p-4 md:p-6 bg-slate-50 border-b">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900">Configure Mock Exam</h3>
                        </div>
                        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">Select Mode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setExamMode('TUTOR')} className={`p-3 md:p-4 rounded-xl border-2 text-left ${examMode === 'TUTOR' ? 'border-syan-teal bg-teal-50' : 'border-slate-200'}`}>
                                        <div className="font-bold flex gap-2 mb-1 text-sm md:text-base"><BrainCircuit size={18}/> Tutor</div>
                                        <p className="text-[10px] md:text-xs text-slate-500">Immediate feedback.</p>
                                    </button>
                                    <button onClick={() => setExamMode('EXAM')} className={`p-3 md:p-4 rounded-xl border-2 text-left ${examMode === 'EXAM' ? 'border-syan-teal bg-teal-50' : 'border-slate-200'}`}>
                                        <div className="font-bold flex gap-2 mb-1 text-sm md:text-base"><FileText size={18}/> Exam</div>
                                        <p className="text-[10px] md:text-xs text-slate-500">Standard conditions.</p>
                                    </button>
                                </div>
                            </div>
                            {examMode === 'TUTOR' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 md:mb-3">Time Limit</label>
                                    <div className="flex gap-2">
                                        {[0, 30, 60].map(m => <button key={m} onClick={()=>setTutorTimeLimit(m)} className={`py-2 px-3 rounded border text-xs md:text-sm flex-1 ${tutorTimeLimit===m?'bg-slate-800 text-white':'bg-white'}`}>{m===0?'Unlimited':`${m}m`}</button>)}
                                         <div className="relative flex-1">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                placeholder="Custom"
                                                value={tutorTimeLimit > 0 && ![0,30,60].includes(tutorTimeLimit) ? tutorTimeLimit : ''} 
                                                onChange={(e) => setTutorTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                                                className={`w-full py-2 px-2 pl-3 pr-8 rounded border text-xs md:text-sm focus:outline-none focus:border-slate-800 ${tutorTimeLimit > 0 && ![0,30,60].includes(tutorTimeLimit) ? 'border-slate-800' : 'border-slate-200'}`}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">min</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 md:p-6 border-t bg-slate-50 flex gap-3">
                            <button onClick={()=>setSelectedPaper(null)} className="flex-1 py-2.5 md:py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-sm md:text-base">Cancel</button>
                            <button onClick={handleStartMockExam} className="flex-1 py-2.5 md:py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 text-sm md:text-base">Start</button>
                        </div>
                    </div>
                </div>
            )}
        </>
      )}
    </div>
    </div>
  );
};
