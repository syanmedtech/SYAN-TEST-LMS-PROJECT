
import React, { useEffect, useState } from 'react';
import { PackageEntitlements } from '../services/packageAdminService';
import { getCourses, getPapers } from '../../services/mockService';
import { Course, Paper } from '../../types';
import { BookOpen, Video, FileText, CheckCircle, Search, ShieldCheck } from 'lucide-react';

interface EntitlementsPickerProps {
  value: PackageEntitlements;
  onChange: (val: PackageEntitlements) => void;
}

export const EntitlementsPicker: React.FC<EntitlementsPickerProps> = ({ value, onChange }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourses(), getPapers()]).then(([c, p]) => {
      setCourses(c);
      setPapers(p);
      setLoading(false);
    });
  }, []);

  const toggleItem = (listKey: keyof Omit<PackageEntitlements, 'qbank'>, itemId: string) => {
    const list = [...(value[listKey] as string[])];
    const index = list.indexOf(itemId);
    if (index > -1) list.splice(index, 1);
    else list.push(itemId);
    onChange({ ...value, [listKey]: list });
  };

  const toggleQBank = () => {
    onChange({ ...value, qbank: { ...value.qbank, enabled: !value.qbank.enabled } });
  };

  const programs = ["MBBS", "FCPS", "NRE", "USMLE", "NLE", "MRCP"];

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse font-bold">Synchronizing resources...</div>;

  return (
    <div className="space-y-12">
      {/* 1. Programs */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <ShieldCheck size={14} className="text-primary-500" /> Target Programs / Tracks
        </h4>
        <div className="flex flex-wrap gap-2">
          {programs.map(prog => {
            const isSelected = value.programs.includes(prog);
            return (
              <button
                key={prog}
                onClick={() => toggleItem('programs', prog)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  isSelected 
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
                }`}
              >
                {prog}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. QBank */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <BookOpen size={14} className="text-emerald-500" /> Question Bank Access
        </h4>
        <div 
          onClick={toggleQBank}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
            value.qbank.enabled ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${value.qbank.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <BookOpen size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white">Enable Full QBank Access</p>
              <p className="text-xs text-slate-500">Unlocks all subjects and subtopics for practice</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${value.qbank.enabled ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
            {value.qbank.enabled && <CheckCircle size={16} className="text-white" />}
          </div>
        </div>
      </section>

      {/* 3. Video Courses */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <Video size={14} className="text-purple-500" /> Video Course Bundles
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {courses.map(course => {
            const isSelected = value.videoCourses.includes(course.id);
            return (
              <button
                key={course.id}
                onClick={() => toggleItem('videoCourses', course.id)}
                className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-purple-200'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                  <img src={course.thumbnailUrl} className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{course.title}</p>
                   <p className="text-[10px] text-slate-500">{course.examCategory}</p>
                </div>
                {isSelected && <CheckCircle size={14} className="ml-auto text-purple-600" />}
              </button>
            );
          })}
          {courses.length === 0 && <p className="text-slate-400 text-xs py-4 text-center">No courses found in database.</p>}
        </div>
      </section>

      {/* 4. Mock Exams */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <FileText size={14} className="text-syan-orange" /> Exam / Mock Paper Access
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {papers.map(paper => {
            const isSelected = value.exams.includes(paper.id);
            return (
              <button
                key={paper.id}
                onClick={() => toggleItem('exams', paper.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  isSelected 
                    ? 'border-syan-orange bg-orange-50 dark:bg-orange-900/20 ring-1 ring-syan-orange' 
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-syan-orange/20'
                }`}
              >
                <div>
                   <p className="text-xs font-bold text-slate-800 dark:text-white">{paper.title}</p>
                   <p className="text-[10px] text-slate-500">{paper.questionCount} Questions • {paper.difficulty}</p>
                </div>
                {isSelected && <CheckCircle size={14} className="ml-auto text-syan-orange" />}
              </button>
            );
          })}
          {papers.length === 0 && <p className="text-slate-400 text-xs py-4 text-center">No exam papers found in database.</p>}
        </div>
      </section>
    </div>
  );
};
