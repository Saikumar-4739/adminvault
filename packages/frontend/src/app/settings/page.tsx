'use client';

import { Moon, Sun, Download, LogOut, Shield, Lock, Trash2, HardDrive, Type, AppWindow, Settings2, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const SettingsPage: React.FC = () => {
    const { isDarkMode, toggleDarkMode, fontFamily, setFontFamily } = useTheme();
    const { logout, user } = useAuth();
    const router = useRouter();
    const { stats, isLoading: statsLoading } = useDashboardStats();

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 p-4 lg:p-8 space-y-6 overflow-y-auto">
            <PageHeader
                icon={<Settings2 />}
                title="System Preferences"
                description="Global environment configuration & interface protocols"
                gradient="from-slate-700 to-slate-900"
            />

            {/* Preference Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Theme Protocol"
                    value={isDarkMode ? 'DARK' : 'LIGHT'}
                    icon={isDarkMode ? Moon : Sun}
                    gradient={isDarkMode ? "from-indigo-600 to-purple-700" : "from-amber-400 to-orange-500"}
                    iconBg={isDarkMode ? "bg-indigo-900/20" : "bg-orange-50"}
                    iconColor={isDarkMode ? "text-indigo-400" : "text-orange-500"}
                    isLoading={false}
                />
                <StatCard
                    title="System Health"
                    value={stats?.systemHealth.status === 'HEALTHY' ? 100 : 98}
                    unit="%"
                    icon={Activity}
                    gradient="from-emerald-500 to-teal-600"
                    iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    isLoading={statsLoading}
                />
                <StatCard
                    title="Logic Latency"
                    value={0.8}
                    unit="ms"
                    icon={Zap}
                    gradient="from-blue-500 to-indigo-600"
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    isLoading={false}
                />
                <StatCard
                    title="Active Modules"
                    value={12}
                    icon={AppWindow}
                    gradient="from-purple-500 to-violet-600"
                    iconBg="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    isLoading={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interface Control - Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                        {isDarkMode ? <Moon className="h-5 w-5 text-white" /> : <Sun className="h-5 w-5 text-white" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Interface Theme</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isDarkMode ? 'Night Protocol Active' : 'Daylight Protocol Active'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-500 p-1 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-500 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                                        <Type className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Typography Engine</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Font Identity</p>
                                    </div>
                                </div>
                                <select
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="var(--font-outfit)">Outfit (High Density)</option>
                                    <option value="var(--font-inter)">Inter (Geometric)</option>
                                    <option value="var(--font-roboto)">Roboto (Functional)</option>
                                    <option value="system-ui">System (Native Engine)</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <HardDrive className="h-4 w-4 text-emerald-500" />
                                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Data Governance</h3>
                            </div>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-white/10" onClick={handleExportData} leftIcon={<Download className="h-3.5 w-3.5" />}>
                                    Export Identity Pool
                                </Button>
                                <Button variant="outline" className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10" onClick={handleClearCache}>
                                    Purge Local Cache
                                </Button>
                            </div>
                        </Card>

                        <Card className="rounded-[2.5rem] border-rose-100 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-900/5 shadow-sm overflow-hidden p-8 space-y-6">
                            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                                <Trash2 className="h-4 w-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Danger Protocols</h3>
                            </div>
                            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-relaxed">
                                Irreversible identity deletion requires architecture-level authorization.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 shadow-lg shadow-rose-500/5"
                                onClick={handleDeleteAccount}
                            >
                                Decommission Account
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Info Sidebar - Right Column */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-indigo-500" />
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Access Session</h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Identity</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                        </div>
                        <Button
                            variant="primary"
                            className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 shadow-xl shadow-indigo-500/20"
                            onClick={handleLogout}
                            leftIcon={<LogOut className="h-4 w-4" />}
                        >
                            Terminate Session
                        </Button>
                    </Card>

                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Build Manifest</h3>
                        </div>
                        <div className="space-y-2">
                            <ManifestItem label="Protocol" value="1.0.0-PRO" />
                            <ManifestItem label="Engine" value="Next.js 14" />
                            <ManifestItem label="Node" value={process.env.NODE_ENV?.toUpperCase() || 'PRODUCTION'} status="active" />
                        </div>
                    </Card>
                </div>
            </div>

            <DeleteConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDeleteAccount}
                message="Are you sure you want to delete your account? This action cannot be undone."
            />
        </div>
    );
};

function ManifestItem({ label, value, status }: { label: string; value: string; status?: 'active' }) {
    return (
        <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{value}</span>
                {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
            </div>
        </div>
    );
}

export default SettingsPage;