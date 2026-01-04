
import React from 'react';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PaymentRecord } from '../services/subscriptionAdminService';

interface TableProps {
  payments: PaymentRecord[];
  loading: boolean;
}

export const PaymentHistoryTable: React.FC<TableProps> = ({ payments, loading }) => {
  if (loading) return <div className="py-12 text-center text-slate-400 font-bold animate-pulse">Loading payment history...</div>;
  
  if (payments.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
        <CreditCard size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium italic">No recorded payments found for this subscription.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
            <th className="px-4 py-4">Transaction ID</th>
            <th className="px-4 py-4">Date</th>
            <th className="px-4 py-4">Amount</th>
            <th className="px-4 py-4">Method</th>
            <th className="px-4 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <td className="px-4 py-4 font-mono text-[11px] text-slate-500">{p.id}</td>
              <td className="px-4 py-4 text-xs font-bold text-slate-700 dark:text-slate-200">{new Date(p.timestamp).toLocaleString()}</td>
              <td className="px-4 py-4 font-black text-slate-900 dark:text-white">{p.amount} {p.currency || 'PKR'}</td>
              <td className="px-4 py-4 text-xs text-slate-500 uppercase font-black tracking-tight">{p.provider}</td>
              <td className="px-4 py-4 text-right">
                <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase ${
                  p.status === 'succeeded' || p.status === 'paid' ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  {p.status === 'succeeded' || p.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
