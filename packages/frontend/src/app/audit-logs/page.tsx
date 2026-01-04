'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ShieldAlert, Search, Download, Filter, Clock, User, Activity, Globe } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

// Mock Data for Audit Logs
import { useAuditLogs } from '@/hooks/useAuditLogs';

export default function AuditLogsPage() {
    const { logs, isLoading, refresh } = useAuditLogs();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredLogs = logs.filter(log => {
        const userName = log.user ? (log.user.fullName || log.user.email) : 'System';
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || log.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'success';
            case 'FAILURE': return 'error';
            case 'WARNING': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            Audit & Security Logs
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Monitor system activity, security events, and user actions.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
                            Filter
                        </Button>
                        <Button variant="outline" onClick={refresh} leftIcon={<Clock className="h-4 w-4" />}>
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Mobile Search (visible only on small screens) */}
                <div className="md:hidden relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Logs Table Card */}
                <Card className="border-none shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-3.5 w-3.5" /> Action
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5" /> User / Role
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-3.5 w-3.5" /> IP & Resource
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5" /> Timestamp
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                                        </tr>
                                    ))
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">{log.action.replace('_', ' ')}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {log.user ? (log.user.fullName || log.user.email) : 'System'}
                                                    </span>
                                                    <span className="text-[10px] uppercase text-slate-400">
                                                        {log.user ? log.user.userRole : 'SYSTEM'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{log.details}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 w-fit">{log.ipAddress || '-'}</code>
                                                    <span className="text-xs text-slate-500">{log.resource}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge variant={getStatusColor(log.status)} className="text-[10px]">
                                                    {log.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                                            <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                            <p>No audit logs found matching your search.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </RouteGuard>
    );
};

export default AuditLogsPage;
