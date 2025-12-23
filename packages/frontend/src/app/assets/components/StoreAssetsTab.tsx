'use client';

import { useEffect } from 'react';
import { useAssetTabs } from '@/hooks/useAssetTabs';
import { PageLoader } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';
import { AssetStatusEnum } from '@adminvault/shared-models';

export default function StoreAssetsTab() {
    const { storeAssets, fetchStoreAssets, isLoading } = useAssetTabs();

    useEffect(() => {
        fetchStoreAssets();
    }, [fetchStoreAssets]);

    const getStatusBadge = (status: AssetStatusEnum) => {
        const styles = {
            [AssetStatusEnum.AVAILABLE]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            [AssetStatusEnum.MAINTENANCE]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            [AssetStatusEnum.IN_USE]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            [AssetStatusEnum.RETIRED]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        };
        return styles[status] || styles[AssetStatusEnum.AVAILABLE];
    };

    if (isLoading) return <PageLoader />;

    if (storeAssets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-6 mb-4">
                    <Package className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Assets in Storage</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    All assets are currently assigned or there are no assets available in storage.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Laptop/Device</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Configuration</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Service Tag</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Express Code</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Box No</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Past User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Present User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {storeAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{asset.deviceName}</span>
                                    {asset.brandName && <span className="text-xs text-slate-500">{asset.brandName} {asset.model}</span>}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{asset.configuration || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{asset.serialNumber}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{asset.expressCode || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{asset.boxNo || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{asset.pastUserName || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{asset.presentUserName || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(asset.assetStatusEnum)}`}>
                                    {asset.assetStatusEnum}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
