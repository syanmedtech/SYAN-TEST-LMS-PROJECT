
import React, { useState, useEffect } from 'react';
import { 
  fetchSubscriptionById, 
  fetchSubscriptionPayments, 
  updateSubscriptionStatus, 
  extendSubscription, 
  logAdminAction,
  AdminSubscription, 
  PaymentRecord 
} from '../services/subscriptionAdminService';
import { SubscriptionDetailHeader } from '../components/SubscriptionDetailHeader';
import { PaymentHistoryTable } from '../components/PaymentHistoryTable';
// Added CheckCircle to imports
import { Info, History, ShieldCheck, ListTree, CheckCircle } from 'lucide-react';

interface DetailProps {
  id: string;
  onBack: () => void;
  currentUserUid: string;
}

export const SubscriptionDetail: React.FC<DetailProps> = ({ id, onBack, currentUserUid }) => {
  const [subscription, setSubscription] = useState<AdminSubscription | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PAYMENTS' | 'AUDIT'>('OVERVIEW');

  const loadData = async () => {
    setLoading(true);
    const [sub, pay] = await Promise.all([
      fetchSubscriptionById(id),
      fetchSubscriptionPayments(id)
    ]);
    setSubscription(sub);
    setPayments(pay);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusToggle = async () => {
    if (!subscription) return;
    const newStatus = subscription.status === 'active' ? 'canceled' : 'active';
    const confirmMsg = subscription.status === 'active' 
      ? "Are you sure you want to cancel this subscription? The user will lose access."
      : "Mark this subscription as active?";
    
    if (!window.confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      await updateSubscriptionStatus(id, newStatus);
      await logAdminAction(currentUserUid, `updated_status`, id, { from: subscription.status, to: newStatus });
      await loadData();
    } catch (e) {
      alert("Error updating status.");
    } finally {
      setProcessing(false);
    }
  };

  const handleExtend = async () => {
    if (!window.confirm("Extend subscription by 30 days?")) return;
    
    setProcessing(true);
    try {
      await extendSubscription(id, 30);
      await logAdminAction(currentUserUid, `extended_expiry`, id, { days: 30 });
      await loadData();
    } catch (e) {
      alert("Error extending expiry.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Fetching details...</div>;
  if (!subscription) return <div className="p-20 text-center text-slate-400">Subscription not found.</div>;

  return (
    <div className="animate-fade-in pb-20">
      <SubscriptionDetailHeader 
        subscription={subscription} 
        onBack={onBack} 
        onStatusToggle={handleStatusToggle}
        onExtend={handleExtend}
        isProcessing={processing}
      />

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: Info },
            { id: 'PAYMENTS', label: 'Payment History', icon: History },
            { id: 'AUDIT', label: 'Audit Trail', icon: ShieldCheck }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-slate-50 dark:bg-slate-800 text-primary-600' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-12">
              <section>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">Technical Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DetailItem label="Internal ID" value={subscription.id} mono />
                  <DetailItem label="User UID" value={subscription.userId} mono />
                  <DetailItem label="Plan Identifier" value={subscription.planId} mono />
                  <DetailItem label="Created At" value={new Date(subscription.createdAt).toLocaleString()} />
                  <DetailItem label="Last Updated" value={new Date(subscription.updatedAt).toLocaleString()} />
                  <DetailItem label="Payment Provider" value={subscription.provider} />
                </div>
              </section>

              <section className="pt-8 border-t border-slate-50 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6">Entitlements</h3>
                <div className="bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl p-6 border border-primary-100 dark:border-primary-900/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-primary-600 shadow-sm">
                      <ListTree size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Active Program Access</h4>
                      <p className="text-sm text-slate-500 mt-1">This user is currently enrolled in all modules associated with the <strong>{subscription.planName}</strong> plan.</p>
                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <CheckCircle size={14} className="text-emerald-500" /> Complete MBBS QBank
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <CheckCircle size={14} className="text-emerald-500" /> AI Medical Tutor
                        </li>
                        <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <CheckCircle size={14} className="text-emerald-500" /> All Video Courses
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <PaymentHistoryTable payments={payments} loading={false} />
          )}

          {activeTab === 'AUDIT' && (
            <div className="py-12 text-center text-slate-400 italic">
              <ShieldCheck size={48} className="mx-auto opacity-10 mb-4" />
              Detailed administrative audit logs are stored in a separate logging collection and will be visualized here in a future update.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, mono }: { label: string, value: string, mono?: boolean }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${mono ? 'font-mono opacity-80' : ''}`}>{value}</p>
  </div>
);
