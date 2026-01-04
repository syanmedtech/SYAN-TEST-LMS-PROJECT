
import React from 'react';
import { Calendar, CreditCard, MoreVertical, CheckCircle, XCircle, Clock, User as UserIcon, Eye } from 'lucide-react';
import { AdminSubscription } from '../services/subscriptionAdminService';

interface SubscriptionsTableProps {
  subscriptions: AdminSubscription[];
  loading: boolean;
  onStatusToggle: (id: string, current: string) => void;
  onExtend: (id: string) => void;
  onView: (id: string) => void;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ 
  subscriptions, loading, onStatusToggle, onExtend, onView 
}) => {
  if (loading) return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading subscriber data...</div>;
  if (subscriptions.length === 0) return <div className="py-20 text-center text-slate-400 font-medium italic">No matching subscriptions found.</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan / Provider</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserIcon size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{sub.userName || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{sub.userEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.planName}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-black uppercase tracking-tight">
                    <CreditCard size={10} /> {sub.provider}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                    sub.status === 'expired' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${sub.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock size={12} />
                    <span>{new Date(sub.startAt).toLocaleDateString()} - {new Date(sub.endAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onView(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => onExtend(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Extend 30 Days"
                    >
                      <Clock size={18} />
                    </button>
                    <button 
                      onClick={() => onStatusToggle(sub.id, sub.status)}
                      className={`p-1.5 rounded-lg transition-all ${sub.status === 'active' ? 'text-red-400 hover:bg-red-50' : 'text-emerald-400 hover:bg-emerald-50'}`}
                      title={sub.status === 'active' ? "Cancel" : "Activate"}
                    >
                      {sub.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
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
