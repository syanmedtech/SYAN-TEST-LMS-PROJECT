
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Globe, Lock, Info, Sparkles, CheckCircle, Package as PackageIcon } from 'lucide-react';
import { Package, fetchPackageById, savePackage } from '../services/packageAdminService';
import { PackageForm } from '../components/PackageForm';
import { EntitlementsPicker } from '../components/EntitlementsPicker';

interface PackageEditorProps {
  id: string | null;
  onBack: () => void;
}

export const PackageEditor: React.FC<PackageEditorProps> = ({ id, onBack }) => {
  const [loading, setLoading] = useState(id !== null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'ENTITLEMENTS'>('DETAILS');
  const [formData, setFormData] = useState<Partial<Package>>({
    name: '',
    description: '',
    price: 0,
    currency: 'PKR',
    status: 'inactive',
    sortOrder: 0,
    entitlements: {
      programs: [],
      videoCourses: [],
      exams: [],
      qbank: { enabled: false }
    }
  });

  useEffect(() => {
    if (id) {
      fetchPackageById(id).then(data => {
        if (data) setFormData(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined) {
      alert("Please fill in required fields (Name, Price).");
      return;
    }
    setSaving(true);
    try {
      await savePackage(id, formData);
      alert("Package configuration saved successfully!");
      onBack();
    } catch (e) {
      alert("Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Syncing package data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <PackageIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {id ? 'Update Package' : 'New Bundle Config'}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formData.name || 'Designing New Offer'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Syncing...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-syan border border-slate-100 dark:border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab('DETAILS')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'DETAILS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Basic Details
        </button>
        <button 
          onClick={() => setActiveTab('ENTITLEMENTS')}
          className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'ENTITLEMENTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Access Mapping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Main */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-syan border border-slate-100 dark:border-slate-800">
           {activeTab === 'DETAILS' ? (
             <PackageForm 
                data={formData} 
                onChange={(updates) => setFormData({ ...formData, ...updates })} 
             />
           ) : (
             <EntitlementsPicker 
                value={formData.entitlements!} 
                onChange={(entitlements) => setFormData({ ...formData, entitlements })} 
             />
           )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-400" size={20} /> Live Preview
              </h3>
              
              <div className="space-y-6">
                <div>
                   <h4 className="text-3xl font-black">{formData.currency} {formData.price?.toLocaleString()}</h4>
                   <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Bundle Price</p>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Programs</span>
                      <span className="font-bold">{formData.entitlements?.programs.length} selected</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Courses</span>
                      <span className="font-bold">{formData.entitlements?.videoCourses.length} selected</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Exams</span>
                      <span className="font-bold">{formData.entitlements?.exams.length} selected</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">QBank Access</span>
                      <span className={`font-bold ${formData.entitlements?.qbank.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                         {formData.entitlements?.qbank.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-syan">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Configuration Health</h3>
              <div className="space-y-3">
                 <CheckItem label="Package Name" checked={!!formData.name} />
                 <CheckItem label="Pricing Defined" checked={(formData.price || 0) >= 0} />
                 <CheckItem label="Validity Configured" checked={!!(formData.durationDays || (formData.startAt && formData.endAt))} />
                 <CheckItem label="Entitlements Mapped" checked={!!(formData.entitlements && (formData.entitlements.programs.length > 0 || formData.entitlements.videoCourses.length > 0 || formData.entitlements.exams.length > 0 || formData.entitlements.qbank.enabled))} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem = ({ label, checked }: { label: string, checked: boolean }) => (
  <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${checked ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-400 bg-slate-50/50'}`}>
    <span>{label}</span>
    {checked ? <CheckCircle size={14} /> : <div className="w-3 h-3 rounded-full border-2 border-slate-200"></div>}
  </div>
);
