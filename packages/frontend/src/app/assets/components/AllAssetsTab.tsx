'use client';

import { useAssets } from '@/hooks/useAssets';
import { PageLoader } from '@/components/ui/Spinner';
import { Package, Pencil, Trash2, Printer } from 'lucide-react';

interface AllAssetsTabProps {
    companyId: number;
    onEdit: (asset: any) => void;
    onDelete: (asset: any) => void;
    onPrint: (asset: any) => void;
}

export default function AllAssetsTab({ companyId, onEdit, onDelete, onPrint }: AllAssetsTabProps) {
    const { assets, isLoading } = useAssets(companyId);

    const getStatusBadge = (status?: string) => {
        const statusUpper = status?.toUpperCase() || 'AVAILABLE';
        const styles: Record<string, string> = {
            'AVAILABLE': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            'IN_USE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'INUSE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'MAINTENANCE': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'RETIRED': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        };
        return styles[statusUpper] || styles['AVAILABLE'];
    };

    if (isLoading) return <PageLoader />;

    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-6 mb-4">
                    <Package className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Assets Found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    No assets are currently registered in the system.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Asset Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Serial Number</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Configuration</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Assigned To</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Purchase Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Warranty</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {assets.map((asset) => {
                        const warrantyExpired = asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date();
                        const warrantyExpiring = asset.warrantyExpiry && !warrantyExpired &&
                            Math.ceil((new Date(asset.warrantyExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 30;

                        return (
                            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{asset.assetName}</span>
                                        <span className="text-xs text-slate-500">{asset.assetType}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{asset.serialNumber}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{asset.configuration || '-'}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{asset.assignedTo || 'Unassigned'}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(asset.status)}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className={`text-sm ${warrantyExpired ? 'text-rose-600 dark:text-rose-400 font-semibold' :
                                            warrantyExpiring ? 'text-amber-600 dark:text-amber-400 font-semibold' :
                                                'text-slate-700 dark:text-slate-300'}`}>
                                            {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '-'}
                                        </span>
                                        {warrantyExpired && <span className="text-xs text-rose-600 dark:text-rose-400">Expired</span>}
                                        {warrantyExpiring && <span className="text-xs text-amber-600 dark:text-amber-400">Expiring Soon</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(asset)}
                                            className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onPrint(asset)}
                                            className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                            title="Print"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(asset)}
                                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
