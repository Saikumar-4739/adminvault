'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Calendar, Edit, Lock, Key, AlertCircle } from 'lucide-react';
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

type TabType = 'profile' | 'security';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const toast = useToast();
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
        <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">

            {/* Standardized Header */}
            <PageHeader
                icon={<User />}
                title="Account Identity"
                description="Profile & Security Oversight"
                gradient="from-slate-700 to-slate-900"
            >
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <User className="h-3 w-3" />
                        Registry
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Shield className="h-3 w-3" />
                        Security
                    </button>
                </div>
            </PageHeader>

            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Profile Info - Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Profile</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Core System Credentials</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                    onClick={() => setIsEditing(!isEditing)}
                                    leftIcon={<Edit className="h-3 w-3" />}
                                >
                                    {isEditing ? 'Discard' : 'Maintain'}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoField icon={<User className="h-4 w-4" />} label="Full Name" value={user.fullName} isEditing={isEditing} />
                                    <InfoField icon={<Mail className="h-4 w-4" />} label="System Email" value={user.email} isEditing={isEditing} />
                                    <InfoField icon={<Shield className="h-4 w-4" />} label="Access Role" value={user.role || 'Administrator'} isEditing={false} />
                                    <InfoField icon={<Calendar className="h-4 w-4" />} label="Member Since" value="Jan 2024" isEditing={false} />
                                </div>
                                {isEditing && (
                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button variant="primary" size="sm">Save Changes</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Role & Permissions */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Role & Permissions</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your access level and permissions</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.role || 'Administrator'}</p>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Global Architecture Access</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-6">

                        {/* Security Oversight */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5 text-indigo-500" />
                                    Security Oversight
                                </h3>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <StatusItem label="Password Strength" value="High" status="success" />
                                    <StatusItem label="2FA Protection" value="Active" status="success" />
                                    <StatusItem label="Last Login" value="2h ago" status="info" />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        leftIcon={<Key className="h-3.5 w-3.5" />}
                                    >
                                        Rotate Security Key
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Info */}
                        <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-medium text-slate-900 dark:text-white">Need Help?</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Contact your administrator to update corporate information.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="max-w-2xl">
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account security</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Password Protection</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Your account is secured with a password</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    leftIcon={<Key className="h-4 w-4" />}
                                >
                                    Change Password
                                </Button>
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
                <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Security Key</label>
                        <input
                            type="password"
                            required
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confirm Key Rotation</label>
                        <input
                            type="password"
                            required
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="outline" type="button" onClick={() => setIsPasswordModalOpen(false)} className="h-9 text-[9px] font-black uppercase tracking-widest">Discard</Button>
                        <Button variant="primary" type="submit" isLoading={isUpdating} className="h-9 px-8 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">Rotate Credentials</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function InfoField({ icon, label, value, isEditing }: { icon: React.ReactNode; label: string; value: string; isEditing: boolean }) {
    return (
        <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span className="w-2.5 h-2.5 flex items-center justify-center">
                    {icon}
                </span>
                {label}
            </label>
            {isEditing ? (
                <input
                    type="text"
                    defaultValue={value}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                />
            ) : (
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
            )}
        </div>
    );
}

function StatusItem({ label, value, status }: { label: string; value: string; status: 'success' | 'warning' | 'info' }) {
    const colors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{value}</span>
                <div className={`w-2 h-2 rounded-full ${colors[status]}`}></div>
            </div>
        </div>
    );
}


export default ProfilePage;
