
import React from 'react';
import { Edit, Copy, Eye, EyeOff, Archive, MoreVertical, Package as PackageIcon, Clock, DollarSign } from 'lucide-react';
import { Package } from '../services/packageAdminService';

interface PackagesTableProps {
  packages: Package[];
  loading: boolean;
  onEdit: (pkg: Package) => void;
  onDuplicate: (pkg: Package) => void;
  onStatusToggle: (id: string, current: string) => void;
  onArchive: (id: string) => void;
}

export const PackagesTable: React.FC<PackagesTableProps> = ({ 
  packages, loading, onEdit, onDuplicate, onStatusToggle, onArchive 
}) => {
  if (loading && packages.length === 0) return (
    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mb-4"></div>
      <p className="font-bold">Syncing packages...</p>
    </div>
  );
  
  if (packages.length === 0) return (
    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
      <PackageIcon size={48} className="mx-auto text-slate-200 mb-4" />
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Packages Found</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">Create your first commercial package to start enrolling students.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Pricing</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Includes</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 flex-shrink-0">
                      <PackageIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{pkg.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Updated {new Date(pkg.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 font-black text-slate-900 dark:text-white">
                    <span className="text-xs opacity-50">{pkg.currency}</span>
                    <span>{pkg.price.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Clock size={14} className="text-slate-300" />
                    {pkg.durationDays} Days
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                     {/* Fix: Replaced pkg.includes with sum of entitlements counts */}
                     {(pkg.entitlements?.programs?.length || 0) + (pkg.entitlements?.videoCourses?.length || 0) + (pkg.entitlements?.exams?.length || 0)} Modules
                   </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    pkg.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${pkg.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {pkg.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => onEdit(pkg)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDuplicate(pkg)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Duplicate"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => onStatusToggle(pkg.id, pkg.status)}
                      className={`p-2 rounded-lg transition-all ${pkg.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={pkg.status === 'active' ? "Deactivate" : "Activate"}
                    >
                      {pkg.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      onClick={() => onArchive(pkg.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Archive"
                    >
                      <Archive size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
