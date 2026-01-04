'use client';

import { useEffect } from 'react';
import { useAssetTabs } from '@/hooks/useAssetTabs';
import { PageLoader } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';
import AssetCard from './AssetCard';

interface StoreAssetsTabProps {
    companyId: number;
    onEdit: (asset: any) => void;
    onDelete: (asset: any) => void;
    onPrint: (asset: any) => void;
    onHistory: (asset: any) => void;
}

export default function StoreAssetsTab({ companyId, onEdit, onDelete, onPrint, onHistory }: StoreAssetsTabProps) {
    const { storeAssets, fetchStoreAssets, isLoading } = useAssetTabs();

    useEffect(() => {
        fetchStoreAssets();
    }, [fetchStoreAssets]);

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

    // Map storeAssets to the format AssetCard expects
    const mappedAssets = storeAssets.map((asset: any) => ({
        ...asset,
        assetName: asset.deviceName,
        status: asset.assetStatusEnum || 'AVAILABLE'
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
            {mappedAssets.map((asset: any) => (
                <AssetCard
                    key={asset.id}
                    asset={asset}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onQRCode={onPrint}
                    onHistory={onHistory}
                />
            ))}
        </div>
    );
}
