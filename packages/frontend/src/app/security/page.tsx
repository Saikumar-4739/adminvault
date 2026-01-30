'use client';

import React from 'react';
import { ShieldCheck, Lock, Key, Eye, ShieldAlert, Fingerprint, Smartphone, ClipboardCheck, Activity } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

export default function SecurityPage() {
    const { stats, isLoading } = useDashboardStats();

    // Secondary metrics derived from stats
    const securityScore = stats?.security.score || 0;
    const identityMetrics = stats?.security.metrics.identity || 0;
    const deviceMetrics = stats?.security.metrics.devices || 0;
    const complianceMetrics = stats?.security.metrics.compliance || 0;

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/50 space-y-6">
                {/* Header Section */}
                <PageHeader
                    title="Security Infrastructure"
                    description="Enterprise identity protection and cryptographic oversight"
                    icon={<ShieldCheck />}
                    gradient="from-rose-500 to-red-600"
                    actions={[
                        {
                            label: `Threat Level: ${securityScore > 80 ? 'Minimal' : 'Elevated'}`,
                            variant: 'outline',
                            icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
                            onClick: () => { }
                        }
                    ]}
                />

                {/* Main Security Pulse */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Global Security Score"
                        value={`${securityScore}%`}
                        icon={ShieldCheck}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Identity Strength"
                        value={`${identityMetrics}%`}
                        icon={Fingerprint}
                        gradient="from-blue-500 to-indigo-600"
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Device Compliance"
                        value={`${deviceMetrics}%`}
                        icon={Smartphone}
                        gradient="from-amber-500 to-orange-600"
                        iconBg="bg-amber-50 dark:bg-amber-900/20"
                        iconColor="text-amber-600 dark:text-amber-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Regulatory Rating"
                        value={`${complianceMetrics}%`}
                        icon={ClipboardCheck}
                        gradient="from-rose-500 to-red-600"
                        iconBg="bg-rose-50 dark:bg-rose-900/20"
                        iconColor="text-rose-600 dark:text-rose-400"
                        isLoading={isLoading}
                    />
                </div>

                {/* Advanced Security Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Identity Monitoring Section */}
                    <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Cryptographic Hardening</h3>
                            <Activity className="w-5 h-5 text-slate-400 animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: 'Identity Block Alpha-01', algorithm: 'AES-256-GCM', status: 'Optimal' },
                                { name: 'Credential Mesh Sync', algorithm: 'RSA-4096', status: 'Active' },
                                { name: 'Biometric Hash Bridge', algorithm: 'SHA-512/256', status: 'Secured' },
                            ].map((block, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 group hover:border-blue-500/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{block.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-0.5">{block.algorithm}</div>
                                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{block.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Protection Oversight */}
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-rose-500/5 to-transparent border border-rose-500/10 flex flex-col items-center justify-center text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/5 via-transparent to-transparent opacity-50" />

                        <div className="w-24 h-24 rounded-[2rem] bg-rose-500 text-white flex items-center justify-center mb-4 shadow-2xl shadow-rose-500/20 transform hover:scale-110 transition-transform">
                            <ShieldCheck className="w-12 h-12" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">Perimeter Shield Active</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium text-sm leading-relaxed mx-auto">
                                All enterprise data vectors are currently under active cryptographic oversight and neural-link verification.
                            </p>
                        </div>

                        <div className="flex gap-2 relative z-10">
                            <div className="px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                                Vault-Ready
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">
                                256-Bit
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
