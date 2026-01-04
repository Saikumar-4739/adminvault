'use client';

import { Calendar, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { DashboardStats } from '@adminvault/shared-models';
import Link from 'next/link';

interface RenewalsWidgetProps {
    stats: DashboardStats | null;
}

export default function RenewalsWidget({ stats }: RenewalsWidgetProps) {
    const renewals = stats?.licenses.expiringSoon || [];

    const calculateDaysRemaining = (expiryDate: Date | string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatDaysRemaining = (days: number) => {
        if (days < 0) return `Expired ${Math.abs(days)} days ago`;
        if (days === 0) return 'Expires today';
        if (days === 1) return 'Expires tomorrow';
        if (days < 30) return `Expires in ${days} days`;
        return `Expires in ${Math.round(days / 30)} months`;
    };

    return (
        <Card className="p-4 border-none shadow-md h-full flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Upcoming Renewals
            </h3>
            <div className="space-y-3 flex-1">
                {renewals.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full inline-block mb-3">
                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming renewals found</p>
                    </div>
                ) : (
                    renewals.map((item, idx) => {
                        const days = calculateDaysRemaining(item.expiryDate);
                        const isUrgent = days <= 7;

                        return (
                            <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${isUrgent
                                ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20'
                                : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                                }`}>
                                <div className={`p-1.5 rounded-md shrink-0 ${isUrgent
                                    ? 'bg-rose-100 dark:bg-rose-900/30'
                                    : 'bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                    {isUrgent ? (
                                        <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                    ) : (
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.applicationName}</p>
                                    <p className={`text-[10px] font-medium ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                                        }`}>
                                        {formatDaysRemaining(days)} • {item.assignedTo}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link href="/licenses">
                    <Button variant="ghost" size="sm" className="w-full text-xs" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        View All Licenses
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
