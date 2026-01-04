
import React from 'react';
import { Book, Stethoscope, Activity, Globe, ArrowRight } from 'lucide-react';

interface CoursesProps {
  onSelectCourse: (courseId: string) => void;
}

export const Courses: React.FC<CoursesProps> = ({ onSelectCourse }) => {
  const courses = [
    { 
      id: 'MBBS', 
      title: 'MBBS', 
      desc: 'Complete undergraduate medical curriculum coverage.',
      color: 'bg-syan-teal',
      icon: Book 
    },
    { 
      id: 'FCPS', 
      title: 'FCPS', 
      desc: 'Fellowship of College of Physicians & Surgeons Prep.',
      color: 'bg-syan-darkteal',
      icon: Stethoscope 
    },
    { 
      id: 'NRE', 
      title: 'NRE', 
      desc: 'National Registration Exam comprehensive review.',
      color: 'bg-syan-pink',
      icon: Activity 
    },
    { 
      id: 'USMLE', 
      title: 'USMLE', 
      desc: 'Step 1, 2 CK & 3 high-yield question banks.',
      color: 'bg-syan-orange',
      icon: Globe 
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Available Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Select a course to access quizzes, mock exams, and study materials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {courses.map((course) => (
          <div 
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-syan border border-slate-200 dark:border-slate-700 cursor-pointer group hover:border-white/50 hover:shadow-syan-hover transition-all relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-40 h-40 ${course.color} opacity-10 dark:opacity-20 rounded-bl-full transform group-hover:scale-125 transition-transform duration-500`}></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className={`w-16 h-16 rounded-2xl ${course.color} bg-opacity-10 flex items-center justify-center mb-8`}>
                 <course.icon size={32} className={`${course.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-colors shadow-sm">
                 <ArrowRight size={20} />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 relative z-10 tracking-tight">{course.title}</h3>
            <p className="text-base text-slate-500 dark:text-slate-400 relative z-10 pr-4 leading-relaxed">{course.desc}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
