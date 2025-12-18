'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetService } from '@/lib/api/services';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, AssetSearchRequestModel, AssetStatusEnum } from '@adminvault/shared-models';
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
    assignedTo?: string;
    assignedDate?: string;
}

interface AssetStatistics {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    retired: number;
}

export function useAssets(companyId?: number) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
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
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    const fetchAssetsWithAssignments = useCallback(async () => {
        if (!companyId) return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await assetService.getAssetsWithAssignments(companyId);

            if (response.status) {
                const data = (response as any).assets || [];
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
                    createdAt: item.createdAt || item.created_at,
                    assignedTo: item.assignedTo,
                    assignedDate: item.assignedDate
                }));
                setAssets(mappedAssets);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch assets with assignments');
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    const fetchStatistics = useCallback(async () => {
        if (!companyId) return;
        try {
            const response = await assetService.getAssetStatistics(companyId);
            if (response.status) {
                setStatistics(response.statistics);
            }
        } catch (err: any) {
            // Statistics are optional - don't break the page if they fail
            console.warn('Failed to fetch statistics:', err.message);
            // Will be calculated after assets are fetched
        }
    }, [companyId]);

    const searchAssets = useCallback(async (searchQuery?: string, statusFilter?: AssetStatusEnum) => {
        if (!companyId) return;
        try {
            setIsLoading(true);
            const request = new AssetSearchRequestModel(companyId, searchQuery, statusFilter);
            const response = await assetService.searchAssets(request);

            if (response.status) {
                const data = (response as any).assets || [];
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
            }
        } catch (err: any) {
            setError(err.message || 'Failed to search assets');
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    const createAsset = useCallback(
        async (data: CreateAssetModel) => {
            try {
                setIsLoading(true);
                const response = await assetService.createAsset(data);

                if (response.status) {
                    await fetchAssetsWithAssignments();
                    await fetchStatistics();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to create asset');
                }
            } catch (err: any) {
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchAssetsWithAssignments, fetchStatistics]
    );

    const updateAsset = useCallback(
        async (data: UpdateAssetModel) => {
            try {
                setIsLoading(true);
                const response = await assetService.updateAsset(data);

                if (response.status) {
                    await fetchAssetsWithAssignments();
                    await fetchStatistics();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to update asset');
                }
            } catch (err: any) {
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchAssetsWithAssignments, fetchStatistics]
    );

    const deleteAsset = useCallback(
        async (data: DeleteAssetModel) => {
            try {
                setIsLoading(true);
                const response = await assetService.deleteAsset(data);

                if (response.status) {
                    await fetchAssetsWithAssignments();
                    await fetchStatistics();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete asset');
                }
            } catch (err: any) {
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchAssetsWithAssignments, fetchStatistics]
    );

    useEffect(() => {
        if (companyId) {
            fetchAssetsWithAssignments();
            fetchStatistics();
        }
    }, [companyId, fetchAssetsWithAssignments, fetchStatistics]);

    return {
        assets,
        statistics,
        isLoading,
        error,
        fetchAssets,
        fetchAssetsWithAssignments,
        fetchStatistics,
        searchAssets,
        createAsset,
        updateAsset,
        deleteAsset,
    };
}
