
import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2, Table, Save, Play, Download } from 'lucide-react';
import { parseCSV, ColumnMapping, mapRowToQuestion, saveMappingPreset, getMappingPreset } from '../services/qbankImportService';
import { bulkUpsertQuestions, QBankQuestion } from '../services/qbankAdminService';

interface QbankBulkImportModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export const QbankBulkImportModal: React.FC<QbankBulkImportModalProps> = ({ onClose, onImportComplete }) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'results'>('upload');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    stem: '', optionA: '', optionB: '', optionC: '', optionD: '', 
    correctOption: '', explanation: '', difficulty: '', 
    subject: '', topic: '', subtopic: '', tags: ''
  });
  const [upsertMode, setUpsertMode] = useState<'create' | 'upsert'>('create');
  const [progress, setProgress] = useState({ success: 0, failed: 0, total: 0 });
  const [failedRows, setFailedRows] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        alert("Invalid CSV format or empty file.");
        return;
      }
      setHeaders(rows[0]);
      setCsvData(rows.slice(1));
      
      // Auto-suggest mapping based on names
      const saved = getMappingPreset();
      const newMapping = { ...(saved || mapping) };
      
      // Try to find headers if saved is missing
      if (!saved) {
        rows[0].forEach(h => {
          const lower = h.toLowerCase();
          if (lower.includes('stem') || lower.includes('question')) newMapping.stem = h;
          if (lower.includes('option a') || lower === 'a') newMapping.optionA = h;
          if (lower.includes('option b') || lower === 'b') newMapping.optionB = h;
          if (lower.includes('option c') || lower === 'c') newMapping.optionC = h;
          if (lower.includes('option d') || lower === 'd') newMapping.optionD = h;
          if (lower.includes('correct') || lower.includes('answer')) newMapping.correctOption = h;
          if (lower.includes('explanation')) newMapping.explanation = h;
          if (lower.includes('difficulty')) newMapping.difficulty = h;
          if (lower.includes('subject')) newMapping.subject = h;
          if (lower.includes('topic')) newMapping.topic = h;
          if (lower.includes('subtopic')) newMapping.subtopic = h;
          if (lower.includes('tag')) newMapping.tags = h;
          if (lower.includes('id') || lower === 'uid') newMapping.uniqueId = h;
        });
      }

      setMapping(newMapping);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    saveMappingPreset(mapping);
    setStep('importing');
    setProgress({ success: 0, failed: 0, total: csvData.length });

    const questions: Partial<QBankQuestion>[] = csvData.map(row => {
      const rowObj: Record<string, string> = {};
      headers.forEach((h, i) => rowObj[h] = row[i]);
      return mapRowToQuestion(rowObj, mapping);
    });

    await bulkUpsertQuestions(questions, upsertMode, 25, (s, f) => {
      setProgress(prev => ({ ...prev, success: s, failed: f }));
    });

    setStep('results');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Table className="text-primary-600" size={28} /> Bulk CSV Import
            </h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Import medical MCQs in seconds</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {step === 'upload' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] p-20 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-all group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <Upload size={64} className="mx-auto text-slate-200 group-hover:text-primary-500 mb-6 transition-colors" />
              <h3 className="text-xl font-black text-slate-700 dark:text-slate-300">Drop your CSV here</h3>
              <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Or click to browse files</p>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs">Column Mapping</h3>
                <div className="flex items-center gap-2">
                   <label className="text-xs font-bold text-slate-500">Duplicate Handling:</label>
                   <select 
                    value={upsertMode} 
                    onChange={e => setUpsertMode(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 text-xs font-bold p-1.5 rounded-lg outline-none"
                   >
                     <option value="create">Ignore (Create New)</option>
                     <option value="upsert">Update Existing (Upsert)</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(mapping).map((field) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field}</label>
                    <select 
                      value={(mapping as any)[field]}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">-- Skip Column --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs">Preview (First 5 Rows)</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 dark:bg-slate-800">
                     <tr>
                       {headers.map(h => <th key={h} className="px-4 py-3 font-black">{h}</th>)}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {csvData.slice(0, 5).map((row, i) => (
                       <tr key={i}>
                         {row.map((cell, j) => <td key={j} className="px-4 py-2 text-slate-500 whitespace-nowrap overflow-hidden max-w-[200px] truncate">{cell}</td>)}
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 text-center space-y-8 animate-fade-in">
              <Loader2 size={64} className="mx-auto text-primary-500 animate-spin" />
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Importing Knowledge...</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Safe chunked writing in progress</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-between text-xs font-black text-slate-400">
                   <span>{progress.success + progress.failed} of {progress.total} PROCESSED</span>
                   <span>{Math.round(((progress.success + progress.failed) / progress.total) * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary-500 transition-all duration-300" 
                    style={{ width: `${((progress.success + progress.failed) / progress.total) * 100}%` }}
                   ></div>
                </div>
                <div className="flex justify-center gap-8 text-sm">
                   <div className="text-emerald-500 font-bold flex items-center gap-2">
                     <CheckCircle size={16} /> {progress.success} Successful
                   </div>
                   <div className="text-red-500 font-bold flex items-center gap-2">
                     <AlertCircle size={16} /> {progress.failed} Failed
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="py-12 text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white">Import Complete!</h3>
                <p className="text-slate-500 mt-2 font-medium">Successfully processed {progress.total} rows.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] max-w-sm mx-auto grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{progress.success}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added/Updated</div>
                </div>
                <div className="text-center border-l border-slate-200 dark:border-slate-700">
                  <div className="text-2xl font-black text-red-500">{progress.failed}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          {step === 'mapping' && (
            <>
              <button onClick={() => setStep('upload')} className="px-6 py-3 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Back</button>
              <button onClick={() => setStep('preview')} className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-primary-500 transition-all flex items-center gap-2 shadow-sm">
                <Save size={18} /> Preview Mapping
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => setStep('mapping')} className="px-6 py-3 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Adjust Mapping</button>
              <button onClick={handleStartConfirm} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2">
                <Play size={18} fill="currentColor" /> Start Import
              </button>
            </>
          )}
          {step === 'results' && (
            <button onClick={() => { onImportComplete(); onClose(); }} className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">Finish & Refresh</button>
          )}
        </div>
      </div>
    </div>
  );

  function handleStartConfirm() {
    if (window.confirm(`Are you sure? This will import ${csvData.length} records into the Question Bank.`)) {
        handleStartImport();
    }
  }
};
