
import React from 'react';
import { 
  Edit, Copy, Eye, EyeOff, Archive, 
  Video as VideoIcon, Layers, PlayCircle, 
  Clock, CheckCircle, AlertCircle 
} from 'lucide-react';
import { VideoCourse } from '../services/videoCourseAdminService';

interface VideoCoursesTableProps {
  courses: VideoCourse[];
  loading: boolean;
  onEdit: (course: VideoCourse) => void;
  onDuplicate: (course: VideoCourse) => void;
  onStatusToggle: (id: string, current: string) => void;
  onArchive: (id: string) => void;
}

export const VideoCoursesTable: React.FC<VideoCoursesTableProps> = ({ 
  courses, loading, onEdit, onDuplicate, onStatusToggle, onArchive 
}) => {
  if (loading && courses.length === 0) return (
    <div className="py-24 flex flex-col items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-6"></div>
      <p className="font-black tracking-widest uppercase text-xs">Syncing Catalog...</p>
    </div>
  );
  
  if (courses.length === 0) return (
    <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
      <VideoIcon size={64} className="mx-auto text-slate-200 mb-6" />
      <h3 className="text-xl font-black text-slate-800 dark:text-white">No Video Courses</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-3">Start by creating a new video course to populate your library.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5">Course Title</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5 text-center">Structure</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Updated</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <VideoIcon size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{course.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{course.subtitle || 'Educational Content'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 uppercase">
                     {course.programName || course.programId || 'General'}
                   </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <div className="flex flex-col gap-1 items-center">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Layers size={12} className="text-primary-500" /> {course.totalModules} Modules
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <PlayCircle size={12} className="text-emerald-500" /> {course.totalLessons} Lessons
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    course.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${course.status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
                    {course.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                    <Clock size={12} />
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(course)}
                      className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDuplicate(course)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => onStatusToggle(course.id, course.status)}
                      className={`p-2.5 rounded-xl transition-all ${course.status === 'published' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={course.status === 'published' ? "Unpublish" : "Publish"}
                    >
                      {course.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      onClick={() => onArchive(course.id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Archive"
                    >
                      <Archive size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
