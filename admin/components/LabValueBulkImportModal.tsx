import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2, Table, Play, Info } from 'lucide-react';
import { bulkUpsertLabValues, LabValue } from '../services/labValuesService';

interface Props {
  onClose: () => void;
  onImportComplete: () => void;
}

export const LabValueBulkImportModal: React.FC<Props> = ({ onClose, onImportComplete }) => {
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<'input' | 'importing' | 'results'>('input');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const handleImport = async () => {
    const lines = csvText.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 1) return alert("No data found.");
    
    // Simple CSV Parse (Expect: category,testName,normalRange,unit,region,sex)
    const items: Partial<LabValue>[] = lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      return {
        category: parts[0] || 'Others',
        testName: parts[1] || 'Unknown',
        normalRange: parts[2] || '',
        unit: parts[3] || '',
        region: parts[4] || 'Pakistan',
        sex: (parts[5]?.toLowerCase() as any) || 'all',
        ageGroup: 'adult',
        sortOrder: idx,
      };
    });

    setTotal(items.length);
    setStep('importing');
    
    try {
      await bulkUpsertLabValues(items, (count) => setProgress(count));
      setStep('results');
    } catch (e) {
      alert("Import failed.");
      setStep('input');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <Table className="text-primary-600" /> Bulk Import Lab Values
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={24}/></button>
        </div>

        <div className="p-8">
          {step === 'input' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3 text-xs text-blue-700 dark:text-blue-300">
                <Info size={20} className="flex-shrink-0" />
                <p>Paste CSV data. Format: <strong>category, testName, normalRange, unit, region, sex</strong>. Example: CBC, Hemoglobin, 13.5-17.5, g/dL, Pakistan, male</p>
              </div>
              <textarea 
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="CBC,Hemoglobin,13.5-17.5,g/dL,Pakistan,male..."
                className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
              <button onClick={handleImport} className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-lg hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                <Play size={20} fill="currentColor" /> Process {csvText.split('\n').filter(l=>l.trim()).length} Rows
              </button>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-20 text-center space-y-6">
              <Loader2 size={64} className="mx-auto text-primary-500 animate-spin" />
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Processing Knowledge...</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">{progress} / {total} Completed</p>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-sm mx-auto">
                <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${(progress/total)*100}%` }} />
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="py-20 text-center space-y-6">
              <CheckCircle size={64} className="mx-auto text-emerald-500" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Import Successful</h3>
              <p className="text-slate-500">{total} lab entries added to the repository.</p>
              <button onClick={() => { onImportComplete(); onClose(); }} className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl">Finish</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};