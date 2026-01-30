'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAuditLogs } from '@adminvault/shared-services';
import { AuditLogModel, UserRoleEnum } from '@adminvault/shared-models';
import { format } from 'date-fns';
import { FileText, Search, RefreshCw, Filter, ShieldAlert, Activity, Layers, Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = useCallback(() => {
        setLoading(true);
        getAuditLogs()
            .then(setLogs)
            .catch((err) => console.error('Failed to fetch logs', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = {
        total: logs.length,
        critical: logs.filter(l => l.action === 'DELETE' || l.module === 'Security').length,
        modules: new Set(logs.map(l => l.module)).size,
        systemOps: logs.filter(l => l.action === 'CREATE' || l.action === 'UPDATE').length
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
                {/* Standardized Header */}
                <div className="p-4 space-y-4">
                    <PageHeader
                        title="Audit Logs"
                        description="Track and monitor system activities and security events"
                        icon={<FileText />}
                        gradient="from-blue-600 to-cyan-600"
                        actions={[
                            {
                                label: 'Refresh',
                                onClick: fetchLogs,
                                icon: <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />,
                                variant: 'outline'
                            }
                        ]}
                    />

                    {/* Vitals Feed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Events"
                            value={stats.total}
                            icon={Layers}
                            gradient="from-blue-500 to-indigo-600"
                            iconBg="bg-blue-50 dark:bg-blue-900/20"
                            iconColor="text-blue-600 dark:text-blue-400"
                            isLoading={loading}
                        />
                        <StatCard
                            title="Security Alerts"
                            value={stats.critical}
                            icon={ShieldAlert}
                            gradient="from-rose-500 to-red-600"
                            iconBg="bg-rose-50 dark:bg-rose-900/20"
                            iconColor="text-rose-600 dark:text-rose-400"
                            isLoading={loading}
                        />
                        <StatCard
                            title="Active Modules"
                            value={stats.modules}
                            icon={Zap}
                            gradient="from-amber-500 to-orange-600"
                            iconBg="bg-amber-50 dark:bg-amber-900/20"
                            iconColor="text-amber-600 dark:text-amber-400"
                            isLoading={loading}
                        />
                        <StatCard
                            title="System Operations"
                            value={stats.systemOps}
                            icon={Activity}
                            gradient="from-emerald-500 to-teal-600"
                            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                            iconColor="text-emerald-600 dark:text-emerald-400"
                            isLoading={loading}
                        />
                    </div>
                </div>

                {/* Toolbar */}
                <div className="max-w-[1920px] mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search logs by action, module, user or details..."
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-sm">
                                <Filter className="h-4 w-4" />
                                <span>Filter Protocol</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[120px]">Action</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[150px]">Module</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[200px]">Identity</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[250px]">Data Flow</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Observation</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-[180px]">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black tracking-widest border shadow-sm ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                            log.action === 'DELETE' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                                                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 group-hover:text-blue-500 transition-colors">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">{log.module}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 shadow-inner">
                                                            {(log.performedBy || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-slate-600 dark:text-slate-300 text-xs font-bold truncate max-w-[150px]" title={log.performedBy}>
                                                            {log.performedBy || 'System Protocol'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {log.requestPayload ? (
                                                        <div className="relative group/pre">
                                                            <pre className="text-[10px] bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden max-w-[250px] max-h-[80px] font-mono text-slate-500 dark:text-slate-400 group-hover/pre:max-h-[300px] transition-all duration-300">
                                                                {JSON.stringify(log.requestPayload, null, 2)}
                                                            </pre>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-600 text-[10px] font-black tracking-widest italic opacity-50">NULL_PAYLOAD</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-md line-clamp-2 italic" title={log.details || ''}>
                                                        {log.details || 'No telemetric details provided'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider tabular-nums">
                                                        {format(new Date(log.timestamp), 'PP')}
                                                        <br />
                                                        <span className="opacity-50">{format(new Date(log.timestamp), 'p')}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center animate-pulse">
                                                        <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs">No Pulse Detected</p>
                                                        <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold mt-1 uppercase">Adjust filters to re-establish intelligence link</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
