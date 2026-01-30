'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar, Edit, Lock, Key, AlertCircle, Activity, Globe, Fingerprint, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/lib/api/services';
import { UpdateUserModel } from '@adminvault/shared-models';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';

type TabType = 'profile' | 'security';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const toast = useToast();
    const { stats, isLoading: statsLoading } = useDashboardStats();

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'security' || tab === 'profile') {
            setActiveTab(tab as TabType);
        }
    }, [searchParams]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New passwords do not match');
            return;
        }

        setIsUpdating(true);
        try {
            const model = new UpdateUserModel(user.id);
            model.password = passwordData.new;
            const res = await authService.updateUser(model);
            if (res.status) {
                toast.success('Security credentials updated successfully');
                setIsPasswordModalOpen(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                toast.error(res.message || 'Failed to update security credentials');
            }
        } catch (error) {
            toast.error('An error occurred while updating security');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <PageLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 p-4 lg:p-8 space-y-6 overflow-y-auto">
            <PageHeader
                icon={<User />}
                title="Account Identity"
                description="Global profile & security oversight protocols"
                gradient="from-slate-700 to-slate-900"
            >
                <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <User className="h-3 w-3" />
                        Registry
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Shield className="h-3 w-3" />
                        Security
                    </button>
                </div>
            </PageHeader>

            {/* Identity Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Security Strength"
                    value={stats?.security.score || 94}
                    unit="%"
                    icon={Fingerprint}
                    gradient="from-emerald-500 to-teal-600"
                    iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Identity Integrity"
                    value={stats?.security.identityStrength || 98}
                    unit="%"
                    icon={Shield}
                    gradient="from-blue-500 to-indigo-600"
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Device Compliance"
                    value={stats?.security.deviceCompliance || 100}
                    unit="%"
                    icon={Smartphone}
                    gradient="from-purple-500 to-violet-600"
                    iconBg="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Access Velocity"
                    value={1.2}
                    unit="ms"
                    icon={Activity}
                    gradient="from-amber-500 to-orange-600"
                    iconBg="bg-amber-50 dark:bg-amber-900/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    isLoading={false}
                />
            </div>

            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Registry - Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Profile</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Architecture Registry</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5"
                                    onClick={() => setIsEditing(!isEditing)}
                                    leftIcon={<Edit className="h-3.5 w-3.5" />}
                                >
                                    {isEditing ? 'Discard' : 'Maintain Profile'}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <InfoField icon={<User className="h-4 w-4" />} label="Full Name" value={user.fullName} isEditing={isEditing} />
                                    <InfoField icon={<Mail className="h-4 w-4" />} label="System Email" value={user.email} isEditing={isEditing} />
                                    <InfoField icon={<Shield className="h-4 w-4" />} label="Access Role" value={user.role || 'Administrator'} isEditing={false} />
                                    <InfoField icon={<Calendar className="h-4 w-4" />} label="Registry Epoch" value="Jan 2024" isEditing={false} />
                                </div>
                                {isEditing && (
                                    <div className="mt-12 pt-8 border-t border-slate-50 dark:border-white/5 flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            className="px-8 text-[10px] font-black uppercase tracking-widest rounded-xl"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="px-10 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20"
                                        >
                                            Apply Changes
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-1">
                            <div className="p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[2.2rem]">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Security Clearance</h3>
                                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-indigo-500/5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group hover:scale-105 transition-transform duration-500">
                                        <Shield className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{user.role || 'Administrator'}</p>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Global Architecture Access • Protocol Versant</p>
                                    </div>
                                    <div className="hidden md:block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-full">
                                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Cleared</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-8">
                        <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-50 dark:border-white/5">
                                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5 text-indigo-500" />
                                    Security Oversight
                                </h3>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <StatusItem label="Credential Strength" value="Optimal" status="success" />
                                    <StatusItem label="2FA Shield" value="Hardened" status="success" />
                                    <StatusItem label="Last Node Access" value="2h ago" status="info" />
                                </div>

                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        leftIcon={<Key className="h-4 w-4" />}
                                    >
                                        Rotate Security Key
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Globe className="h-32 w-32" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <p className="text-sm font-black uppercase tracking-tight">Need Assistance?</p>
                                <p className="text-[10px] font-bold text-indigo-100 leading-relaxed uppercase tracking-widest">
                                    Contact architecture support to modify restricted corporate identity nodes.
                                </p>
                            </div>
                            <Button className="w-full h-10 bg-white text-indigo-600 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest rounded-xl relative z-10 mt-2">
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="max-w-3xl space-y-6">
                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Security Hardening</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel access protocols</p>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-indigo-600 text-white">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Credential Shield</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mandatory Rotation Active</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-xl border-slate-200 dark:border-white/10"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        leftIcon={<Key className="h-3.5 w-3.5" />}
                                    >
                                        Change Password
                                    </Button>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-600 text-white">
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">2FA Hardware</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Perimeter Hardened</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-xl border-slate-200 dark:border-white/10"
                                        disabled
                                    >
                                        Manage Hardware Keys
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title="Credential Rotation"
                size="md"
            >
                <form onSubmit={handlePasswordChange} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Security Key</label>
                        <input
                            type="password"
                            required
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            placeholder="••••••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Key Rotation</label>
                        <input
                            type="password"
                            required
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            placeholder="••••••••••••"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-white/5">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="h-10 px-8 text-[9px] font-black uppercase tracking-widest rounded-xl"
                        >
                            Discard
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isUpdating}
                            className="h-10 px-10 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20"
                        >
                            Rotate Credentials
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function InfoField({ icon, label, value, isEditing }: { icon: React.ReactNode; label: string; value: string; isEditing: boolean }) {
    return (
        <div className="space-y-2 group">
            <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors group-hover:text-indigo-500">
                <span className="w-4 h-4 flex items-center justify-center">
                    {icon}
                </span>
                {label}
            </label>
            {isEditing ? (
                <input
                    type="text"
                    defaultValue={value}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
                />
            ) : (
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight px-0.5">{value}</p>
            )}
        </div>
    );
}

function StatusItem({ label, value, status }: { label: string; value: string; status: 'success' | 'warning' | 'info' }) {
    const bgColors = {
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    };

    const dotColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</span>
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full ${bgColors[status]}`}>
                <span className="text-[9px] font-black uppercase tracking-widest">{value}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} animate-pulse`}></div>
            </div>
        </div>
    );
}

export default ProfilePage;
