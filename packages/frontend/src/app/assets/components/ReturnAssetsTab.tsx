'use client';

import { useEffect } from 'react';
import { useAssetTabs } from '@/hooks/useAssetTabs';
import { PageLoader } from '@/components/ui/Spinner';
import { RotateCcw } from 'lucide-react';

export default function ReturnAssetsTab() {
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
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Employee Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Laptop Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Desktop Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Configuration</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date of Allocation</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date of Return</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {returnAssets.map((returnRecord) => (
                        <tr key={returnRecord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{returnRecord.employeeName}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{returnRecord.employeeRole || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                {returnRecord.laptopAllocationStatus ? (
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        {returnRecord.laptopAllocationStatus}
                                    </span>
                                ) : (
                                    <span className="text-sm text-slate-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                {returnRecord.desktopAllocationStatus ? (
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        {returnRecord.desktopAllocationStatus}
                                    </span>
                                ) : (
                                    <span className="text-sm text-slate-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{returnRecord.configuration || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {returnRecord.allocationDate ? new Date(returnRecord.allocationDate).toLocaleDateString() : '-'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {new Date(returnRecord.returnDate).toLocaleDateString()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
