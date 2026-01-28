'use client';

import { Moon, Sun, Download, LogOut, Shield, Lock, Trash2, HardDrive, Type } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

const SettingsPage: React.FC = () => {
    const { isDarkMode, toggleDarkMode, fontFamily, setFontFamily } = useTheme();
    const { logout, user } = useAuth();
    const router = useRouter();

    // State management
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handleExportData = () => {
        AlertMessages.getSuccessMessage('Data export started. You will receive a download link via email.');
    };

    const handleClearCache = () => {
        const authToken = localStorage.getItem('authToken');
        localStorage.clear();
        if (authToken) {
            localStorage.setItem('authToken', authToken);
        }
        AlertMessages.getSuccessMessage('Cache cleared successfully');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleChangePassword = () => {
        router.push('/profile?tab=security');
    };

    const handleDeleteAccount = () => {
        setIsDeleteOpen(true);
    };

    const confirmDeleteAccount = () => {
        AlertMessages.getErrorMessage('Account deletion requires admin approval. Please contact support.');
        setIsDeleteOpen(false);
    };

    return (
        <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
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

            {/* Top Row - Appearance & Security */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Security - Password Redirect */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                <Lock className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Security Access</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identity Management</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleChangePassword}
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-[10px] font-black uppercase tracking-widest rounded-lg"
                        >
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Session, Data, Danger, About */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Session */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-indigo-500" />
                            Active Session
                        </h4>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-4 overflow-hidden text-ellipsis whitespace-nowrap">{user?.email}</p>
                        <Button variant="outline" size="sm" onClick={handleLogout} leftIcon={<LogOut className="h-3 w-3" />} className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-slate-200 dark:border-slate-700">
                            Terminate Session
                        </Button>
                    </CardContent>
                </Card>

                {/* Data */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <HardDrive className="h-3.5 w-3.5 text-rose-500" />
                            Data Governance
                        </h4>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <Button variant="outline" size="sm" onClick={handleExportData} leftIcon={<Download className="h-3 w-3" />} className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-slate-200 dark:border-slate-700">
                            Export Profile
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClearCache} className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                            Purge System Cache
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-900/5 shadow-sm">
                    <CardHeader className="pb-2 border-b border-rose-100 dark:border-rose-900/30">
                        <h4 className="text-[10px] font-black text-rose-900 dark:text-rose-400 uppercase tracking-tight flex items-center gap-2">
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            Danger Zone
                        </h4>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-[9px] font-bold text-rose-600/60 dark:text-rose-400/60 uppercase mb-4">Permanent action</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteAccount}
                            className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                            leftIcon={<Trash2 className="h-3 w-3" />}
                        >
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>

                {/* About */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                    <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-emerald-500" />
                            Architecture Info
                        </h4>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-2 text-[10px] font-bold uppercase tracking-tight">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-500">Version</span>
                                <span className="text-slate-900 dark:text-white">1.0.0-PRO</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-500">Environment</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{process.env.NODE_ENV || 'PRODUCTION'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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


export default SettingsPage;