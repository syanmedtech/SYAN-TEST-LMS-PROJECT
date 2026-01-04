
import React, { useState, useEffect } from 'react';
import { 
  fetchPlans, 
  fetchEntitlements, 
  savePlan, 
  deletePlan, 
  Plan, 
  Entitlements 
} from '../services/planAdminService';
import { PlanEditor } from '../components/PlanEditor';
import { EntitlementsEditor } from '../components/EntitlementsEditor';
import { ArrowLeft, Plus, Save, Trash2, ShieldCheck, List, Settings2, X } from 'lucide-react';

export const SubscriptionSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({});
  const [currentEntitlements, setCurrentEntitlements] = useState<Entitlements>({
    programs: [], courses: [], exams: [], fullQbankAccess: false, aiTutorAccess: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await fetchPlans();
    setPlans(data);
    setLoading(false);
  };

  const handleEdit = async (plan: Plan) => {
    setEditingId(plan.id);
    setCurrentPlan(plan);
    const ent = await fetchEntitlements(plan.id);
    if (ent) setCurrentEntitlements(ent);
  };

  const handleNew = () => {
    setEditingId('new');
    setCurrentPlan({ isActive: true, sortOrder: plans.length + 1, price: 0, durationDays: 30 });
    setCurrentEntitlements({
      programs: [], courses: [], exams: [], fullQbankAccess: false, aiTutorAccess: false
    });
  };

  const handleSave = async () => {
    if (!currentPlan.name || currentPlan.price === undefined) {
      alert("Name and price are required.");
      return;
    }
    setIsSaving(true);
    try {
      await savePlan(editingId === 'new' ? null : editingId, currentPlan, currentEntitlements);
      setEditingId(null);
      loadPlans();
    } catch (e) {
      alert("Failed to save plan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete or disable this plan? If active subscriptions exist, it will be disabled instead.")) {
      const result = await deletePlan(id);
      alert(result === 'DISABLED' ? "Plan disabled as it has active users." : "Plan deleted successfully.");
      loadPlans();
    }
  };

  if (loading && !editingId) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading billing configurations...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Plan Settings</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Configuration & Entitlements</p>
          </div>
        </div>
        {!editingId && (
          <button onClick={handleNew} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200">
            <Plus size={18} /> New Plan
          </button>
        )}
      </div>

      {!editingId ? (
        <div className="grid grid-cols-1 gap-4">
          {plans.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl text-slate-400">
              No subscription plans configured yet.
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-syan border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.isActive ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500">{plan.durationDays} Days • PKR {plan.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {plan.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button onClick={() => handleEdit(plan)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Settings2 size={20}/></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20}/></button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-xl font-black text-slate-800 dark:text-white">{editingId === 'new' ? 'Create Subscription Plan' : 'Update Plan & Entitlements'}</h2>
            <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={20}/></button>
          </div>
          
          <div className="p-8 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <List className="text-primary-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Plan Details</h3>
              </div>
              <PlanEditor plan={currentPlan} onChange={setCurrentPlan} />
            </section>

            <section className="pt-12 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Access Entitlements</h3>
              </div>
              <EntitlementsEditor entitlements={currentEntitlements} onChange={setCurrentEntitlements} />
            </section>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
             <button onClick={() => setEditingId(null)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">Cancel</button>
             <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
             >
                {isSaving ? 'Saving...' : <><Save size={18} /> Save Plan Configuration</>}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
