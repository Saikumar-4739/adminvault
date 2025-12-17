'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetService } from '@/lib/api/services';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

interface Asset {
    id: number;
    assetName: string;
    assetType?: string;
    serialNumber?: string;
    companyId: number;
    deviceId?: number;
    status?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    createdAt?: string;
}

export function useAssets(companyId?: number) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchAssets = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await assetService.getAllAssets(companyId);

            if (response.status) {
                const data = (response as any).assets || response.data || [];
                const mappedAssets: Asset[] = data.map((item: any) => ({
                    id: item.id,
                    assetName: item.deviceName || `Asset ${item.serialNumber}`,
                    assetType: item.deviceType || 'Unknown',
                    serialNumber: item.serialNumber,
                    companyId: item.companyId,
                    deviceId: item.deviceId,
                    status: item.assetStatusEnum || item.status,
                    purchaseDate: item.purchaseDate,
                    warrantyExpiry: item.warrantyExpiry,
                    createdAt: item.createdAt || item.created_at
                }));
                setAssets(mappedAssets);
            } else {
                throw new Error(response.message || 'Failed to fetch assets');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch assets';
            setError(errorMessage);
            // toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, toast]);

    const createAsset = useCallback(
        async (data: CreateAssetModel) => {
            try {
                setIsLoading(true);
                const response = await assetService.createAsset(data);

                if (response.status) {
                    await fetchAssets();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to create asset');
                }
            } catch (err: any) {
                // toast.error('Error', err.message || 'Failed to create asset');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchAssets]
    );

    const updateAsset = useCallback(
        async (data: UpdateAssetModel) => {
            try {
                setIsLoading(true);
                const response = await assetService.updateAsset(data);

                if (response.status) {
                    await fetchAssets();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to update asset');
                }
            } catch (err: any) {
                // toast.error('Error', err.message || 'Failed to update asset');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchAssets]
    );

    const deleteAsset = useCallback(
        async (data: DeleteAssetModel) => {
            try {
                setIsLoading(true);
                const response = await assetService.deleteAsset(data);

                if (response.status) {
                    await fetchAssets();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete asset');
                }
            } catch (err: any) {
                // toast.error('Error', err.message || 'Failed to delete asset');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchAssets]
    );

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    return {
        assets,
        isLoading,
        error,
        fetchAssets,
        createAsset,
        updateAsset,
        deleteAsset,
    };
}
