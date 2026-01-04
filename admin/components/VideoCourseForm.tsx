
import React from 'react';
import { VideoCourse } from '../services/videoCourseAdminService';
import { Layout, Globe, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { FileUploadButton } from './FileUploadButton';
import { uploadFile, getThumbnailPath } from '../services/storageUploadService';

interface VideoCourseFormProps {
  data: Partial<VideoCourse>;
  onChange: (updates: Partial<VideoCourse>) => void;
}

export const VideoCourseForm: React.FC<VideoCourseFormProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleThumbnailUpload = async (file: File, onProgress: (p: number) => void) => {
    const courseId = data.id || 'new-course';
    const path = getThumbnailPath(courseId, file.name);
    const result = await uploadFile(file, path, onProgress);
    onChange({ thumbnailUrl: result.downloadUrl });
    return result.downloadUrl;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Layout className="text-primary-600" size={20} /> Basic Information
        </h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
           {/* Thumbnail Preview & Upload */}
           <div className="w-full md:w-64 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Thumbnail</label>
              <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center relative group">
                {data.thumbnailUrl ? (
                  <>
                    <img src={data.thumbnailUrl} className="w-full h-full object-cover" alt="Course Thumbnail" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <LinkIcon size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold">16:9 Recommended</p>
                  </div>
                )}
              </div>
              <FileUploadButton 
                onUpload={handleThumbnailUpload}
                accept="image/*"
                label="Choose Image"
                className="w-full"
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Or Paste Image URL</label>
                <input 
                  name="thumbnailUrl"
                  value={data.thumbnailUrl || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-mono"
                  placeholder="https://..."
                />
              </div>
           </div>

           <div className="flex-1 w-full space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Title*</label>
                <input 
                  name="title"
                  required
                  value={data.title || ''}
                  onChange={handleChange}
                  placeholder="e.g. Advanced Clinical Pathology"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle / Short Tagline</label>
                <input 
                  name="subtitle"
                  value={data.subtitle || ''}
                  onChange={handleChange}
                  placeholder="e.g. High-yield review for FCPS candidates"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  name="description"
                  value={data.description || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
                />
              </div>
           </div>
        </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Globe className="text-emerald-600" size={20} /> Metadata & Taxonomy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program / Category</label>
            <select 
              name="programId"
              value={data.programId || ''}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            >
              <option value="">Select Program</option>
              <option value="MBBS">MBBS</option>
              <option value="FCPS">FCPS</option>
              <option value="NRE">NRE</option>
              <option value="USMLE">USMLE</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty Level</label>
            <select 
              name="level"
              value={data.level || 'Intermediate'}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
            <input 
              name="language"
              value={data.language || 'English / Urdu'}
              onChange={handleChange}
              placeholder="e.g. English"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white font-bold"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
