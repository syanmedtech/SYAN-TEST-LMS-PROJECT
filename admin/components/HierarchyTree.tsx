
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Layers, ListTree, BrainCircuit, Hash } from 'lucide-react';
import { HierarchyNode, fetchTopics, fetchSubtopics, Taxonomy } from '../services/hierarchyService';

interface HierarchyTreeProps {
  subjects: HierarchyNode[];
  onSelect: (node: HierarchyNode) => void;
  selectedId?: string;
  searchQuery: string;
}

// We use the hierarchyService to get current active or selected taxonomy context
// Since we don't pass taxonomy down as a prop directly to keep existing signature,
// we'll assume the component re-mounts on taxonomy change via the key prop in parent.
// However, the service functions now NEED a taxonomy object.
// To satisfy the user's request for multi-taxonomy support while keeping the tree clean:
// We'll update the Tree to get the taxonomy from a parent or we assume subjects already belong to one.

export const HierarchyTree: React.FC<HierarchyTreeProps & { taxonomy?: Taxonomy }> = ({ subjects, onSelect, selectedId, searchQuery, taxonomy }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<Record<string, HierarchyNode[]>>({});
  const [subtopics, setSubtopics] = useState<Record<string, HierarchyNode[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const toggleExpand = async (node: HierarchyNode) => {
    // If we have no taxonomy context (legacy edge case), we can't fetch children reliably without it
    // But in the new page, we pass it.
    if (!taxonomy) return;

    const newExpanded = new Set(expanded);
    if (newExpanded.has(node.id)) {
      newExpanded.delete(node.id);
    } else {
      newExpanded.add(node.id);
      
      // Lazy load children
      if (node.type === 'subject' && !topics[node.id]) {
        setLoading(prev => new Set(prev).add(node.id));
        const children = await fetchTopics(taxonomy, node.id);
        setTopics(prev => ({ ...prev, [node.id]: children }));
        setLoading(prev => {
          const s = new Set(prev);
          s.delete(node.id);
          return s;
        });
      } else if (node.type === 'topic' && !subtopics[node.id]) {
        setLoading(prev => new Set(prev).add(node.id));
        const children = await fetchSubtopics(taxonomy, node.id);
        setSubtopics(prev => ({ ...prev, [node.id]: children }));
        setLoading(prev => {
          const s = new Set(prev);
          s.delete(node.id);
          return s;
        });
      }
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node: HierarchyNode, level: number) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const isLoading = loading.has(node.id);
    const children = node.type === 'subject' ? topics[node.id] : node.type === 'topic' ? subtopics[node.id] : [];
    
    const matchesSearch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={node.id} className="select-none">
        <div 
          onClick={() => { onSelect(node); if(node.type !== 'subtopic') toggleExpand(node); }}
          className={`group flex items-center py-2 px-3 rounded-xl cursor-pointer transition-all gap-2 mb-1 ${
            isSelected ? 'bg-primary-50 text-primary-700 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
          } ${matchesSearch ? 'ring-2 ring-primary-500 ring-opacity-20 bg-primary-50/50' : ''}`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {node.type !== 'subtopic' ? (
            <div className="w-5 h-5 flex items-center justify-center">
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              ) : isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          ) : (
            <div className="w-5" />
          )}

          {node.type === 'subject' ? <Layers size={16} className="text-primary-500" /> : 
           node.type === 'topic' ? <ListTree size={16} className="text-syan-orange" /> : 
           <BrainCircuit size={16} className="text-syan-teal" />}

          <span className="text-sm truncate flex-1">{node.name}</span>
          
          {node.questionCount !== undefined && node.questionCount > 0 && (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg opacity-60 group-hover:opacity-100">
              {node.questionCount}
            </span>
          )}
        </div>

        {isExpanded && children && children.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {subjects.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm italic border-2 border-dashed rounded-3xl">
          No hierarchy structure found for this version.
        </div>
      ) : (
        subjects.map(s => renderNode(s, 0))
      )}
    </div>
  );
};
