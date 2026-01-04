
import React, { useState } from 'react';
import { Lesson } from '../services/videoCourseAdminService';
import { 
  Video, FileText, Link as LinkIcon, Trash2, 
  ChevronUp, ChevronDown, Settings, Eye, EyeOff, Clock, AlertTriangle
} from 'lucide-react';
import { FileUploadButton } from './FileUploadButton';
import { uploadFile, getLessonAssetPath } from '../services/storageUploadService';

interface LessonEditorProps {
  lesson: Lesson;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updated: Lesson) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  courseId?: string;
  moduleId?: string;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({ 
  lesson, index, isFirst, isLast, onUpdate, onRemove, onMove, courseId, moduleId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAssetUpload = async (file: File, onProgress: (p: number) => void) => {
    if (!courseId || !moduleId) {
      alert("Course and Module metadata missing. Save the course shell first.");
      throw new Error("Missing metadata");
    }

    const path = getLessonAssetPath(courseId, moduleId, lesson.id, file.name);
    const result = await uploadFile(file, path, onProgress);
    
    if (lesson.type === 'video') onUpdate({ ...lesson, videoSource: result.downloadUrl });
    else if (lesson.type === 'pdf') onUpdate({ ...lesson, fileUrl: result.downloadUrl });
    
    return result.downloadUrl;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-primary-600 flex-shrink-0">
            {lesson.type === 'video' ? <Video size={16} /> : lesson.type === 'pdf' ? <FileText size={16} /> : <LinkIcon size={16} />}
          </div>
          <div className="flex-1 min-w-0">
             <input 
                value={lesson.title}
                onChange={(e) => onUpdate({ ...lesson, title: e.target.value })}
                className="bg-transparent border-none focus:ring-0 font-bold text-sm text-slate-700 dark:text-slate-200 w-full"
                placeholder="Lesson title..."
             />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => onUpdate({ ...lesson, isFreePreview: !lesson.isFreePreview })}
            className={`p-2 rounded-lg transition-all ${lesson.isFreePreview ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-300'}`}
            title="Toggle Free Preview"
          >
            {lesson.isFreePreview ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Settings size={16} />
          </button>
          <button onClick={() => onMove('up')} disabled={isFirst} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronUp size={16}/></button>
          <button onClick={() => onMove('down')} disabled={isLast} className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronDown size={16}/></button>
          <button onClick={onRemove} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lesson Type</label>
                <select 
                  value={lesson.type}
                  onChange={(e) => onUpdate({ ...lesson, type: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-xs font-bold"
                >
                  <option value="video">Video Lecture</option>
                  <option value="pdf">Reading (PDF)</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> Duration (Mins)
                </label>
                <input 
                  type="number"
                  value={lesson.durationMinutes || ''}
                  onChange={(e) => onUpdate({ ...lesson, durationMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-xs font-bold"
                />
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {lesson.type === 'video' ? 'Video URL / Source' : lesson.type === 'pdf' ? 'File URL' : 'External Destination'}
                </label>
                <input 
                  value={lesson.type === 'video' ? lesson.videoSource || '' : lesson.type === 'pdf' ? lesson.fileUrl || '' : lesson.externalUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (lesson.type === 'video') onUpdate({ ...lesson, videoSource: val });
                    else if (lesson.type === 'pdf') onUpdate({ ...lesson, fileUrl: val });
                    else onUpdate({ ...lesson, externalUrl: val });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-xs font-mono"
                  placeholder="https://..."
                />
              </div>

              {(lesson.type === 'video' || lesson.type === 'pdf') && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Upload Directly</span>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
                  </div>
                  
                  <FileUploadButton 
                    onUpload={handleAssetUpload}
                    accept={lesson.type === 'video' ? 'video/*' : '.pdf'}
                    label={lesson.type === 'video' ? "Upload Video File" : "Upload PDF Document"}
                  />
                  
                  {lesson.type === 'video' && (
                    <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                      <AlertTriangle size={14} />
                      <span>Direct video uploads should be kept small (&lt; 100MB) for optimal player performance.</span>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
