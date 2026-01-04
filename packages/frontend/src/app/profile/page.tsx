'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building, Shield, Calendar, MapPin, Phone, Edit, Lock, Key, Smartphone, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const MFASetup = dynamic(() => import('@/features/profile/components/MFASetup'), { ssr: false });
const APIKeyManager = dynamic(() => import('@/features/profile/components/APIKeyManager'), { ssr: false });

type TabType = 'profile' | 'security';

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditing, setIsEditing] = useState(false);

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            
            {/* Header with Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account information and security</p>
                </div>
                
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'profile'
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <User className="h-4 w-4" />
                        Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === 'security'
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Lock className="h-4 w-4" />
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
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Basic Information</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your personal details</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setIsEditing(!isEditing)}
                                    leftIcon={<Edit className="h-3 w-3" />}
                                >
                                    {isEditing ? 'Cancel' : 'Edit'}
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
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">{user.role || 'Administrator'}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Full system access with administrative privileges</p>
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

                        {/* Quick Actions */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<Lock className="h-3 w-3" />}>
                                    Change Password
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<Key className="h-3 w-3" />}>
                                    Manage API Keys
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start" leftIcon={<Smartphone className="h-3 w-3" />}>
                                    Setup 2FA
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* MFA Setup */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Multi-Factor Authentication</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <MFASetup />
                    </div>

                    {/* API Keys */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">API Access Keys</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal access tokens</p>
                        </div>
                        <APIKeyManager />
                    </div>

                </div>
            )}

        </div>
    );
}

function InfoField({ icon, label, value, isEditing }: { icon: React.ReactNode; label: string; value: string; isEditing: boolean }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                {icon}
                {label}
            </label>
            {isEditing ? (
                <input
                    type="text"
                    defaultValue={value}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            ) : (
                <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
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
