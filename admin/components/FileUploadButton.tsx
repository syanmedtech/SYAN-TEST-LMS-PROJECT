
import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FileUploadButtonProps {
  onUpload: (file: File, onProgress: (p: number) => void) => Promise<string>;
  accept?: string;
  label?: string;
  className?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ 
  onUpload, 
  accept, 
  label = "Upload File",
  className = ""
}) => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setProgress(0);

    try {
      await onUpload(file, (p) => setProgress(p));
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`relative ${className}`}>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'uploading'}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${
          status === 'uploading' ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' :
          status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
          status === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
          'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-500'
        }`}
      >
        {status === 'uploading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{progress}% Uploading...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle size={16} />
            <span>Upload Complete</span>
          </>
        ) : status === 'error' ? (
          <>
            <XCircle size={16} />
            <span>Upload Failed</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>{label}</span>
          </>
        )}
      </button>
      
      {status === 'uploading' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
