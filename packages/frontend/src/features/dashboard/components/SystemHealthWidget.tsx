'use client';

import { Activity, Server, Database, Cloud } from 'lucide-react';
import Card from '@/components/ui/Card';
import { DashboardStats } from '@/hooks/useDashboard';

interface SystemHealthWidgetProps {
    stats: DashboardStats | null;
}

export default function SystemHealthWidget({ stats }: SystemHealthWidgetProps) {
    const health = stats?.systemHealth || {
        assetUtilization: 0,
        ticketResolutionRate: 0,
        openCriticalTickets: 0
    };

    return (
        <Card className="p-4 border-none shadow-md h-full">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                System Health
            </h3>
            <div className="space-y-4">
                {/* Asset Utilization */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Server className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Asset Utilization</p>
                            <p className={`text-[10px] font-medium ${health.assetUtilization > 80 ? 'text-emerald-500' : 'text-slate-500'}`}>
                                {health.assetUtilization}% In Use
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className={`w-1.5 h-6 rounded-full ${health.assetUtilization > 25 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-6 rounded-full ${health.assetUtilization > 50 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-6 rounded-full ${health.assetUtilization > 75 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    </div>
                </div>

                {/* Ticket Resolution */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Database className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Resolution Rate</p>
                            <p className={`text-[10px] font-medium ${health.ticketResolutionRate > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {health.ticketResolutionRate}% Resolved
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className={`w-1.5 h-6 rounded-full ${health.ticketResolutionRate > 33 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-6 rounded-full ${health.ticketResolutionRate > 66 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-6 rounded-full ${health.ticketResolutionRate > 90 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    </div>
                </div>

                {/* Critical Issues */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Cloud className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Critical Issues</p>
                            <p className={`text-[10px] font-medium ${health.openCriticalTickets === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {health.openCriticalTickets} Open Critical Tickets
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className={`w-1.5 h-6 rounded-full ${health.openCriticalTickets > 0 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-6 rounded-full ${health.openCriticalTickets > 2 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div className={`w-1.5 h-6 rounded-full ${health.openCriticalTickets > 5 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
