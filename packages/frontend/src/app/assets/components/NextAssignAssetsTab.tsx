'use client';

import { useEffect } from 'react';
import { useAssetTabs } from '@/hooks/useAssetTabs';
import { PageLoader } from '@/components/ui/Spinner';
import { ClipboardList } from 'lucide-react';
import { NextAssignmentStatus } from '@adminvault/shared-models';

export default function NextAssignAssetsTab() {
    const { nextAssignments, fetchNextAssignments, isLoading } = useAssetTabs();

    useEffect(() => {
        fetchNextAssignments();
    }, [fetchNextAssignments]);

    const getStatusBadge = (status: NextAssignmentStatus) => {
        const styles = {
            [NextAssignmentStatus.PENDING]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            [NextAssignmentStatus.ASSIGNED]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            [NextAssignmentStatus.CANCELLED]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        };
        return styles[status] || styles[NextAssignmentStatus.PENDING];
    };

    if (isLoading) return <PageLoader />;

    if (nextAssignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-6 mb-4">
                    <ClipboardList className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Pending Assignments</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    There are no pending asset assignment requests in the queue.
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
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">New Allocation</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {nextAssignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{assignment.employeeName}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{assignment.employeeRole || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                {assignment.laptopAllocationStatus ? (
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(assignment.laptopAllocationStatus)}`}>
                                        {assignment.laptopAllocationStatus}
                                    </span>
                                ) : (
                                    <span className="text-sm text-slate-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                {assignment.desktopAllocationStatus ? (
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(assignment.desktopAllocationStatus)}`}>
                                        {assignment.desktopAllocationStatus}
                                    </span>
                                ) : (
                                    <span className="text-sm text-slate-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                {assignment.assignedAssetName ? (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{assignment.assignedAssetName}</span>
                                        <span className="text-xs text-slate-500">Asset Type: {assignment.assetType}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending Assignment</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
