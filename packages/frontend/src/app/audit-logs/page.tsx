'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { auditLogService } from '@/lib/api/services';
import { AuditLogModel } from '@adminvault/shared-models';
import {
    Search,
    Filter,
    User,
    Activity,
    Shield,
    RefreshCcw,
    FileText,
    Globe,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';

export default function AuditLogsPage() {
    const { isDarkMode } = useTheme();
    const [logs, setLogs] = useState<AuditLogModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState('all');

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await auditLogService.getAllLogs();
            if (response.status) {
                setLogs(response.data || []);
            } else {
                AlertMessages.getErrorMessage('Failed to fetch audit logs');
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            AlertMessages.getErrorMessage('An error occurred while fetching logs');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actionUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesModule = selectedModule === 'all' || log.module === selectedModule;

        return matchesSearch && matchesModule;
    });

    const modules = Array.from(new Set(logs.map(log => log.module).filter(Boolean)));

    const getActionColor = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('add')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (a.includes('delete') || a.includes('remove')) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        if (a.includes('update') || a.includes('edit')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (a.includes('login')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Audit Logs
                    </h1>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Monitor and track all system activities for security and compliance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchLogs}
                        disabled={isLoading}
                        className={`rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Activities', value: logs.length, icon: Activity, color: 'blue' },
                    { label: 'System Modules', value: modules.length, icon: Shield, color: 'indigo' },
                    { label: 'Active Users', value: new Set(logs.map(l => l.actionUserId)).size, icon: User, color: 'emerald' }
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                                <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="relative flex-1 group">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isDarkMode ? 'text-slate-600 group-focus-within:text-blue-500' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="Search logs by action, user, or module..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${isDarkMode
                            ? 'bg-slate-800/50 border border-slate-700 text-white focus:border-blue-500'
                            : 'bg-slate-50 border border-slate-200 focus:border-blue-500'}`}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className={`pl-10 pr-8 py-2 rounded-xl text-sm appearance-none outline-none transition-all cursor-pointer ${isDarkMode
                                ? 'bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800'
                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}
                        >
                            <option value="all">All Modules</option>
                            {modules.map(mod => (
                                <option key={mod} value={mod || ''}>{mod}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/50'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Activity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Module</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Security</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="h-10 bg-slate-800/20 rounded-lg"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className={`group hover:bg-slate-800/20 transition-colors ${isDarkMode ? '' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-[10px] ${getActionColor(log.action || '')}`}>
                                                    {log.action?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'} transition-colors`}>
                                                        {log.action}
                                                    </p>
                                                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {log.entityType}: {log.entityName || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                    <User className="h-3 w-3 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.actionUserName}</p>
                                                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{log.actionUserEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                <Shield className="h-3 w-3" />
                                                {log.module || 'Global'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {log.createdAt ? new Date(log.createdAt).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-slate-500">
                                                <Globe className="h-3 w-3" />
                                                {log.ipAddress || '0.0.0.0'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <FileText className={`h-10 w-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No activity logs found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
