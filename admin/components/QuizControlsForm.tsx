
import React from 'react';
import { QuizControls } from '../services/quizControlsService';
import { 
  Clock, Navigation2, Users, ShieldAlert, 
  History, Info, AlertTriangle, Monitor, 
  MousePointer, Copy, Maximize, Eye, Settings2,
  ShieldCheck, AlertOctagon, XCircle, Shield,
  Smartphone, Camera, Lock, Ban, Activity
} from 'lucide-react';

interface QuizControlsFormProps {
  controls: QuizControls;
  onChange: (updates: Partial<QuizControls>) => void;
  isOverride?: boolean;
}

export const QuizControlsForm: React.FC<QuizControlsFormProps> = ({ controls, onChange, isOverride }) => {
  
  const toggle = (field: keyof QuizControls) => {
    onChange({ [field]: !controls[field] });
  };

  const updateField = (field: keyof QuizControls, value: any) => {
    onChange({ [field]: value });
  };

  const updateProctoring = (updates: Partial<NonNullable<QuizControls['proctoring']>>) => {
    onChange({
      proctoring: {
        enabled: false,
        fullscreenRequired: false,
        blockBackNavigation: false,
        disableCopyPaste: false,
        disableRightClick: false,
        disableTextSelection: false,
        detectTabSwitch: false,
        maxTabSwitches: 3,
        detectWindowBlur: false,
        maxWindowBlurs: 3,
        collectClientHints: false,
        hashIpIfAvailable: false,
        hideExplanationUntilSubmit: false,
        lockQuestionNavigation: false,
        oneQuestionAtATime: false,
        actionOnThreshold: 'warn',
        violationThreshold: 5,
        allowUserScreenshotCapture: false,
        ...controls.proctoring,
        ...updates
      }
    });
  };

  const SectionTitle = ({ icon: Icon, title, desc, color }: any) => (
    <div className="flex items-center gap-4 mb-6">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">{title}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
    </div>
  );

  const ToggleItem = ({ label, field, desc }: { label: string, field: keyof QuizControls, desc?: string }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
        {desc && <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button 
        onClick={() => toggle(field)}
        className={`w-11 h-6 rounded-full p-1 transition-colors ${controls[field] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${controls[field] ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const ProctorToggleItem = ({ label, field, desc }: { label: string, field: keyof NonNullable<QuizControls['proctoring']>, desc?: string }) => (
    <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
        {desc && <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button 
        onClick={() => updateProctoring({ [field]: !controls.proctoring?.[field] })}
        className={`w-11 h-6 rounded-full p-1 transition-colors ${controls.proctoring?.[field] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${controls.proctoring?.[field] ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Proctoring (Mock Only) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <SectionTitle icon={ShieldCheck} title="Proctoring (Mock Only)" desc="Advanced Integrity Enforcement" color="bg-indigo-500" />
          <button 
            onClick={() => updateProctoring({ enabled: !controls.proctoring?.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${controls.proctoring?.enabled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
          >
            {controls.proctoring?.enabled ? 'System Active' : 'Enable Proctoring'}
          </button>
        </div>

        {controls.proctoring?.enabled ? (
          <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50 space-y-8 animate-slide-up">
            
            {/* Behavior & Interactions */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Activity size={14} /> Interaction Blocking
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProctorToggleItem label="Force Fullscreen" field="fullscreenRequired" desc="Request on start, log exit" />
                <ProctorToggleItem label="Block Back Nav" field="blockBackNavigation" desc="Warn on back/exit attempt" />
                <ProctorToggleItem label="Disable Copy/Paste" field="disableCopyPaste" desc="Block clipboard & Ctrl+C/V" />
                <ProctorToggleItem label="Disable Right-Click" field="disableRightClick" desc="Prevent context menu" />
                <ProctorToggleItem label="Disable Text Select" field="disableTextSelection" desc="Prevent highlighting text" />
                <ProctorToggleItem label="Collect Client Hints" field="collectClientHints" desc="Log browser, OS, and screen info" />
              </div>
            </div>

            {/* Switching & Focus */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Ban size={14} /> Switching & Focus Detection
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ProctorToggleItem label="Detect Tab Switch" field="detectTabSwitch" />
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Max Tab Switches Allowed</label>
                    <input 
                      type="number"
                      value={controls.proctoring?.maxTabSwitches ?? 3}
                      onChange={(e) => updateProctoring({ maxTabSwitches: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <ProctorToggleItem label="Detect Window Blur" field="detectWindowBlur" desc="Loss of focus on browser window" />
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Max Window Blurs Allowed</label>
                    <input 
                      type="number"
                      value={controls.proctoring?.maxWindowBlurs ?? 3}
                      onChange={(e) => updateProctoring({ maxWindowBlurs: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Policy */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                <Lock size={14} /> Exam Delivery Policy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProctorToggleItem label="Hide Answers Until End" field="hideExplanationUntilSubmit" desc="Standard mock exam behavior" />
                <ProctorToggleItem label="Lock Question Nav" field="lockQuestionNavigation" desc="Cannot return to previous question" />
                <ProctorToggleItem label="Step-by-Step Delivery" field="oneQuestionAtATime" desc="Strict sequential navigation" />
                <ProctorToggleItem label="User Screenshot Req" field="allowUserScreenshotCapture" desc="Candidate must manually snap photo if asked" />
              </div>
            </div>

            {/* Enforcement Action */}
            <div className="pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Threshold Enforcement Action</label>
                    <select 
                      value={controls.proctoring?.actionOnThreshold || 'warn'}
                      onChange={(e) => updateProctoring({ actionOnThreshold: e.target.value as any })}
                      className="w-full bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-3 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="warn">Warn Student</option>
                      <option value="flag">Silent Flag (Review later)</option>
                      <option value="autosubmit">Automatic Terminate & Submit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Violation Threshold</label>
                    <input 
                      type="number"
                      value={controls.proctoring?.violationThreshold ?? 5}
                      onChange={(e) => updateProctoring({ violationThreshold: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-3 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
               </div>
            </div>
            
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
              <AlertOctagon size={20} className="text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase">
                <strong>Crucial:</strong> These proctoring rules apply ONLY to Mock Exams (Mock Paper source). Practice and Tutor modes remain unrestricted to preserve the learning experience.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-slate-400">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-bold">Mock exams currently follow standard platform security. Enable proctoring for strict enforcement.</p>
          </div>
        )}
      </section>

      {/* 1. Timer Controls */}
      <section>
        <SectionTitle icon={Clock} title="Timer & Chronology" desc="Scheduling and Time Management" color="bg-primary-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Default Time Limit (Mins)</label>
            <input 
              type="number" 
              value={controls.defaultTimeLimitMinutes} 
              onChange={(e) => updateField('defaultTimeLimitMinutes', parseInt(e.target.value) || 0)}
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-2.5 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <ToggleItem label="Auto-Submit on Time Up" field="autoSubmitOnTimeUp" desc="Force submission when clock hits zero" />
          <ToggleItem label="Per-Section Timing" field="perSectionTimingEnabled" desc="Enable independent timers for each section" />
        </div>
      </section>

      {/* 2. Navigation Controls */}
      <section>
        <SectionTitle icon={Navigation2} title="Interface & Navigation" desc="Student Experience Controls" color="bg-emerald-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleItem label="Allow Back Navigation" field="allowBackNavigation" desc="Students can return to previous questions" />
          <ToggleItem label="Allow Skipping" field="allowQuestionSkipping" desc="Permit skipping without answering" />
          <ToggleItem label="Show Progress Bar" field="showProgressBar" />
          <ToggleItem label="Show Question Numbers" field="showQuestionNumbers" />
          <ToggleItem label="Randomize Options" field="randomizeOptions" desc="Shuffle distractors per attempt" />
        </div>
      </section>

      {/* 3. Attempts & Access */}
      <section>
        <SectionTitle icon={Users} title="Access & Enrollment" desc="Attempt limits and availability" color="bg-amber-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Attempts Allowed (Default)</label>
            <input 
              type="number" 
              value={controls.attemptsAllowedDefault} 
              onChange={(e) => updateField('attemptsAllowedDefault', parseInt(e.target.value) || 0)}
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-2.5 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500/20"
              placeholder="0 for unlimited"
            />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Cooldown Between Attempts (Mins)</label>
            <input 
              type="number" 
              value={controls.cooldownMinutesBetweenAttempts} 
              onChange={(e) => updateField('cooldownMinutesBetweenAttempts', parseInt(e.target.value) || 0)}
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-2.5 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <ToggleItem label="Require Authentication" field="requireLogin" desc="Strictly block guest access" />
          <ToggleItem label="Allow Resuming" field="allowResumePausedAttempt" desc="Support continuing interrupted tests" />
        </div>
      </section>

      {/* 4. Anti-Cheat Controls (Legacy) */}
      <section className="opacity-50">
        <SectionTitle icon={ShieldAlert} title="Legacy Security" desc="Legacy Anti-Cheat Controls" color="bg-slate-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleItem label="Legacy Copy/Paste Block" field="blockCopyPaste" />
          <ToggleItem label="Legacy Right-Click Block" field="blockRightClick" />
        </div>
      </section>

      {/* 5. Logging & Severity */}
      <section>
        <SectionTitle icon={History} title="Violation Logging" desc="Event tracking and severity mapping" color="bg-purple-500" />
        <div className="space-y-4">
          <ToggleItem label="Log Integrity Violations" field="logViolations" desc="Save suspicious events to audit trail" />
          
          {controls.logViolations && (
            <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 text-white space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Severity Mapping</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(controls.violationSeverityMap).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{key}</label>
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                      {['low', 'medium', 'high'].map(sev => (
                        <button
                          key={sev}
                          onClick={() => updateField('violationSeverityMap', { ...controls.violationSeverityMap, [key]: sev })}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${value === sev ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
