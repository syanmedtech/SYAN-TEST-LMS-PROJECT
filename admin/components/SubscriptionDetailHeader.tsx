
import React from 'react';
import { User, CreditCard, Calendar, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdminSubscription } from '../services/subscriptionAdminService';

interface HeaderProps {
  subscription: AdminSubscription;
  onBack: () => void;
  onStatusToggle: () => void;
  onExtend: () => void;
  isProcessing: boolean;
}

export const SubscriptionDetailHeader: React.FC<HeaderProps> = ({ 
  subscription, onBack, onStatusToggle, onExtend, isProcessing 
}) => {
  const isActive = subscription.status === 'active';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 p-6 mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
            <User size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{subscription.userName}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                {subscription.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm">{subscription.userEmail}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button 
            onClick={onExtend}
            disabled={isProcessing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:border-primary-500 transition-all shadow-sm"
          >
            <Clock size={18} className="text-primary-500" />
            Extend 30 Days
          </button>
          <button 
            onClick={onStatusToggle}
            disabled={isProcessing}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
              isActive ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
            }`}
          >
            {isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
            {isActive ? 'Cancel Subscription' : 'Mark as Active'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Provider</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{subscription.planName} via {subscription.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid From</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(subscription.startAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires On</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(subscription.endAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
