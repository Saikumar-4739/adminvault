'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building, Shield, Calendar, MapPin, Phone, Edit, Lock } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const MFASetup = dynamic(() => import('./components/MFASetup'), { ssr: false });
const APIKeyManager = dynamic(() => import('./components/APIKeyManager'), { ssr: false });

type TabType = 'profile' | 'security';

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    if (!user) {
        return (
            <div className="h-screen flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950">
            {/* Compact Glass Header */}
            <div className="flex-shrink-0 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:scale-[1.02] transition-transform duration-300">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:text-indigo-500 transition-colors">
                                <Edit className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.fullName}</h1>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    <Shield className="w-3 h-3" />
                                    {user.role || 'Admin'}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">#{user.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Modern Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                        <TabButton
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            icon={<User className="h-4 w-4" />}
                            label="Personal Info"
                        />
                        <TabButton
                            active={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                            icon={<Lock className="h-4 w-4" />}
                            label="Security & API"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">

                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Detailed Info Card */}
                            <div className="md:col-span-2 space-y-6">
                                <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                                    <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Identity Details
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2">
                                            <InfoRow label="Full Name" value={user.fullName} icon={<User className="h-4 w-4" />} />
                                            <InfoRow label="Email Address" value={user.email} icon={<Mail className="h-4 w-4" />} isHighlighted />
                                            <InfoRow label="Organization" value="AdminVault Enterprise" icon={<Building className="h-4 w-4" />} />
                                            <InfoRow label="Phone Number" value="+1 (555) 000-0000" icon={<Phone className="h-4 w-4" />} />
                                            <InfoRow label="Work Location" value="Corporate Headquarters" icon={<MapPin className="h-4 w-4" />} />
                                            <InfoRow label="Member Since" value="Jan 2024" icon={<Calendar className="h-4 w-4" />} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="space-y-2 text-center md:text-left">
                                            <h3 className="text-xl font-black">Need to update your data?</h3>
                                            <p className="text-indigo-100 text-sm opacity-90">Corporate information is managed by your system administrator.</p>
                                        </div>
                                        <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                                            Contact Admin
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Info */}
                            <div className="md:col-span-1 space-y-6">
                                <Card className="border-none shadow-xl">
                                    <CardHeader className="pb-3">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Security Snapshot</h3>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <SecurityMetric label="Password Age" value="12 Days" status="secure" />
                                        <SecurityMetric label="MFA Status" value="Active" status="secure" />
                                        <SecurityMetric label="Last Login" value="2 hours ago" status="info" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-6">
                                <div className="space-y-2 pl-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Account Security</h3>
                                    <p className="text-xs text-slate-500">Manage how you verify your identity and protect your account.</p>
                                </div>
                                <MFASetup />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2 pl-1">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">API Access</h3>
                                    <p className="text-xs text-slate-500">Generate personal access tokens for developers and automated workflows.</p>
                                </div>
                                <APIKeyManager />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${active
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function InfoRow({ label, value, icon, isHighlighted }: { label: string; value: string; icon: React.ReactNode; isHighlighted?: boolean }) {
    return (
        <div className={`p-6 border-b border-slate-50 dark:border-slate-800 ${isHighlighted ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2">
                {icon}
                {label}
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

function SecurityMetric({ label, value, status }: { label: string; value: string; status: 'secure' | 'danger' | 'info' }) {
    const colors = {
        secure: 'text-emerald-500 bg-emerald-500',
        danger: 'text-rose-500 bg-rose-500',
        info: 'text-blue-500 bg-blue-500'
    };

    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${colors[status].split(' ')[0]}`}>{value}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${colors[status].split(' ')[1]}`} />
            </div>
        </div>
    );
}

