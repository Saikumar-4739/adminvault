'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditLogService } from '@/lib/api/services';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
    Activity, Search, Calendar, User,
    Database, Download, RefreshCw, Clock,
    Info
} from 'lucide-react';
import { AuditLogModel } from '@adminvault/shared-models';
import { format } from 'date-fns';

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterEntity, setFilterEntity] = useState('ALL');

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const response = await auditLogService.getAllLogs();
            if (response.status && response.data) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                log.actionUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesAction = filterAction === 'ALL' || log.action === filterAction;
            const matchesEntity = filterEntity === 'ALL' || log.entityType === filterEntity;

            return matchesSearch && matchesAction && matchesEntity;
        });
    }, [logs, searchTerm, filterAction, filterEntity]);

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'UPDATE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'DELETE': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'ASSIGN': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getEntityIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'ASSET': return <Database className="w-4 h-4" />;
            case 'TICKET': return <Activity className="w-4 h-4" />;
            case 'EMPLOYEE': return <User className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/50 space-y-6">
            <PageHeader
                title="Audit Log"
                description="Comprehensive trail of all system activities and security events"
                icon={<Activity />}
                gradient="from-indigo-500 to-blue-600"
                actions={[
                    {
                        label: 'Export CSV',
                        variant: 'outline',
                        icon: <Download className="w-4 h-4" />,
                        onClick: () => { /* TODO: Implement CSV export */ }
                    },
                    {
                        label: 'Refresh',
                        variant: 'primary',
                        icon: <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />,
                        onClick: fetchLogs
                    }
                ]}
            />

            {/* Filters Bar */}
            <Card className="p-3 border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Search user or entity..."
                            className="pl-8 h-8 text-[11px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="h-8 text-[11px]"
                        options={[
                            { label: 'All Actions', value: 'ALL' },
                            { label: 'Create', value: 'CREATE' },
                            { label: 'Update', value: 'UPDATE' },
                            { label: 'Delete', value: 'DELETE' },
                            { label: 'Assign', value: 'ASSIGN' },
                        ]}
                    />
                    <Select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="h-8 text-[11px]"
                        options={[
                            { label: 'All Entities', value: 'ALL' },
                            { label: 'Assets', value: 'ASSET' },
                            { label: 'Tickets', value: 'TICKET' },
                            { label: 'Employees', value: 'EMPLOYEE' },
                            { label: 'Licenses', value: 'LICENSE' },
                        ]}
                    />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        Showing {filteredLogs.length} events
                    </div>
                </div>
            </Card>

            {/* Timeline View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log, idx) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="group p-3 hover:border-blue-500/50 transition-all cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 max-w-5xl mx-auto">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`p-2 rounded-xl border ${getActionColor(log.action)} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                            {getEntityIcon(log.entityType)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <span className="text-slate-400 text-xs">•</span>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {log.actionUserName}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                                                Performed <span className="text-blue-500 dark:text-blue-400 font-bold">{log.action}</span> on {log.entityType} <span className="text-slate-900 dark:text-white font-bold">"{log.entityName}"</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(log.createdAt), 'MMM dd, yyyy • HH:mm')}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 tracking-tighter">
                                        IP: {log.ipAddress || 'Internal System'}
                                    </div>
                                </div>

                                {log.details && Object.keys(log.details).length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 overflow-hidden">
                                        <code className="text-[10px] block p-3 rounded-lg bg-slate-50 dark:bg-black/20 text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap">
                                            {JSON.stringify(log.details, null, 2)}
                                        </code>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!isLoading && filteredLogs.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Activity className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No activity found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                        <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterAction('ALL'); setFilterEntity('ALL'); }}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
