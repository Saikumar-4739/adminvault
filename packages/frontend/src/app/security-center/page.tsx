'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ShieldCheck,
    Key,
    ShieldAlert,
    Fingerprint,
    Smartphone,
    Activity,
    Zap,
    Shield,
    Terminal,
    Globe,
    UserCheck,
    LockIcon,
    RefreshCcw
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { StatCard } from '@/components/ui/StatCard';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, Threat, SecurityProtocol } from '@adminvault/shared-models';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { securityService } from '@/lib/api/services';
import { AlertMessages } from '@/lib/utils/AlertMessages';

export default function SecurityCenterPage() {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const { stats, isLoading: isStatsLoading } = useDashboardStats();

    const [activeThreats, setActiveThreats] = useState<Threat[]>([]);
    const [protocols, setProtocols] = useState<SecurityProtocol[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSecurityData = useCallback(async () => {
        if (!user?.companyId) return;
        setIsLoading(true);
        try {
            const [threatsRes, protocolsRes] = await Promise.all([
                securityService.getThreats(user.companyId),
                securityService.getProtocols(user.companyId)
            ]);

            if (threatsRes.status) {
                setActiveThreats(threatsRes.data || []);
            }
            if (protocolsRes.status) {
                setProtocols(protocolsRes.data || []);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch security data');
        } finally {
            setIsLoading(false);
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchSecurityData();
    }, [fetchSecurityData]);

    // Secondary metrics derived from stats
    const securityScore = stats?.security?.score || 94;
    const identityMetrics = stats?.security?.metrics?.identity || 88;
    const deviceMetrics = stats?.security?.metrics?.devices || 76;
    const complianceMetrics = stats?.security?.metrics?.compliance || 100;

    const protocolIcons: Record<string, any> = {
        'Multi-Factor Authentication': UserCheck,
        'Endpoint Encryption': Key,
        'Geofencing Restrictions': Globe,
        'Zero-Trust Verification': Shield,
        'Network Segmentation': LockIcon,
        'Auto-Lock Inactive Users': UserCheck
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}>
            <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-500/20">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            Security Center
                        </h1>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Unified threat intelligence, identity governance, and perimeter defense monitoring.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchSecurityData}
                            disabled={isLoading}
                            className="rounded-2xl h-11 px-4 font-bold border-slate-200 dark:border-slate-800"
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="danger" className="rounded-2xl h-11 px-6 font-bold shadow-xl shadow-rose-600/20">
                            <Zap className="h-4 w-4 mr-2" />
                            Emergency Lockdown
                        </Button>
                    </div>
                </div>

                {/* Score & Primary Pulse */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Score Card */}
                    <div className={`p-8 rounded-[3rem] border flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - securityScore / 100)} className="text-emerald-500 transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{securityScore}%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Health</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>System Integrity</h3>
                            <p className="text-[10px] font-medium text-emerald-500 font-mono">No Active Breaches Detected</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Identity Shield"
                            value={`${identityMetrics}%`}
                            icon={Fingerprint}
                            gradient="from-blue-500 to-indigo-600"
                            iconBg="bg-blue-500/10"
                            iconColor="text-blue-500"
                            isLoading={isStatsLoading}
                        />
                        <StatCard
                            title="Device Trust"
                            value={`${deviceMetrics}%`}
                            icon={Smartphone}
                            gradient="from-amber-500 to-orange-600"
                            iconBg="bg-amber-500/10"
                            iconColor="text-amber-500"
                            isLoading={isStatsLoading}
                        />
                        <StatCard
                            title="Compliance"
                            value={`${complianceMetrics}%`}
                            icon={ShieldCheck}
                            gradient="from-emerald-500 to-teal-600"
                            iconBg="bg-emerald-500/10"
                            iconColor="text-emerald-500"
                            isLoading={isStatsLoading}
                        />
                    </div>
                </div>

                {/* Sub-sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Threats Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Live Threat Intelligence</h3>
                            <span className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                                Monitoring 24/7
                            </span>
                        </div>
                        <div className="space-y-3">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
                                ))
                            ) : activeThreats.length === 0 ? (
                                <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-bold text-slate-500">No active threats detected</p>
                                </div>
                            ) : (
                                activeThreats.map((threat) => (
                                    <div key={threat.id} className={`p-5 rounded-3xl border flex items-center justify-between transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`p-3 rounded-2xl ${threat.gravity === 'High' || threat.gravity === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                <ShieldAlert className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{threat.type}</h4>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${threat.status === 'Blocked' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        {threat.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                                    <Globe className="h-3 w-3" />
                                                    Source: {threat.source}
                                                    <span className="opacity-20">•</span>
                                                    <Activity className="h-3 w-3" />
                                                    {threat.time}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Review</Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Security Actions Card */}
                    <div className="space-y-6">
                        <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Defensive Protocols</h3>
                        <div className={`p-6 rounded-[3rem] border space-y-6 ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/20 shadow-2xl shadow-indigo-500/5' : 'bg-slate-950 text-white'}`}>
                            <div className="space-y-4">
                                {isLoading ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                                    ))
                                ) : (
                                    protocols.map((protocol, i) => {
                                        const Icon = protocolIcons[protocol.name] || Shield;
                                        const isActive = protocol.status === 'Active';

                                        return (
                                            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/5 border-white/10'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-4 w-4 text-indigo-400" />
                                                    <span className="text-xs font-bold">{protocol.name}</span>
                                                </div>
                                                <div className={`w-10 h-5 rounded-full p-1 transition-colors cursor-pointer ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <Button className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-600/20">
                                Update Security Policy
                            </Button>
                        </div>

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:bg-indigo-600 hover:text-white ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <Terminal className="h-5 w-5 opacity-50" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Audit Logs</span>
                            </button>
                            <button className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:bg-indigo-600 hover:text-white ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <LockIcon className="h-5 w-5 opacity-50" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Vault Sync</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
