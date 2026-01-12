'use client';

import { Moon, Sun, Download, LogOut, Clock, Bell, Mail, Globe, Shield, Lock, Trash2, Key, Languages, HardDrive, Type } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

export default function SettingsPage() {
    const { isDarkMode, toggleDarkMode, fontFamily, setFontFamily } = useTheme();
    const { logout, user } = useAuth();
    const router = useRouter();
    const { success, error } = useToast();

    // State management
    // State management with operational persistence
    const [sessionTimeout, setSessionTimeout] = useState(() => localStorage.getItem('pref_session_timeout') || '30');
    const [language, setLanguage] = useState(() => localStorage.getItem('pref_language') || 'en-US');
    const [timezone, setTimezone] = useState(() => localStorage.getItem('pref_timezone') || 'Asia/Kolkata');
    const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('pref_email_notifications') === 'true');
    const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem('pref_push_notifications') === 'true');
    const [autoSave, setAutoSave] = useState(() => localStorage.getItem('pref_auto_save') !== 'false');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleExportData = () => {
        success('Data export started. You will receive a download link via email.');
    };

    const handleClearCache = () => {
        const authToken = localStorage.getItem('authToken');
        localStorage.clear();
        if (authToken) {
            localStorage.setItem('authToken', authToken);
        }
        success('Cache cleared successfully');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleChangePassword = () => {
        router.push('/profile?tab=security');
    };

    const handleEnable2FA = () => {
        setTwoFactorEnabled(!twoFactorEnabled);
        if (!twoFactorEnabled) {
            success('Two-Factor Authentication enabled successfully');
        } else {
            success('Two-Factor Authentication disabled');
        }
    };

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleDeleteAccount = () => {
        setIsDeleteOpen(true);
    };

    const confirmDeleteAccount = () => {
        error('Account deletion requires admin approval. Please contact support.');
        setIsDeleteOpen(false);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('pref_session_timeout', sessionTimeout);
        localStorage.setItem('pref_language', language);
        localStorage.setItem('pref_timezone', timezone);
        localStorage.setItem('pref_email_notifications', emailNotifications.toString());
        localStorage.setItem('pref_push_notifications', pushNotifications.toString());
        localStorage.setItem('pref_auto_save', autoSave.toString());
        success('Global configuration synchronized successfully');
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-xl flex items-center justify-center shadow-md rotate-2 hover:rotate-0 transition-transform duration-300">
                    <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Security & Preferences</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        System Configuration Hub
                    </p>
                </div>
            </div>

            {/* Top Row - Command Center Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Theme Controller */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                    {isDarkMode ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-white" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Theme Interface</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isDarkMode ? 'Dark Protocol' : 'Standard View'}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Font Identity */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                                <Type className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Font Identity</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Typography Hub</p>
                            </div>
                        </div>
                        <select
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="var(--font-outfit)">Outfit (Premium)</option>
                            <option value="var(--font-inter)">Inter (Default)</option>
                            <option value="var(--font-roboto)">Roboto (Classic)</option>
                            <option value="system-ui">System (Native)</option>
                        </select>
                    </CardContent>
                </Card>

                {/* Regional Interface */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                                <Languages className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">System Language</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Locale Selector</p>
                            </div>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </CardContent>
                </Card>

                {/* Global Timezone */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                                <Globe className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Temporal Zone</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Architecture Time</p>
                            </div>
                        </div>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                            <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                        </select>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Row - Session & Persistence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auth Session */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                <Clock className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Session Timeout</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Security Threshold</p>
                            </div>
                        </div>
                        <select
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="never">Never (Bypass)</option>
                        </select>
                    </CardContent>
                </Card>

                {/* Configuration Memory */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                    <HardDrive className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Operational Memory</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Auto-Save State</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAutoSave(!autoSave)}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${autoSave ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${autoSave ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Broadcast Preferences */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Bell className="h-3.5 w-3.5 text-indigo-500" />
                        Broadcast Engine
                    </h3>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Email Channels</p>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${emailNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <Bell className="h-3.5 w-3.5 text-slate-400" />
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Direct Push</p>
                            </div>
                            <button
                                onClick={() => setPushNotifications(!pushNotifications)}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${pushNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${pushNotifications ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Shield Infrastructure */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Shield className="h-3.5 w-3.5 text-indigo-500" />
                        Shield Infrastructure
                    </h3>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={handleChangePassword}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-all text-left shadow-sm group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:rotate-6 transition-transform">
                                <Lock className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Key Rotation</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Secure Override</p>
                            </div>
                        </button>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                    <Key className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">TOTP Protocol</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Two-Factor Auth</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEnable2FA}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Row - Session, Data, Danger, About */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Session */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Session</h4>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{user?.email}</p>
                        <Button variant="outline" size="sm" onClick={handleLogout} leftIcon={<LogOut className="h-3 w-3" />} className="w-full text-xs">
                            Logout
                        </Button>
                    </CardContent>
                </Card>

                {/* Data */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Data</h4>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" onClick={handleExportData} leftIcon={<Download className="h-3 w-3" />} className="w-full text-xs">
                            Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClearCache} className="w-full text-xs text-amber-600 dark:text-amber-400">
                            Clear Cache
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10">
                    <CardHeader className="pb-2">
                        <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-400">Danger Zone</h4>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteAccount}
                            className="w-full text-xs border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                            leftIcon={<Trash2 className="h-3 w-3" />}
                        >
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>

                {/* About */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">About</h4>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Version</span>
                                <span className="font-medium text-slate-900 dark:text-white">1.0.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Env</span>
                                <span className="font-medium text-slate-900 dark:text-white">{process.env.NODE_ENV || 'dev'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Action */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSavePreferences}
                    variant="primary"
                    className="h-10 px-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                >
                    Synchronize System Architecture
                </Button>
            </div>

            <DeleteConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDeleteAccount}
                message="Are you sure you want to delete your account? This action cannot be undone."
            />
        </div >
    );
};
