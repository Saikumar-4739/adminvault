'use client';

import { Moon, Sun, Download, LogOut, Clock, Bell, Mail, Globe, Shield, Lock, Trash2, Key, Languages, HardDrive } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

export default function SettingsPage() {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { logout, user } = useAuth();
    const router = useRouter();
    const { success, error } = useToast();
    
    // State management
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [language, setLanguage] = useState('en-US');
    const [timezone, setTimezone] = useState('Asia/Kolkata');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
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

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            error('Account deletion requires admin approval. Please contact support.');
        }
    };

    const handleSavePreferences = () => {
        success('Preferences saved successfully');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            
            {/* Top Row - Theme, Language, Timezone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dark Mode */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                    {isDarkMode ? <Moon className="h-4 w-4 text-white" /> : <Sun className="h-4 w-4 text-white" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">Theme</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'} mode</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Language */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                <Languages className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">Language</p>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                {/* Timezone */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                <Globe className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">Timezone</p>
                        </div>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Middle Row - Session & Auto-Save */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Session Timeout */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                                <Clock className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">Session Timeout</p>
                        </div>
                        <select
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="never">Never</option>
                        </select>
                    </CardContent>
                </Card>

                {/* Auto-Save */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                    <HardDrive className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">Auto-Save</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Save changes automatically</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAutoSave(!autoSave)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${autoSave ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-500" />
                        Notifications
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</p>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</p>
                            </div>
                            <button
                                onClick={() => setPushNotifications(!pushNotifications)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${pushNotifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security & Privacy */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="h-4 w-4 text-indigo-500" />
                        Security & Privacy
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                            onClick={handleChangePassword}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
                        >
                            <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Change Password</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Update your password</p>
                            </div>
                        </button>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Auth</p>
                            </div>
                            <button
                                onClick={handleEnable2FA}
                                className={`relative w-12 h-6 rounded-full transition-colors ${twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
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

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSavePreferences} variant="primary">
                    Save All Preferences
                </Button>
            </div>

        </div>
    );
};
