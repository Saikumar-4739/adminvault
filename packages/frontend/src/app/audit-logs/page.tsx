'use client';

import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '@adminvault/shared-services';
import { AuditLogModel, UserRoleEnum } from '@adminvault/shared-models';
import { format } from 'date-fns';
import { FileText, Search, RefreshCw, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = () => {
        setLoading(true);
        getAuditLogs()
            .then(setLogs)
            .catch((err) => console.error('Failed to fetch logs', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
                    >
                        <div className="flex justify-end w-full">
                            <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
                                <span className="text-xs font-semibold text-slate-500 mr-2">Total Logs:</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{logs.length}</span>
                            </div>
                        </div>
                    </PageHeader>
                </div>

                {/* Toolbar */}
                <div className="max-w-[1920px] mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search logs by action, module, user or details..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">Action</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[150px]">Module</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">Performed By</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[250px]">Request Payload</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[180px]">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                            log.action === 'DELETE' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                                                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                                            <FileText className="h-3 w-3" />
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white text-sm">{log.module}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400">
                                                            {(log.performedBy || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-slate-600 dark:text-slate-300 text-sm truncate max-w-[150px]" title={log.performedBy}>
                                                            {log.performedBy || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.requestPayload ? (
                                                        <pre className="text-xs bg-slate-100 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-[250px] max-h-[100px] whitespace-pre-wrap font-mono text-slate-600 dark:text-slate-400">
                                                            {JSON.stringify(log.requestPayload, null, 2)}
                                                        </pre>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm max-w-md truncate" title={log.details || ''}>
                                                    {log.details || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-500 text-sm whitespace-nowrap">
                                                    {format(new Date(log.timestamp), 'PP p')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                                    <p>No audit logs found matching your search</p>
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
