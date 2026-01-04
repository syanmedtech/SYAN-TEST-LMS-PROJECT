
import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, TrendingUp, AlertCircle, Settings2 } from 'lucide-react';
import { SubscriptionFilters } from '../components/SubscriptionFilters';
import { SubscriptionsTable } from '../components/SubscriptionsTable';
import { AdminSubscription, fetchAdminSubscriptions, updateSubscriptionStatus, extendSubscription } from '../services/subscriptionAdminService';
import { KpiCard } from '../components/KpiCard';

interface SubscriptionsPageProps {
  onNavigate: (view: any) => void;
}

export const Subscriptions: React.FC<SubscriptionsPageProps> = ({ onNavigate }) => {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'all', plan: 'all' });

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdminSubscriptions(filters);
    setSubs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filters.status, filters.plan]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleStatusToggle = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'canceled' : 'active';
    try {
      await updateSubscriptionStatus(id, newStatus);
      loadData();
    } catch (e) {
      alert("Permission denied or database error.");
    }
  };

  const handleExtend = async (id: string) => {
    if (window.confirm("Extend this subscription by 30 days?")) {
      await extendSubscription(id, 30);
      loadData();
    }
  };

  const handleView = (id: string) => {
    onNavigate({ view: 'ADMIN_SUBSCRIPTION_DETAIL', id });
  };

  const activeCount = subs.filter(s => s.status === 'active').length;
  const expiredCount = subs.filter(s => s.status === 'expired').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage user licenses, billing periods and enrollments.</p>
        </div>
        <button 
          onClick={() => onNavigate('ADMIN_SUBSCRIPTION_SETTINGS')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:border-primary-500 transition-all shadow-sm"
        >
          <Settings2 size={18} className="text-primary-500" /> Plan Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Active Subs" value={activeCount} icon={ShoppingBag} color="bg-emerald-500" trend="+8%" />
        <KpiCard title="Renewal Rate" value="92%" icon={TrendingUp} color="bg-primary-500" trend="Stable" />
        <KpiCard title="Expired" value={expiredCount} icon={AlertCircle} color="bg-amber-500" trend="-12%" />
      </div>

      <SubscriptionFilters 
        onSearchChange={(search) => setFilters(f => ({ ...f, search }))}
        onStatusChange={(status) => setFilters(f => ({ ...f, status }))}
        onPlanChange={(plan) => setFilters(f => ({ ...f, plan }))}
      />

      <SubscriptionsTable 
        subscriptions={subs} 
        loading={loading}
        onStatusToggle={handleStatusToggle}
        onExtend={handleExtend}
        onView={handleView}
      />
    </div>
  );
};
