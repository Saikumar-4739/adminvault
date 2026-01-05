'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetService } from '@/lib/api/services';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, AssetSearchRequestModel } from '@adminvault/shared-models';

interface Asset {
    id: number;
    assetName: string;
    assetType?: string;
    serialNumber?: string;
    companyId: number;
    deviceId?: number;
    brandId?: number;
    model?: string;
    configuration?: string;
    status?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    createdAt?: string;
    assignedTo?: string;
    assignedDate?: string;
    userAssignedDate?: string;
    lastReturnDate?: string;
    assignedToEmployeeId?: number;
    previousUserEmployeeId?: number;
}

interface AssetStatistics {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    retired: number;
}

// Simple global cache for SWR-like behavior
const assetsCache: Record<string, Asset[]> = {};
const statsCache: Record<string, AssetStatistics> = {};

export function useAssets(companyId?: number) {
    const cacheKey = `assets_${companyId || 'all'}`;
    const [assets, setAssets] = useState<Asset[]>(assetsCache[cacheKey] || []);
    const [statistics, setStatistics] = useState<AssetStatistics | null>(statsCache[cacheKey] || null);
    const [isLoading, setIsLoading] = useState(!assetsCache[cacheKey]);
    const [error, setError] = useState<string | null>(null);

    const fetchAssets = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await assetService.getAllAssets(companyId as number);

            if (response.status) {
                const data = (response as any).assets || response.data || [];
                const mappedAssets: Asset[] = data.map((item: any) => ({
                    id: item.id,
                    assetName: item.deviceName || `Asset ${item.serialNumber}`,
                    assetType: item.deviceType || 'Unknown',
                    serialNumber: item.serialNumber,
                    companyId: item.companyId,
                    deviceId: item.deviceId,
                    brandId: item.brandId,
                    model: item.model,
                    configuration: item.configuration,
                    status: (item.assetStatusEnum || item.status || 'available').toString().toLowerCase(),
                    purchaseDate: item.purchaseDate,
                    warrantyExpiry: item.warrantyExpiry,
                    userAssignedDate: item.userAssignedDate,
                    lastReturnDate: item.lastReturnDate,
                    assignedToEmployeeId: item.assignedToEmployeeId,
                    previousUserEmployeeId: item.previousUserEmployeeId,
                    createdAt: item.createdAt || item.created_at
                }));
                assetsCache[cacheKey] = mappedAssets;
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
            const response = await assetService.getAssetsWithAssignments(companyId as number);

            if (response.status) {
                const data = (response as any).assets || [];
                const mappedAssets: Asset[] = data.map((item: any) => ({
                    id: item.id,
                    assetName: item.deviceName || `Asset ${item.serialNumber}`,
                    assetType: item.deviceType || 'Unknown',
                    serialNumber: item.serialNumber,
                    companyId: item.companyId,
                    deviceId: item.deviceId,
                    brandId: item.brandId,
                    model: item.model,
                    configuration: item.configuration,
                    status: (item.assetStatusEnum || item.status || 'available').toString().toLowerCase(),
                    purchaseDate: item.purchaseDate,
                    warrantyExpiry: item.warrantyExpiry,
                    createdAt: item.createdAt || item.created_at,
                    assignedTo: item.assignedTo,
                    assignedDate: item.assignedDate,
                    userAssignedDate: item.userAssignedDate,
                    lastReturnDate: item.lastReturnDate,
                    assignedToEmployeeId: item.assignedToEmployeeId,
                    previousUserEmployeeId: item.previousUserEmployeeId
                }));
                assetsCache[cacheKey] = mappedAssets;
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
                statsCache[cacheKey] = response.statistics;
                setStatistics(response.statistics);
            }
        } catch (err: any) {
            // Statistics are optional - don't break the page if they fail
            console.warn('Failed to fetch statistics:', err.message);
            // Will be calculated after assets are fetched
        }
    }, [companyId]);

    const searchAssets = useCallback(async (filters: Partial<AssetSearchRequestModel>) => {
        if (!companyId) return;
        try {
            setIsLoading(true);
            const request = new AssetSearchRequestModel(
                companyId,
                filters.searchQuery,
                filters.statusFilter as any, // Cast if needed due to single vs array
                filters.brandIds,
                filters.assetTypeIds,
                filters.employeeId,
                filters.purchaseDateFrom,
                filters.purchaseDateTo
            );
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
                    brandId: item.brandId,
                    model: item.model,
                    configuration: item.configuration,
                    status: (item.assetStatusEnum || item.status || 'available').toString().toLowerCase(),
                    purchaseDate: item.purchaseDate,
                    warrantyExpiry: item.warrantyExpiry,
                    createdAt: item.createdAt || item.created_at,
                    assignedTo: item.assignedTo,
                    assignedDate: item.assignedDate,
                    userAssignedDate: item.userAssignedDate,
                    lastReturnDate: item.lastReturnDate,
                    assignedToEmployeeId: item.assignedToEmployeeId,
                    previousUserEmployeeId: item.previousUserEmployeeId
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
                    return { success: true, message: response.message || 'Asset created successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to create asset' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to create asset' };
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
                    return { success: true, message: response.message || 'Asset updated successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to update asset' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to update asset' };
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
                    return { success: true, message: response.message || 'Asset deleted successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to delete asset' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to delete asset' };
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

    const refresh = useCallback(() => {
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
        refresh
    };
}
