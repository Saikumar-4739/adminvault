'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Zap,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    Download,
    LayoutDashboard,
    Shield,
    Gem,
    Receipt,
    RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function BillingPage() {
    const { isDarkMode } = useTheme();
    const [billingData, setBillingData] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [billRes, invRes] = await Promise.all([
                fetch('/api/organization/billing', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
                fetch('/api/organization/invoices', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json())
            ]).catch(() => [{ success: false }, { success: false }]);

            if (billRes.success) {
                setBillingData(billRes.data || []);
            }
            if (invRes.success) {
                setInvoices(invRes.data || []);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activePlan = billingData[0] || { planName: 'Free Tier', amount: 0, status: 'Active' };

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                            <Gem className="h-6 w-6" />
                        </div>
                        Billing & Subscriptions
                    </h1>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Manage your AdminVault plan, payment methods, and billing history.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        className={`rounded-2xl h-11 px-5 border ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Plan Card */}
                <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border relative overflow-hidden flex flex-col justify-between min-h-[400px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-indigo-950 text-white shadow-2xl shadow-indigo-500/10'}`}>
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Current Subscription</span>
                                <h2 className="text-4xl font-black tracking-tighter">{activePlan.planName}</h2>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                {activePlan.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Monthly Cost</p>
                                <p className="text-2xl font-black">${activePlan.amount}<span className="text-sm font-medium opacity-50">/mo</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Next Payment</p>
                                <p className="text-xl font-bold">{new Date(activePlan.nextBillingDate).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Payment Method</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-5 bg-white/10 rounded border border-white/20 flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-rose-500/50 -mr-1"></div>
                                        <div className="w-4 h-4 rounded-full bg-amber-500/50 -ml-1"></div>
                                    </div>
                                    <p className="text-xs font-bold">•••• 4242</p>
                                </div>
                            </div>
                        </div>

                        {/* Usage Metrics */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between text-xs font-bold opacity-70">
                                <span>Vault Capacity (Seats)</span>
                                <span>45 / 50</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[90%] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-8">
                        <Button className="rounded-2xl h-12 px-8 bg-white text-slate-950 font-black tracking-tight hover:bg-slate-100">
                            Upgrade Plan
                        </Button>
                        <Button variant="ghost" className="rounded-2xl h-12 px-6 border border-white/10 text-white font-bold hover:bg-white/5">
                            Manage Payment
                        </Button>
                    </div>
                </div>

                {/* Quick Actions / Recent Invoices */}
                <div className="space-y-6">
                    <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <h3 className={`text-lg font-black mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quick Actions</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Download Invoice', icon: Receipt },
                                { label: 'Usage Details', icon: LayoutDashboard },
                                { label: 'Security Audit', icon: Shield },
                                { label: 'API Access', icon: Zap }
                            ].map((action, i) => (
                                <button key={i} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-indigo-200'}`}>
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                        <action.icon className="h-4 w-4" />
                                    </div>
                                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{action.label}</span>
                                    <ArrowUpRight className="h-3 w-3 ml-auto opacity-30" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800 font-medium text-slate-400' : 'bg-slate-50 border-indigo-100 text-indigo-900/60'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                        </div>
                        <p className="text-xs leading-relaxed">
                            Past invoices and billing notifications are sent to your organization's primary contact email.
                        </p>
                    </div>
                </div>
            </div>

            {/* Billing Table */}
            <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="px-8 py-6 border-b border-slate-800/50 flex items-center justify-between">
                    <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Invoice History</h3>
                    <Button variant="ghost" className="text-xs font-bold text-indigo-500 hover:bg-indigo-500/5">View Full History</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-medium">
                        <thead>
                            <tr className={`${isDarkMode ? 'bg-slate-800/20 text-slate-500' : 'bg-slate-50/50 text-slate-400'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Invoice ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {invoices.length > 0 ? invoices.map((invoice, i) => (
                                <tr key={invoice.id} className={`group hover:bg-slate-800/20 transition-colors ${!isDarkMode && 'hover:bg-slate-50'}`}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <Receipt className="h-4 w-4" />
                                            </div>
                                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{invoice.invoiceNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-sm font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>${invoice.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${invoice.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            invoice.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                            }`}>
                                            <CheckCircle2 className="h-3 w-3" />
                                            {invoice.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500">
                                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-8 text-center text-slate-500 text-sm font-bold uppercase tracking-widest opacity-30">
                                        No billing records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
