
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { Layout, ListTree, BrainCircuit, Type } from 'lucide-react';

interface HierarchyPickerProps {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  subjectName?: string;
  topicName?: string;
  subtopicName?: string;
  onChange: (updates: any) => void;
}

interface TaxonomyItem {
  id: string;
  name: string;
}

export const HierarchyPicker: React.FC<HierarchyPickerProps> = ({
  subjectId, topicId, subtopicId, subjectName, topicName, subtopicName, onChange
}) => {
  const [subjects, setSubjects] = useState<TaxonomyItem[]>([]);
  const [topics, setTopics] = useState<TaxonomyItem[]>([]);
  const [subtopics, setSubtopics] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const snap = await getDocs(query(collection(db, "subjects"), orderBy("name")));
        setSubjects(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
      } catch (e) {
        console.warn("Hierarchy collections not found, using free-text mode.");
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      getDocs(query(collection(db, "topics"), where("subjectId", "==", subjectId), orderBy("name")))
        .then(snap => setTopics(snap.docs.map(d => ({ id: d.id, name: d.data().name }))))
        .catch(() => setTopics([]));
    } else {
      setTopics([]);
    }
  }, [subjectId]);

  useEffect(() => {
    if (topicId) {
      getDocs(query(collection(db, "subtopics"), where("topicId", "==", topicId), orderBy("name")))
        .then(snap => setSubtopics(snap.docs.map(d => ({ id: d.id, name: d.data().name }))))
        .catch(() => setSubtopics([]));
    } else {
      setSubtopics([]);
    }
  }, [topicId]);

  const handleSelect = (level: 'subject' | 'topic' | 'subtopic', id: string, items: TaxonomyItem[]) => {
    const item = items.find(i => i.id === id);
    const updates: any = {};
    if (level === 'subject') {
      updates.subjectId = id;
      updates.subjectName = item?.name || '';
      updates.topicId = '';
      updates.topicName = '';
      updates.subtopicId = '';
      updates.subtopicName = '';
    } else if (level === 'topic') {
      updates.topicId = id;
      updates.topicName = item?.name || '';
      updates.subtopicId = '';
      updates.subtopicName = '';
    } else {
      updates.subtopicId = id;
      updates.subtopicName = item?.name || '';
    }
    onChange(updates);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subject */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
            <Layout size={10} className="text-primary-500" /> Subject
          </label>
          {subjects.length > 0 ? (
            <select 
              value={subjectId || ''}
              onChange={(e) => handleSelect('subject', e.target.value, subjects)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          ) : (
            <input 
              value={subjectName || ''}
              onChange={(e) => onChange({ subjectName: e.target.value })}
              placeholder="e.g. Anatomy"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold"
            />
          )}
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
            <ListTree size={10} className="text-syan-orange" /> Topic
          </label>
          {topics.length > 0 ? (
            <select 
              disabled={!subjectId}
              value={topicId || ''}
              onChange={(e) => handleSelect('topic', e.target.value, topics)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              <option value="">Select Topic</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <input 
              value={topicName || ''}
              onChange={(e) => onChange({ topicName: e.target.value })}
              placeholder="e.g. Upper Limb"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold"
            />
          )}
        </div>

        {/* Subtopic */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
            <BrainCircuit size={10} className="text-syan-teal" /> Subtopic
          </label>
          {subtopics.length > 0 ? (
            <select 
              disabled={!topicId}
              value={subtopicId || ''}
              onChange={(e) => handleSelect('subtopic', e.target.value, subtopics)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50"
            >
              <option value="">Select Subtopic</option>
              {subtopics.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>
          ) : (
            <input 
              value={subtopicName || ''}
              onChange={(e) => onChange({ subtopicName: e.target.value })}
              placeholder="e.g. Brachial Plexus"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-sm font-bold"
            />
          )}
        </div>
      </div>
    </div>
  );
};
