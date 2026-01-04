
import React, { useState } from 'react';
import { collection, getDocs, query, limit, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { resolveHierarchyLinks } from '../../shared/services/hierarchyResolver';
import { AlertCircle, CheckCircle, RefreshCw, Play, ShieldAlert, Loader2 } from 'lucide-react';

export const ResolveLinksPanel: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'ready' | 'processing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ id: string; updates: any }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanQuestions = async () => {
    setStatus('scanning');
    setProgress(0);
    setError(null);
    try {
      // Limit scan to 200 for safety and performance
      const q = query(collection(db, "questions"), limit(200));
      const snap = await getDocs(q);
      
      const toUpdate: { id: string; updates: any }[] = [];
      
      for (let i = 0; i < snap.docs.length; i++) {
        const d = snap.docs[i];
        const data = d.data();
        
        // Identify missing links
        const needsSubject = !data.subjectId && data.subjectName;
        const needsTopic = !data.topicId && data.topicName;
        const needsSubtopic = !data.subtopicId && data.subtopicName;

        if (needsSubject || needsTopic || needsSubtopic) {
          const resolved = await resolveHierarchyLinks(data);
          
          // Only collect if something actually changed/resolved
          const updates: any = {};
          if (resolved.subjectId && resolved.subjectId !== data.subjectId) updates.subjectId = resolved.subjectId;
          if (resolved.topicId && resolved.topicId !== data.topicId) updates.topicId = resolved.topicId;
          if (resolved.subtopicId && resolved.subtopicId !== data.subtopicId) updates.subtopicId = resolved.subtopicId;

          if (Object.keys(updates).length > 0) {
            toUpdate.push({ id: d.id, updates });
          }
        }
        setProgress(Math.round(((i + 1) / snap.docs.length) * 100));
      }

      setResults(toUpdate);
      setStatus('ready');
    } catch (e: any) {
      setError(e.message);
      setStatus('idle');
    }
  };

  const applyUpdates = async () => {
    if (results.length === 0) return;
    setStatus('processing');
    setProgress(0);

    const CHUNK_SIZE = 25;
    try {
      for (let i = 0; i < results.length; i += CHUNK_SIZE) {
        const chunk = results.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        
        chunk.forEach(item => {
          const ref = doc(db, "questions", item.id);
          batch.update(ref, { ...item.updates, updatedAt: Date.now() });
        });

        await batch.commit();
        setProgress(Math.round(((i + chunk.length) / results.length) * 100));
      }
      setStatus('done');
    } catch (e: any) {
      setError(e.message);
      setStatus('ready');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-syan overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={20} /> Integrity Assistant
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-Reference names with IDs</p>
        </div>
        
        {status === 'idle' || status === 'done' ? (
          <button 
            onClick={scanQuestions}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-50 hover:text-primary-600 transition-all"
          >
            <RefreshCw size={14} /> {status === 'done' ? 'Re-scan' : 'Scan Catalog'}
          </button>
        ) : null}
      </div>

      {status === 'scanning' && (
        <div className="py-8 text-center space-y-4">
          <Loader2 className="mx-auto text-primary-500 animate-spin" size={32} />
          <p className="text-sm font-bold text-slate-600">Analyzing Questions... {progress}%</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex gap-3 items-center">
            <AlertCircle className="text-amber-600" size={20} />
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Found {results.length} questions missing hierarchy IDs that can be resolved automatically.
            </p>
          </div>
          <button 
            onClick={applyUpdates}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
          >
            <Play size={14} fill="currentColor" /> Apply {results.length} Links
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className="py-8 text-center space-y-4">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm font-bold text-slate-600">Committing Batches... {progress}%</p>
        </div>
      )}

      {status === 'done' && (
        <div className="py-8 text-center space-y-2 animate-fade-in">
          <CheckCircle className="mx-auto text-emerald-500 mb-2" size={40} />
          <h4 className="font-black text-slate-800 dark:text-white">Cleanup Complete</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Repository integrity successfully restored.</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
          Error: {error}
        </div>
      )}
    </div>
  );
};
