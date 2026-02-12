'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    User, Mail, Shield, Calendar, Edit, Lock, Key, AlertCircle,
    Fingerprint, Camera,
    Bell, Palette, Languages, Save, X, Check,
    Settings, Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/lib/api/services';
import { UpdateUserModel } from '@adminvault/shared-models';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Modal } from '@/components/ui/Modal';

type TabType = 'overview' | 'personal' | 'security' | 'preferences';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [editedData, setEditedData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || ''
    });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'personal', 'security', 'preferences'].includes(tab)) {
            setActiveTab(tab as TabType);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            setEditedData({
                fullName: user.fullName,
                email: user.email
            });
        }
    }, [user]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsUpdating(true);
        try {
            const model = new UpdateUserModel(user.id);
            model.password = passwordData.new;
            const res = await authService.updateUser(model);
            if (res.status) {
                toast.success('Password updated successfully');
                setIsPasswordModalOpen(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                toast.error(res.message || 'Failed to update password');
            }
        } catch (error) {
            toast.error('An error occurred while updating password');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsUpdating(true);
        try {
            const model = new UpdateUserModel(user.id);
            model.fullName = editedData.fullName;
            model.email = editedData.email;
            const res = await authService.updateUser(model);
            if (res.status) {
                toast.success('Profile updated successfully');
                setIsEditing(false);
            } else {
                toast.error(res.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred while updating profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (password.length === 0) return { strength: 0, label: 'None', color: 'bg-slate-200' };
        if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-rose-500' };
        if (password.length < 10) return { strength: 50, label: 'Fair', color: 'bg-amber-500' };
        if (password.length < 14) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-emerald-500' };
    };

    const passwordStrength = getPasswordStrength(passwordData.new);


    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'personal', label: 'Personal Info', icon: Edit },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Settings }
    ];

    return (
        <RouteGuard>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 p-4 space-y-4">
                {/* Hero Profile Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[1.4rem] p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl shadow-indigo-500/50">
                                    <div className="w-full h-full rounded-[1.1rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                            {user!.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">
                                    {user!.fullName}
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{user!.email}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                                    <span className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5" />
                                        {user!.role || 'Administrator'}
                                    </span>
                                    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                                        <Check className="h-3.5 w-3.5" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 gap-4">
                            {/* Quick Actions */}
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">Quick Actions</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Common tasks and settings</p>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <button
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left"
                                        >
                                            <Key className="h-5 w-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Change Password</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Update your password</div>
                                        </button>
                                        <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left">
                                            <Camera className="h-5 w-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Update Photo</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Change profile picture</div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('security')}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left"
                                        >
                                            <Shield className="h-5 w-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Security Settings</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">2FA and sessions</div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('preferences')}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group text-left"
                                        >
                                            <Settings className="h-5 w-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
                                            <div className="text-xs font-bold text-slate-900 dark:text-white">Preferences</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Theme and language</div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 max-w-3xl">
                            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">Personal Information</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update your personal details</p>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditing(true)}
                                        leftIcon={<Edit className="h-3.5 w-3.5" />}
                                        className="rounded-lg text-xs h-8 px-3"
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5" />
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedData.fullName}
                                                onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-900 dark:text-white px-3 py-2">{user!.fullName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editedData.email}
                                                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-900 dark:text-white px-3 py-2">{user!.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5" />
                                            Role
                                        </label>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white px-3 py-2">{user!.role || 'Administrator'}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Member Since
                                        </label>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white px-3 py-2">January 2024</p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditedData({ fullName: user!.fullName, email: user!.email });
                                            }}
                                            leftIcon={<X className="h-3.5 w-3.5" />}
                                            className="rounded-lg text-xs h-8 px-3"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleSaveProfile}
                                            isLoading={isUpdating}
                                            leftIcon={<Save className="h-3.5 w-3.5" />}
                                            className="rounded-lg text-xs h-8 px-3"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-indigo-600" />
                                        Password
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Keep your account secure by using a strong password
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        leftIcon={<Key className="h-3.5 w-3.5" />}
                                        className="w-full rounded-lg text-xs h-9"
                                    >
                                        Change Password
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Fingerprint className="h-4 w-4 text-emerald-600" />
                                        Two-Factor Authentication
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Add an extra layer of security to your account
                                    </p>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Status: Enabled</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Palette className="h-4 w-4 text-purple-600" />
                                        Appearance
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Theme</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Light', 'Dark', 'Auto'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all text-xs font-bold"
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-amber-600" />
                                        Notifications
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Notifications</span>
                                        <button className="w-10 h-5 rounded-full bg-indigo-600 relative">
                                            <div className="w-4 h-4 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Push Notifications</span>
                                        <button className="w-10 h-5 rounded-full bg-slate-200 dark:bg-slate-700 relative">
                                            <div className="w-4 h-4 rounded-full bg-white absolute left-0.5 top-0.5"></div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Languages className="h-4 w-4 text-blue-600" />
                                        Language & Region
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Language</label>
                                            <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                                                <option>English (US)</option>
                                                <option>Spanish</option>
                                                <option>French</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Timezone</label>
                                            <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500">
                                                <option>UTC-5 (Eastern Time)</option>
                                                <option>UTC-8 (Pacific Time)</option>
                                                <option>UTC+0 (GMT)</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Change Password Modal */}
                <Modal
                    isOpen={isPasswordModalOpen}
                    onClose={() => {
                        setIsPasswordModalOpen(false);
                        setPasswordData({ current: '', new: '', confirm: '' });
                    }}
                    title="Change Password"
                    size="md"
                >
                    <form onSubmit={handlePasswordChange} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {passwordData.new && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Password Strength</span>
                                        <span className={`font-bold ${passwordStrength.strength >= 75 ? 'text-emerald-600' : passwordStrength.strength >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                                placeholder="Confirm new password"
                            />
                            {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                                <p className="text-xs text-rose-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Passwords do not match
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    setPasswordData({ current: '', new: '', confirm: '' });
                                }}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                isLoading={isUpdating}
                                disabled={passwordData.new !== passwordData.confirm || passwordData.new.length < 6}
                                className="rounded-xl"
                            >
                                Update Password
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
};

export default ProfilePage;
