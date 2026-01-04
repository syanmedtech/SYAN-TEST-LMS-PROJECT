
import React from 'react';
import { SelectionRules, DifficultyMix } from '../services/selectionRulesService';
import { 
  Shuffle, 
  BarChart, 
  Layers, 
  RotateCcw, 
  AlertCircle, 
  MinusCircle, 
  Settings2,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Target,
  LineChart
} from 'lucide-react';

interface SelectionRulesFormProps {
  rules: SelectionRules;
  onChange: (updates: Partial<SelectionRules>) => void;
  isOverride?: boolean;
}

export const SelectionRulesForm: React.FC<SelectionRulesFormProps> = ({ rules, onChange, isOverride }) => {
  const handleDifficultyChange = (field: keyof DifficultyMix, value: number) => {
    const newMix = { ...rules.difficultyMix, [field]: value };
    onChange({ difficultyMix: newMix });
  };

  const totalDiff = rules.difficultyMix.easy + rules.difficultyMix.medium + rules.difficultyMix.hard;
  const isDiffValid = totalDiff === 100;

  const toggleSource = (source: 'hierarchy' | 'tags' | 'set') => {
    const current = [...rules.sourcePriority];
    const index = current.indexOf(source);
    if (index > -1) {
      if (current.length > 1) current.splice(index, 1);
    } else {
      current.push(source);
    }
    onChange({ sourcePriority: current });
  };

  const updateAdaptive = (updates: Partial<NonNullable<SelectionRules['adaptive']>>) => {
    onChange({ 
      adaptive: { 
        enabled: false, 
        intensity: 50, 
        weakTopicBias: 50, 
        difficultyTarget: 'balanced',
        ...rules.adaptive, 
        ...updates 
      } 
    });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Precision Engine (Adaptive) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">Precision Engine (Adaptive)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI-Powered Mastery Calibration</p>
            </div>
          </div>
          <button 
            onClick={() => updateAdaptive({ enabled: !rules.adaptive?.enabled })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${rules.adaptive?.enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${rules.adaptive?.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {rules.adaptive?.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-purple-50/30 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-800/50 animate-slide-up">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Adaptation Intensity
                  </label>
                  <span className="text-sm font-black text-purple-600">{rules.adaptive.intensity}%</span>
                </div>
                <input 
                  type="range"
                  value={rules.adaptive.intensity}
                  onChange={(e) => updateAdaptive({ intensity: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[9px] text-slate-400 font-medium">Controls how heavily the selection engine weighs student mastery vs pure randomness.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target size={14} /> Weak Topic Bias
                  </label>
                  <span className="text-sm font-black text-purple-600">{rules.adaptive.weakTopicBias}%</span>
                </div>
                <input 
                  type="range"
                  value={rules.adaptive.weakTopicBias}
                  onChange={(e) => updateAdaptive({ weakTopicBias: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LineChart size={14} /> Difficulty Targeting
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['remedial', 'balanced', 'stretch'] as const).map(target => (
                    <button
                      key={target}
                      onClick={() => updateAdaptive({ difficultyTarget: target })}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        rules.adaptive?.difficultyTarget === target
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-purple-200'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">
                  {rules.adaptive.difficultyTarget === 'remedial' ? 'Prioritizes easier questions to build student confidence.' : 
                   rules.adaptive.difficultyTarget === 'stretch' ? 'Pushes students with harder content once mastery is reached.' : 
                   'Maintains the configured Difficulty Mix proportions.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Randomization & Repeats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2.5 rounded-xl text-primary-600">
              <Shuffle size={20} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-white text-sm">Shuffle Question Order</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Randomize delivery sequence</p>
            </div>
          </div>
          <button 
            onClick={() => onChange({ randomizeOrder: !rules.randomizeOrder })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${rules.randomizeOrder ? 'bg-primary-600' : 'bg-slate-300'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${rules.randomizeOrder ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-xl text-amber-600">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-white text-sm">Avoid Repeat Questions</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Per-user attempt history isolation</p>
            </div>
          </div>
          <button 
            onClick={() => onChange({ avoidRepeats: !rules.avoidRepeats })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${rules.avoidRepeats ? 'bg-amber-500' : 'bg-slate-300'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${rules.avoidRepeats ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Difficulty Mix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart className="text-primary-600" size={20} /> Difficulty Mix Algorithm
          </h3>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${isDiffValid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            Total: {totalDiff}% {isDiffValid ? <CheckCircle2 size={12} className="inline ml-1" /> : <AlertCircle size={12} className="inline ml-1" />}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(['easy', 'medium', 'hard'] as const).map(level => (
            <div key={level} className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{level} weightage</label>
                <span className="text-lg font-black text-slate-800 dark:text-white">{rules.difficultyMix[level]}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                step="5"
                value={rules.difficultyMix[level]}
                onChange={(e) => handleDifficultyChange(level, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          ))}
        </div>
        {!isDiffValid && (
          <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
            <AlertCircle size={12} /> The total difficulty mix must equal exactly 100%. Current gap: {100 - totalDiff}%
          </p>
        )}
      </section>

      {/* Source Priority */}
      <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Layers className="text-emerald-600" size={20} /> Selection Source Priority
        </h3>
        <p className="text-xs text-slate-500 font-medium">Define which blueprint strategy takes precedence when building the question pool.</p>
        
        <div className="flex flex-wrap gap-4">
          {(['hierarchy', 'tags', 'set'] as const).map((source, idx) => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-black text-sm uppercase tracking-tight ${
                rules.sourcePriority.includes(source)
                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md ring-1 ring-primary-500'
                : 'border-slate-100 text-slate-400 opacity-50'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 border flex items-center justify-center text-[10px]">{rules.sourcePriority.indexOf(source) + 1}</span>
              {source}
            </button>
          ))}
        </div>
      </section>

      {/* Defaults & Section Overrides */}
      <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <MinusCircle className="text-red-500" size={20} /> Negative Marking Configuration
          </h3>
          <button 
            onClick={() => onChange({ negativeMarkingEnabled: !rules.negativeMarkingEnabled })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${rules.negativeMarkingEnabled ? 'bg-red-500' : 'bg-slate-300'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${rules.negativeMarkingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penalty Per Wrong Answer</label>
            <div className="relative">
              <input 
                type="number"
                step="0.05"
                min="0"
                disabled={!rules.negativeMarkingEnabled}
                value={rules.negativeMarkPerWrong}
                onChange={(e) => onChange({ negativeMarkPerWrong: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 font-black disabled:opacity-30"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penalty Per Skipped Question</label>
            <div className="relative">
              <input 
                type="number"
                step="0.05"
                min="0"
                disabled={!rules.negativeMarkingEnabled}
                value={rules.negativeMarkPerSkipped}
                onChange={(e) => onChange({ negativeMarkPerSkipped: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 font-black disabled:opacity-30"
              />
            </div>
          </div>
        </div>

        {!isOverride && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Settings2 className="text-purple-600" size={20} /> Platform Inheritance
            </h3>
            <div className="flex items-center justify-between p-4 bg-purple-50/30 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Allow assessments to override these rules</p>
              <button 
                onClick={() => onChange({ allowSectionOverrides: !rules.allowSectionOverrides })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${rules.allowSectionOverrides ? 'bg-purple-600' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${rules.allowSectionOverrides ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
