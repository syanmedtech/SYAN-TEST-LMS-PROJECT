
import React, { useState, useEffect } from 'react';
import { VideoCourseFilters } from '../components/VideoCourseFilters';
import { VideoCoursesTable } from '../components/VideoCoursesTable';
import { VideoCourse, fetchVideoCourses, updateCourseStatus, duplicateVideoCourse } from '../services/videoCourseAdminService';

interface VideoCoursesProps {
  onNavigate: (view: any) => void;
}

export const VideoCourses: React.FC<VideoCoursesProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<VideoCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  const loadData = async () => {
    setLoading(true);
    const { items } = await fetchVideoCourses({
      pageSize: 50,
      searchQuery: filters.search,
      statusFilter: filters.status
    });
    setCourses(items);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search, filters.status]);

  const handleStatusToggle = async (id: string, current: string) => {
    const next = current === 'published' ? 'draft' : 'published';
    await updateCourseStatus(id, next as any);
    loadData();
  };

  const handleDuplicate = async (course: VideoCourse) => {
    await duplicateVideoCourse(course);
    loadData();
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Archive this course? It will be hidden from students and all public catalogs.")) {
      await updateCourseStatus(id, 'archived');
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Video Content</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage lectures, courses, and educational video modules.</p>
        </div>
      </div>

      <VideoCourseFilters 
        search={filters.search}
        onSearchChange={(search) => setFilters(f => ({ ...f, search }))}
        status={filters.status}
        onStatusChange={(status) => setFilters(f => ({ ...f, status }))}
        onCreate={() => onNavigate('ADMIN_VIDEO_COURSE_EDITOR_NEW')}
      />

      <VideoCoursesTable 
        courses={courses} 
        loading={loading}
        onEdit={(course) => onNavigate({ view: 'ADMIN_VIDEO_COURSE_EDITOR', id: course.id })}
        onDuplicate={handleDuplicate}
        onStatusToggle={handleStatusToggle}
        onArchive={handleArchive}
      />
    </div>
  );
};
