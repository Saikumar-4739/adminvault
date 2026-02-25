'use client';

import { Spinner } from '@/components/ui/Spinner';
import { Package } from 'lucide-react';
import { AssetCard } from './AssetCard';

interface AllAssetsTabProps {
    assets: any[];
    isLoading: boolean;
    status?: string;
    onEdit: (asset: any) => void;
    onDelete: (asset: any) => void;
    onPrint: (asset: any) => void;
    onHistory: (asset: any) => void;
    onAssign: (asset: any) => void;
    selectedIds?: Set<number>;
    onToggleSelect?: (id: number) => void;
}



export const AllAssetsTab: React.FC<AllAssetsTabProps> = ({
    assets, isLoading, status, onEdit, onDelete, onPrint, onHistory, onAssign,
    selectedIds, onToggleSelect
}: AllAssetsTabProps) => {

    console.log(`AllAssetsTab[${status}] received ${assets?.length} assets`);

    const filteredAssets = status
        ? assets.filter(a => {
            const assetStatus = (a.status || '').toString().toLowerCase();
            const targetStatus = status.toLowerCase();
            const match = assetStatus === targetStatus ||
                (targetStatus === 'available' && assetStatus === 'available') ||
                (targetStatus === 'in_use' && (assetStatus === 'in_use' || assetStatus === 'inuse')) ||
                (targetStatus === 'maintenance' && assetStatus === 'maintenance') ||
                (targetStatus === 'retired' && assetStatus === 'retired');

            // console.log(`Filter [${status}]: asset=${a.assetName} status=${assetStatus} match=${match}`);
            return match;
        })
        : assets;

    console.log(`AllAssetsTab[${status}] showing ${filteredAssets.length} assets`);

    if (isLoading) return (
        <div className="flex justify-center py-10">
            <Spinner size="lg" />
        </div>
    );

    if (filteredAssets.length === 0) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
            {filteredAssets.map((asset) => (
                <AssetCard
                    key={asset.id}
                    asset={asset}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onQRCode={onPrint}
                    onHistory={onHistory}
                    onAssign={onAssign}
                    isSelected={selectedIds?.has(asset.id)}
                    onToggleSelect={onToggleSelect}
                />
            ))}
        </div>
    );
}
