'use client';

import { useEffect } from 'react';
import { useAssetTabs } from '@/hooks/useAssetTabs';
import { PageLoader } from '@/components/ui/Spinner';
import { RotateCcw, User, Calendar, Monitor, Cpu } from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';

interface ReturnAssetsTabProps {
    companyId: number;
}

export default function ReturnAssetsTab({ companyId }: ReturnAssetsTabProps) {
    const { returnAssets, fetchReturnAssets, isLoading } = useAssetTabs();

    useEffect(() => {
        fetchReturnAssets();
    }, [fetchReturnAssets]);

    if (isLoading) return <PageLoader />;

    if (returnAssets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-6 mb-4">
                    <RotateCcw className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Return History</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    There are no asset returns recorded yet.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
            {returnAssets.map((record: any) => (
                <Card key={record.id} className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{record.employeeName}</h4>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{record.employeeRole || 'Employee'}</p>
                            </div>
                        </div>

                        {/* Status Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {record.laptopAllocationStatus && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[9px] font-black uppercase border border-emerald-200/50">
                                    Laptop: {record.laptopAllocationStatus}
                                </span>
                            )}
                            {record.desktopAllocationStatus && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-[9px] font-black uppercase border border-blue-200/50">
                                    Desktop: {record.desktopAllocationStatus}
                                </span>
                            )}
                        </div>

                        {/* Config */}
                        {record.configuration && (
                            <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Cpu className="h-3 w-3 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Config</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{record.configuration}</p>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Allocated</span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                        {record.allocationDate ? new Date(record.allocationDate).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Returned</span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                                        {new Date(record.returnDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
