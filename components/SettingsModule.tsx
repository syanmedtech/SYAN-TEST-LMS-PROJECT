
import React, { useState, useEffect } from 'react';
import { User, AppSettings } from '../types';
import { 
  UserCircle, Lock, Camera, Save, Eye, EyeOff, CheckCircle2, AlertCircle,
  Bell, HelpCircle, ChevronRight, Mail, Smartphone, MessageSquare, ChevronDown,
  Settings as SettingsIcon, AlertTriangle, Cpu, Gauge, RefreshCw
} from 'lucide-react';
import { dbGetAppSettings, dbSaveAppSettings } from '../services/db';

interface SettingsModuleProps {
  user: User;
}

type Tab = 'PROFILE' | 'PASSWORD' | 'NOTIFICATIONS' | 'SYSTEM' | 'SUPPORT';

export const SettingsModule: React.FC<SettingsModuleProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<Tab>('PROFILE');
  const isAdmin = user.role === 'admin';

  const menuItems = [
      { id: 'PROFILE', label: 'User Profile', icon: UserCircle },
      { id: 'PASSWORD', label: 'Change Password', icon: Lock },
      { id: 'NOTIFICATIONS', label: 'Notification Settings', icon: Bell },
      ...(isAdmin ? [{ id: 'SYSTEM', label: 'System Config', icon: SettingsIcon }] : []),
      { id: 'SUPPORT', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Update your profile information and manage security settings.</p>

        <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Navigation */}
            <div className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 p-2 space-y-1 sticky top-24">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === item.id ? 'bg-primary-50 dark:bg-slate-800 text-primary-700 dark:text-primary-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
                        >
                            <item.icon size={20} /> {item.label}
                            {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow">
                {activeTab === 'PROFILE' && <UserProfileEditor user={user} />}
                {activeTab === 'PASSWORD' && <PasswordChanger />}
                {activeTab === 'NOTIFICATIONS' && <NotificationSettings />}
                {activeTab === 'SYSTEM' && isAdmin && <SystemConfigEditor />}
                {activeTab === 'SUPPORT' && <HelpSupport />}
            </div>
        </div>
    </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const SystemConfigEditor: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        dbGetAppSettings().then(setSettings);
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await dbSaveAppSettings(settings);
            alert("System configuration saved successfully!");
        } catch (e) {
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-slide-in">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <SettingsIcon className="text-purple-600" size={24}/> Global System Configuration
             </h3>

             <div className="space-y-8">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400 h-fit"><AlertTriangle size={20}/></div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">Maintenance Mode</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Displays a banner to all users about scheduled maintenance.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {/* AI Generation Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400 h-fit"><Cpu size={20}/></div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">Allow AI Question Generation</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Enable or disable fallback to Gemini AI for custom quiz generation.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, allowAIQuestionGen: !settings.allowAIQuestionGen})}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.allowAIQuestionGen ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${settings.allowAIQuestionGen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {/* Default Difficulty */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Gauge size={14} /> Default System Difficulty
                    </label>
                    <div className="flex gap-3">
                        {['Easy', 'Medium', 'Hard'].map(diff => (
                            <button 
                                key={diff}
                                onClick={() => setSettings({...settings, defaultDifficulty: diff})}
                                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${settings.defaultDifficulty === diff ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Settings
                    </button>
                </div>
             </div>
        </div>
    );
};

const UserProfileEditor: React.FC<{ user: User }> = ({ user }) => {
    // Initialize state with user data
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        cnic: user.cnic || '',
        city: user.city || '',
        college: user.college || '',
        hospital: user.hospital || '',
        address: user.address || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        gender: user.gender || 'Male',
        specialty: user.specialty || '',
        graduationYear: user.graduationYear || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation for CNIC
        if (formData.cnic.replace(/[^0-9]/g, '').length !== 13) {
            alert("CNIC must be exactly 13 digits.");
            return;
        }
        alert("Profile updated successfully!");
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-slide-in">
            <div className="flex items-center gap-6 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-md overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-500">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                    <button className="text-primary-600 dark:text-primary-400 text-xs font-bold mt-2 hover:underline">Change Profile Picture</button>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                
                {/* SECTION 1: Personal Info */}
                <div>
                    <h4 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                        Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                         <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">CNIC Number</label>
                             <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} placeholder="42101-1234567-1" maxLength={15} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date of Birth</label>
                             <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gender</label>
                             <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all">
                                 <option value="Male">Male</option>
                                 <option value="Female">Female</option>
                                 <option value="Other">Other</option>
                             </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Contact Details */}
                <div>
                     <h4 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                        Contact Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                             <input type="email" name="email" value={formData.email} disabled className="w-full p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed" />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone Number</label>
                             <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0300-1234567" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">City</label>
                             <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Address</label>
                             <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Academic Info */}
                <div>
                     <h4 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                        Academic & Professional
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">College / University</label>
                             <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Hospital / Workplace</label>
                             <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                         <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Specialty / Track</label>
                             <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all">
                                 <option value="">Select Specialty</option>
                                 <option value="MBBS">MBBS</option>
                                 <option value="FCPS">FCPS</option>
                                 <option value="NRE">NRE</option>
                                 <option value="USMLE">USMLE</option>
                             </select>
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Graduation Year</label>
                             <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder="YYYY" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 p-4 -mx-4 md:-mx-8 md:px-8 border-t z-10">
                    <button type="button" className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

const PasswordChanger: React.FC = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const toggleShow = (field: keyof typeof show) => {
        setShow({ ...show, [field]: !show[field] });
    };

    const getStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score; // 0-4
    };

    const strength = getStrength(passwords.new);
    const isValid = passwords.new.length >= 8 && passwords.new === passwords.confirm && passwords.new !== passwords.current;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) alert("Password changed successfully!");
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-slide-in">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Lock className="text-primary-600" size={24}/> Change Password
             </h3>
             
             <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="space-y-1.5 relative">
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Password</label>
                     <div className="relative">
                        <input 
                            type={show.current ? "text" : "password"} 
                            name="current" 
                            value={passwords.current} 
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all pr-10 text-slate-800 dark:text-white" 
                        />
                        <button type="button" onClick={() => toggleShow('current')} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                            {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                </div>

                <div className="space-y-1.5 relative">
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New Password</label>
                     <div className="relative">
                        <input 
                            type={show.new ? "text" : "password"} 
                            name="new" 
                            value={passwords.new} 
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all pr-10 text-slate-800 dark:text-white" 
                        />
                        <button type="button" onClick={() => toggleShow('new')} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                            {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                     {/* Strength Meter */}
                     {passwords.new && (
                         <div className="mt-2 flex gap-1 h-1">
                             <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                             <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                             <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                             <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                         </div>
                     )}
                     {passwords.new && (
                         <p className="text-xs text-right text-slate-400 mt-1">
                             {strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'}
                         </p>
                     )}
                </div>

                <div className="space-y-1.5 relative">
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Confirm New Password</label>
                     <div className="relative">
                        <input 
                            type={show.confirm ? "text" : "password"} 
                            name="confirm" 
                            value={passwords.confirm} 
                            onChange={handleChange}
                            className={`w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:outline-none transition-all pr-10 text-slate-800 dark:text-white ${
                                passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'
                            }`} 
                        />
                        <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                            {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                     {passwords.confirm && passwords.new !== passwords.confirm && (
                         <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/> Passwords do not match</p>
                     )}
                </div>

                <div className="pt-6 flex justify-end gap-3">
                    <button type="button" className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button 
                        type="submit" 
                        disabled={!isValid}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Update Password
                    </button>
                </div>
             </form>
        </div>
    );
};

const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        emailDigest: true,
        examReminders: true,
        newCourses: true,
        promoOffers: false,
        smsAlerts: false
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-slide-in">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Bell className="text-primary-600" size={24}/> Notification Preferences
             </h3>

             <div className="space-y-6">
                 {/* Item */}
                 <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                     <div className="flex gap-4">
                         <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 h-fit"><Mail size={20}/></div>
                         <div>
                             <h4 className="font-bold text-slate-800 dark:text-white">Weekly Email Digest</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400">Summary of your quiz performance and progress.</p>
                         </div>
                     </div>
                     <button onClick={() => toggle('emailDigest')} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.emailDigest ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                         <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${settings.emailDigest ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                 </div>

                 <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                     <div className="flex gap-4">
                         <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400 h-fit"><Bell size={20}/></div>
                         <div>
                             <h4 className="font-bold text-slate-800 dark:text-white">Exam Reminders</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400">Alerts 1 hour before scheduled mock exams.</p>
                         </div>
                     </div>
                     <button onClick={() => toggle('examReminders')} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.examReminders ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                         <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${settings.examReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                 </div>

                 <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                     <div className="flex gap-4">
                         <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400 h-fit"><Smartphone size={20}/></div>
                         <div>
                             <h4 className="font-bold text-slate-800 dark:text-white">SMS Alerts</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400">Receive critical account updates via SMS.</p>
                         </div>
                     </div>
                     <button onClick={() => toggle('smsAlerts')} className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.smsAlerts ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                         <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${settings.smsAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                 </div>
                 
                 <div className="flex justify-end pt-4">
                     <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl font-bold text-sm">Save Preferences</button>
                 </div>
             </div>
        </div>
    );
}

const HelpSupport: React.FC = () => {
    const [openItem, setOpenItem] = useState<number | null>(0);

    const faqs = [
        { q: "How do I reset my password?", a: "Go to Settings > Change Password. If you are logged out, click 'Forgot Password' on the login screen." },
        { q: "Can I download quizzes for offline use?", a: "Offline access is available for Elite Plan subscribers. Check the Subscriptions tab to upgrade." },
        { q: "My payment failed, what should I do?", a: "Please check your bank card permissions for online transactions. If the issue persists, contact support." },
    ];

    return (
        <div className="space-y-6 animate-slide-in">
             <div className="bg-gradient-to-r from-primary-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
                 <h3 className="text-2xl font-bold mb-2">How can we help you?</h3>
                 <p className="opacity-90 mb-6">Our support team is available 24/7 to assist you with any issues.</p>
                 <button className="bg-white text-primary-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
                     <MessageSquare size={18}/> Contact Support
                 </button>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Frequently Asked Questions</h3>
                 <div className="space-y-4">
                     {faqs.map((faq, i) => (
                         <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                             <button 
                                onClick={() => setOpenItem(openItem === i ? null : i)}
                                className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                             >
                                 <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{faq.q}</span>
                                 <ChevronDown size={16} className={`transition-transform ${openItem === i ? 'rotate-180' : ''}`} />
                             </button>
                             {openItem === i && (
                                 <div className="p-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                     {faq.a}
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    );
}
