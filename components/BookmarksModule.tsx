
import React, { useEffect, useState } from 'react';
import { BookmarkItem } from '../types';
import { getBookmarks } from '../services/mockService';
import { Bookmark, PlayCircle, HelpCircle, ArrowRight, Trash2 } from 'lucide-react';

interface BookmarksModuleProps {
    onNavigate: (view: any) => void;
}

export const BookmarksModule: React.FC<BookmarksModuleProps> = ({ onNavigate }) => {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'QUESTION' | 'VIDEO'>('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBookmarks().then(data => {
            setBookmarks(data);
            setLoading(false);
        });
    }, []);

    const filteredBookmarks = bookmarks.filter(b => filter === 'ALL' || b.type === filter);

    const handleNavigate = (item: BookmarkItem) => {
        if (item.type === 'VIDEO') {
            onNavigate({ view: 'VIDEO_PLAYER', courseId: item.contextId || 'c1', videoId: item.referenceId });
        } else {
            // For questions, ideally navigate to a review mode or specific question view.
            // For now, we'll alert as the question review flow needs specific session context.
            alert("Navigate to Question Review: " + item.referenceId);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading saved items...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20 h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Bookmark className="text-syan-teal" size={32} /> Favorites & Bookmarks
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Access your saved questions and video lectures quickly.</p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex shadow-sm">
                    {['ALL', 'QUESTION', 'VIDEO'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                filter === f 
                                ? 'bg-slate-900 text-white shadow' 
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {f === 'ALL' ? 'All Items' : f === 'QUESTION' ? 'Questions' : 'Videos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 animate-slide-up">
                {filteredBookmarks.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Bookmark size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No bookmarks found.</p>
                    </div>
                ) : (
                    filteredBookmarks.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => handleNavigate(item)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700 flex items-start gap-4 cursor-pointer hover:shadow-syan-hover hover:border-syan-teal transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                item.type === 'VIDEO' ? 'bg-syan-orange/10 text-syan-orange' : 'bg-syan-teal/10 text-syan-teal'
                            }`}>
                                {item.type === 'VIDEO' ? <PlayCircle size={24} /> : <HelpCircle size={24} />}
                            </div>
                            
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">
                                        {item.subtitle}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(item.dateAdded).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-syan-teal transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                        item.type === 'VIDEO' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {item.type === 'VIDEO' ? 'Video Lecture' : 'QBank Question'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-300 hover:text-syan-teal transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-colors"
                                    title="Remove Bookmark"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
