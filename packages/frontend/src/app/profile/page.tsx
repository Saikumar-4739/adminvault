'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building, Shield, Calendar, MapPin, Phone, Edit, Lock, Key, Smartphone, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/lib/api/services';
import { UpdateUserModel } from '@adminvault/shared-models';
import { Modal } from '@/components/ui/Modal';

type TabType = 'profile' | 'security';

export default function ProfilePage() {
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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">

            {/* Compact Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-xl flex items-center justify-center shadow-md rotate-2 hover:rotate-0 transition-transform duration-300">
                        <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Account Identity</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Profile & Security Oversight</p>
                    </div>
                </div>

                <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Registry
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        Security
                    </button>
                </div>
            </div>

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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoField icon={<User className="h-4 w-4" />} label="Full Name" value={user.fullName} isEditing={isEditing} />
                                    <InfoField icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} isEditing={isEditing} />
                                    <InfoField icon={<Phone className="h-4 w-4" />} label="Phone" value="+1 (555) 000-0000" isEditing={isEditing} />
                                    <InfoField icon={<Building className="h-4 w-4" />} label="Organization" value="AdminVault Enterprise" isEditing={isEditing} />
                                    <InfoField icon={<MapPin className="h-4 w-4" />} label="Location" value="Corporate HQ" isEditing={isEditing} />
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

                        {/* Security Status */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Security Status</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <StatusItem label="Password" value="Strong" status="success" />
                                <StatusItem label="2FA" value="Enabled" status="success" />
                                <StatusItem label="Last Login" value="2h ago" status="info" />
                                <StatusItem label="Active Sessions" value="1 device" status="info" />
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Rapid Commands</h3>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full h-9 justify-start text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    leftIcon={<Key className="h-3 w-3" />}
                                >
                                    Rotate Password
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-9 justify-start text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    onClick={() => setActiveTab('security')}
                                    leftIcon={<Lock className="h-3 w-3" />}
                                >
                                    API Management
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-9 justify-start text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    onClick={() => setActiveTab('security')}
                                    leftIcon={<Smartphone className="h-3 w-3" />}
                                >
                                    2FA Oversight
                                </Button>
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
