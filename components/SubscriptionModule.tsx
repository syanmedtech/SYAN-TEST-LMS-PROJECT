

import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { Check, X, CreditCard, Calendar, AlertTriangle, ShieldCheck, Zap, ChevronRight, AlertOctagon, Lock, Loader2 } from 'lucide-react';

interface SubscriptionModuleProps {
  user: User;
}

// Mock Plans
const PLANS = [
    {
        id: 'free',
        name: 'Basic',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ['50 Practice Questions', '1 Mock Exam', 'Basic Statistics', 'Ad-supported'],
        isPopular: false
    },
    {
        id: 'pro',
        name: 'Syan Pro',
        monthlyPrice: 2500,
        yearlyPrice: 25000,
        features: ['2000+ Questions', '10 Mock Exams', 'Advanced Analytics', 'Detailed Explanations', 'No Ads'],
        isPopular: true
    },
    {
        id: 'elite',
        name: 'Syan Elite Pack',
        monthlyPrice: 4000,
        yearlyPrice: 40000,
        features: ['Unlimited Questions', 'Unlimited Mock Exams', 'AI Tutor Access', 'Video Lectures', 'Downloadable Notes', 'Offline Access'],
        isPopular: false
    }
];

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'tx_1', date: Date.now() - 1000 * 60 * 60 * 24 * 30, planName: 'Pro Monthly', amount: 2500, status: 'paid' },
    { id: 'tx_2', date: Date.now() - 1000 * 60 * 60 * 24 * 60, planName: 'Pro Monthly', amount: 2500, status: 'paid' },
    { id: 'tx_3', date: Date.now() - 1000 * 60 * 60 * 24 * 90, planName: 'Basic', amount: 0, status: 'paid' },
];

export const SubscriptionModule: React.FC<SubscriptionModuleProps> = ({ user }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(user.subscription.billingCycle);
    const [autoRenew, setAutoRenew] = useState(user.subscription.autoRenew);
    const [currentPlanId, setCurrentPlanId] = useState('elite'); // Defaulting to elite for demo based on mock user
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    
    // Transaction History State
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

    // Upgrade Flow State
    const [upgradeModalData, setUpgradeModalData] = useState<{plan: typeof PLANS[0], cycle: 'monthly'|'yearly'} | null>(null);
    const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
    
    // Payment Method State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        last4: '4242',
        expiry: '12/26',
        brand: 'Visa'
    });

    const isTrial = user.subscription.status === 'trial';
    const isExpired = user.subscription.status === 'expired';

    const handlePlanChange = (planId: string) => {
        if (planId === currentPlanId) return;
        const plan = PLANS.find(p => p.id === planId);
        if (plan) {
            setUpgradeModalData({ plan, cycle: billingCycle });
        }
    };

    const handleConfirmUpgrade = () => {
        if (!upgradeModalData) return;
        setIsProcessingUpgrade(true);
        
        // Simulate API Processing
        setTimeout(() => {
            setCurrentPlanId(upgradeModalData.plan.id);
            const price = upgradeModalData.cycle === 'monthly' ? upgradeModalData.plan.monthlyPrice : upgradeModalData.plan.yearlyPrice;
            
            // Add new transaction
            const newTx: Transaction = {
                id: `tx_${Date.now()}`,
                date: Date.now(),
                planName: `${upgradeModalData.plan.name} (${upgradeModalData.cycle === 'monthly' ? 'Monthly' : 'Yearly'})`,
                amount: price,
                status: 'paid'
            };
            
            setTransactions(prev => [newTx, ...prev]);
            setIsProcessingUpgrade(false);
            setUpgradeModalData(null);
            alert(`Successfully upgraded to ${upgradeModalData.plan.name}!`);
        }, 2000);
    };

    const handleCancelSubscription = () => {
        setAutoRenew(false);
        setShowCancelConfirm(false);
        alert("Subscription has been cancelled. You will retain access until the end of the billing period.");
    };

    const handleUpdatePayment = (newDetails: { number: string, expiry: string }) => {
        // Simulate API update
        setCardDetails({
            last4: newDetails.number.slice(-4),
            expiry: newDetails.expiry,
            brand: 'Mastercard' // Simulating a switch or generic
        });
        setShowPaymentModal(false);
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <CreditCard className="text-syan-orange" size={32} /> Subscription & Billing
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your plan, billing details, and payments.</p>
                </div>
            </div>

            {/* Current Plan Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${isExpired ? 'bg-red-100 text-red-600' : 'bg-syan-teal text-white'}`}>
                            {isExpired ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                {PLANS.find(p => p.id === currentPlanId)?.name || user.subscription.planName}
                                {isTrial && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold border border-amber-200">Trial</span>}
                                {isExpired && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold border border-red-200">Expired</span>}
                                {!isExpired && !isTrial && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold border border-green-200">Active</span>}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isExpired 
                                    ? "Your subscription has expired. Renew now to regain access." 
                                    : `Renews on ${new Date(user.subscription.expiryDate).toLocaleDateString()}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                         {/* Auto Renew Toggle */}
                         <div className="flex items-center justify-between sm:justify-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl w-full sm:w-auto">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Auto-renew</span>
                            <button 
                                onClick={() => setAutoRenew(!autoRenew)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${autoRenew ? 'bg-syan-teal' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${autoRenew ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                         </div>
                         <button 
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors w-full sm:w-auto"
                         >
                            Cancel Subscription
                         </button>
                    </div>
                </div>
            </div>

            {/* Available Plans */}
            <div>
                <div className="flex justify-center mb-8">
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 inline-flex">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Yearly <span className="bg-syan-green text-white text-[10px] px-1.5 py-0.5 rounded">SAVE 20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map(plan => {
                        const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                        const isCurrent = plan.id === currentPlanId;
                        
                        return (
                            <div key={plan.id} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border-2 flex flex-col relative transition-all duration-300 ${isCurrent ? 'border-syan-teal shadow-xl ring-4 ring-syan-teal/10 scale-105 z-10' : 'border-slate-100 dark:border-slate-700 shadow-lg hover:border-slate-200 dark:hover:border-slate-600'}`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-syan-orange to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl shadow-sm">
                                        MOST POPULAR
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-3xl font-black text-slate-800 dark:text-white">PKR {price.toLocaleString()}</span>
                                    <span className="text-slate-400 font-bold text-sm">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            <div className="mt-0.5 p-0.5 rounded-full bg-syan-green/10 text-syan-green">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => handlePlanChange(plan.id)}
                                    disabled={isCurrent}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                    isCurrent 
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default shadow-none' 
                                    : plan.isPopular 
                                        ? 'bg-syan-teal text-white hover:bg-syan-darkteal shadow-syan-teal/30' 
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                                }`}>
                                    {isCurrent ? 'Current Plan' : isExpired ? 'Renew Now' : 'Upgrade Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Payment History & Method */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Billing Details */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <CreditCard size={20} className="text-syan-teal" /> Payment History
                        </h3>
                        <button className="text-xs font-bold text-syan-teal hover:text-syan-darkteal flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{tx.planName}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">PKR {tx.amount.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                tx.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Current Payment Method */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-syan border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Payment Method</h3>
                    <div className="bg-gradient-to-br from-slate-800 to-black rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-xl group cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                             <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                                 <div className="w-6 h-4 bg-white/30 rounded-sm"></div>
                             </div>
                             <span className="font-mono text-xs font-bold opacity-70 border border-white/20 px-2 py-0.5 rounded uppercase">{cardDetails.brand}</span>
                        </div>
                        <div className="font-mono text-xl tracking-widest mb-6 relative z-10 text-shadow-sm">•••• •••• •••• {cardDetails.last4}</div>
                        <div className="flex justify-between text-[10px] font-bold opacity-70 uppercase tracking-wider relative z-10">
                            <span>Card Holder</span>
                            <span>Expires</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm relative z-10">
                            <span className="uppercase tracking-wide">{user.name}</span>
                            <span>{cardDetails.expiry}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                        Change Payment Method
                    </button>
                </div>
            </div>

            {/* Change Payment Modal */}
            {showPaymentModal && (
                <PaymentMethodModal 
                    onClose={() => setShowPaymentModal(false)}
                    onSave={handleUpdatePayment}
                />
            )}

            {/* Plan Upgrade Confirmation Modal */}
            {upgradeModalData && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Confirm Subscription</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{upgradeModalData.plan.name}</h4>
                                    <p className="text-sm text-slate-500">{upgradeModalData.cycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-syan-teal">
                                        PKR {(upgradeModalData.cycle === 'monthly' ? upgradeModalData.plan.monthlyPrice : upgradeModalData.plan.yearlyPrice).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-slate-500">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Payment Method</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">Visa ending in {cardDetails.last4}</p>
                                </div>
                            </div>
                            
                            <div className="text-xs text-slate-400 text-center px-4">
                                By clicking confirm, you agree to be charged immediately. Your subscription will renew automatically.
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button 
                                onClick={() => setUpgradeModalData(null)} 
                                disabled={isProcessingUpgrade} 
                                className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmUpgrade} 
                                disabled={isProcessingUpgrade} 
                                className="flex-1 py-3 bg-syan-teal text-white font-bold rounded-xl shadow-lg hover:bg-syan-darkteal flex items-center justify-center gap-2"
                            >
                                {isProcessingUpgrade ? <Loader2 className="animate-spin" /> : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertOctagon size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cancel Subscription?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">
                                Are you sure you want to cancel? You will lose access to premium features like AI Tutor and Mock Exams at the end of your current billing cycle.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Keep My Subscription
                                </button>
                                <button 
                                    onClick={handleCancelSubscription}
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                                >
                                    Yes, Cancel It
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

/* --- SUB COMPONENTS --- */

const PaymentMethodModal: React.FC<{ 
    onClose: () => void;
    onSave: (details: { number: string, expiry: string }) => void;
}> = ({ onClose, onSave }) => {
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Formatters
    const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 16);
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardData({ ...cardData, number: val });
    };

    const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setCardData({ ...cardData, expiry: val });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cardData.number.length < 19 || cardData.expiry.length < 5 || cardData.cvc.length < 3) {
            alert("Please fill in all card details correctly.");
            return;
        }
        setIsLoading(true);
        // Simulate API
        setTimeout(() => {
            onSave({ number: cardData.number, expiry: cardData.expiry });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-syan-teal" /> Update Payment Method
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
                        <Lock className="text-blue-600 flex-shrink-0" size={20} />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Your payment information is encrypted and secure. We never store your full card number.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="0000 0000 0000 0000"
                                    value={cardData.number}
                                    onChange={handleCardNumber}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-syan-teal outline-none font-mono text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expiry Date</label>
                                <input 
                                    type="text" 
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={cardData.expiry}
                                    onChange={handleExpiry}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-syan-teal outline-none font-mono text-slate-800 dark:text-white text-center"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">CVC / CVV</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    <input 
                                        type="password" 
                                        placeholder="123"
                                        maxLength={4}
                                        value={cardData.cvc}
                                        onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g,'')})}
                                        className="w-full pl-9 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-syan-teal outline-none font-mono text-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cardholder Name</label>
                            <input 
                                type="text" 
                                placeholder="Dr. John Doe"
                                value={cardData.name}
                                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-syan-teal outline-none text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-3.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Check />} Save Card
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

