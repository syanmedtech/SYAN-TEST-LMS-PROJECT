
import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { getCourses } from '../services/mockService';
import { 
  ArrowRight, Search, ChevronLeft, PlayCircle, FileText, BrainCircuit,
  Stethoscope, Activity, HeartPulse, Brain, Syringe
} from 'lucide-react';

interface VideoCoursesProps {
  onSelectCourse: (courseId: string) => void;
}

export const VideoCourses: React.FC<VideoCoursesProps> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const exams = [
      { id: 'MBBS', label: 'MBBS', desc: 'Undergraduate Curriculum', color: 'bg-syan-teal' },
      { id: 'FCPS', label: 'FCPS', desc: 'Postgrad Residency', color: 'bg-syan-darkteal' },
      { id: 'NRE', label: 'NRE', desc: 'National Registration', color: 'bg-syan-pink' },
      { id: 'USMLE', label: 'USMLE', desc: 'Step 1 & 2 CK', color: 'bg-syan-orange' },
      { id: 'NLE', label: 'NLE', desc: 'Licensing Exam', color: 'bg-slate-700' },
      { id: 'MRCP', label: 'MRCP', desc: 'Royal College', color: 'bg-blue-600' },
  ];

  // Filter courses based on selected exam
  const filteredCourses = courses.filter(c => {
      if (selectedExam && c.examCategory !== selectedExam) return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
  });

  return (
    <div className="h-full overflow-y-auto scroll-smooth p-4 md:p-8">
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
       
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
                {selectedExam && (
                    <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                        <ChevronLeft size={14} /> Back to Exams
                    </button>
                )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {selectedExam ? `${selectedExam} Courses` : 'Exam Categories'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                {selectedExam ? 'Select a course to start learning.' : 'Choose your exam path to browse courses.'}
            </p>
          </div>
          
          {selectedExam && (
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search courses..." 
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-syan-teal/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          )}
       </div>

       {!selectedExam ? (
           /* VIEW 1: EXAM CATEGORY TILES */
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {exams.map(exam => (
                   <div 
                        key={exam.id}
                        onClick={() => setSelectedExam(exam.id)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-syan border border-slate-200 dark:border-slate-700 cursor-pointer group hover:border-syan-teal hover:shadow-syan-hover transition-all relative overflow-hidden"
                   >
                       {/* Background Accent */}
                       <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${exam.color} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
                       
                       <div className="flex justify-between items-start mb-4">
                           <div className={`w-14 h-14 rounded-xl ${exam.color} bg-opacity-10 flex items-center justify-center text-slate-700 dark:text-white`}>
                               {exam.id === 'MBBS' && <Brain size={28} className={exam.color.replace('bg-', 'text-')} />}
                               {exam.id === 'FCPS' && <Stethoscope size={28} className={exam.color.replace('bg-', 'text-')} />}
                               {exam.id === 'USMLE' && <Activity size={28} className={exam.color.replace('bg-', 'text-')} />}
                               {(!['MBBS','FCPS','USMLE'].includes(exam.id)) && <HeartPulse size={28} className={exam.color.replace('bg-', 'text-')} />}
                           </div>
                           <ArrowRight className="text-slate-300 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
                       </div>
                       
                       <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 relative z-10">{exam.label}</h3>
                       <p className="text-sm text-slate-500 dark:text-slate-400 relative z-10">{exam.desc}</p>
                   </div>
               ))}
           </div>
       ) : (
           /* VIEW 2: COURSE LIST TILES (Nearpeer Style) */
           <>
               {filteredCourses.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm">
                            <Search size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No courses found matching "{search}"</p>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {filteredCourses.map(course => (
                            <div 
                                key={course.id} 
                                onClick={() => onSelectCourse(course.id)}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700 overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full"
                            >
                                {/* Course Thumbnail Area */}
                                <div className="relative h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                    <img 
                                        src={course.thumbnailUrl || `https://ui-avatars.com/api/?name=${course.title}&background=random&size=400`} 
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 text-white">
                                        <p className="text-xs font-bold opacity-80 uppercase tracking-wider">{course.examCategory}</p>
                                        <h3 className="text-xl font-bold leading-tight">{course.title}</h3>
                                    </div>
                                </div>
                                
                                {/* Content Info */}
                                <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                            {/* Avatar placeholder */}
                                            <img src={`https://ui-avatars.com/api/?name=${course.author}`} alt="Author" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{course.author}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-center">
                                            <PlayCircle size={18} className="mx-auto text-syan-teal mb-1" />
                                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">{course.stats.videos}</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Videos</span>
                                        </div>
                                        <div className="text-center border-l border-r border-slate-100 dark:border-slate-700">
                                            <BrainCircuit size={18} className="mx-auto text-syan-orange mb-1" />
                                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">{course.stats.quizzes}</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Quizzes</span>
                                        </div>
                                        <div className="text-center">
                                            <FileText size={18} className="mx-auto text-syan-pink mb-1" />
                                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">{course.stats.notes}</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Notes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
               )}
           </>
       )}
    </div>
    </div>
  );
};
