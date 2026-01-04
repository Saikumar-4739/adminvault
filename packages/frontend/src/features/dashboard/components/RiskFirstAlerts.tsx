'use client';

import React from 'react';
import { AlertCircle, ShieldAlert, WifiOff, UserX, ChevronRight, X } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    timestamp: string;
    icon: React.ElementType;
}

export default function RiskFirstAlerts() {
    const alerts: Alert[] = [
        {
            id: '1',
            type: 'critical',
            title: 'Multiple Failed Logins',
            description: '12 failed login attempts detected from IP 103.45.21.9 in the last 15 minutes.',
            timestamp: '5 mins ago',
            icon: ShieldAlert
        },
        {
            id: '2',
            type: 'critical',
            title: 'Device Compliance Failure',
            description: '3 executive laptops are reporting outdated security patches (CVE-2023-44487).',
            timestamp: '12 mins ago',
            icon: WifiOff
        },
        {
            id: '3',
            type: 'warning',
            title: 'Unauthorized Access Attempt',
            description: 'User "john_doe" attempted to access "Finance_Reports" without proper permissions.',
            timestamp: '45 mins ago',
            icon: UserX
        }
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Critical Risk Feed</h2>
                </div>
                <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                ))}
            </div>
        </div>
    );
}

function AlertCard({ alert }: { alert: Alert }) {
    const styles = {
        critical: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400',
        warning: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400',
        info: 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400'
    };

    const Icon = alert.icon;

    return (
        <Card className={`group relative p-3 border ${styles[alert.type]} shadow-sm transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden`}>
            {/* Animated background glow for critical alerts */}
            {alert.type === 'critical' && (
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 blur-2xl rounded-full group-hover:bg-rose-500/20 transition-all" />
            )}

            <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${alert.type === 'critical' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} shrink-0`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-black truncate pr-4">{alert.title}</h4>
                        <span className="text-[9px] font-medium opacity-60 whitespace-nowrap">{alert.timestamp}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed opacity-80 line-clamp-2 mb-2 italic">
                        "{alert.description}"
                    </p>
                    <div className="flex items-center justify-between">
                        <button className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider group/btn">
                            Investigate
                            <ChevronRight className="h-2.5 w-2.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded text-slate-400">
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
