
import React, { useState, useEffect } from 'react';
import { PackageFilters } from '../components/PackageFilters';
import { PackagesTable } from '../components/PackagesTable';
import { Package, fetchPackages, updatePackageStatus, duplicatePackage } from '../services/packageAdminService';

interface PackagesPageProps {
  onNavigate: (view: any) => void;
}

export const Packages: React.FC<PackagesPageProps> = ({ onNavigate }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  const loadData = async () => {
    setLoading(true);
    const { items } = await fetchPackages({
      pageSize: 50,
      searchQuery: filters.search,
      statusFilter: filters.status
    });
    setPackages(items);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search, filters.status]);

  const handleStatusToggle = async (id: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    await updatePackageStatus(id, next as any);
    loadData();
  };

  const handleDuplicate = async (pkg: Package) => {
    await duplicatePackage(pkg);
    loadData();
  };

  const handleArchive = async (id: string) => {
    if (window.confirm("Archive this package? It will no longer be visible to students but retained for historical records.")) {
      await updatePackageStatus(id, 'archived');
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Commerce Packages</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure pricing plans and access bundles for students.</p>
        </div>
      </div>

      <PackageFilters 
        search={filters.search}
        onSearchChange={(search) => setFilters(f => ({ ...f, search }))}
        status={filters.status}
        onStatusChange={(status) => setFilters(f => ({ ...f, status }))}
        onCreate={() => onNavigate('ADMIN_PACKAGE_EDITOR_NEW')}
      />

      <PackagesTable 
        packages={packages} 
        loading={loading}
        onEdit={(pkg) => onNavigate({ view: 'ADMIN_PACKAGE_EDITOR', id: pkg.id })}
        onDuplicate={handleDuplicate}
        onStatusToggle={handleStatusToggle}
        onArchive={handleArchive}
      />
    </div>
  );
};
