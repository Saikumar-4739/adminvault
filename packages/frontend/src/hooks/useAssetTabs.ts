'use client';

import { useState, useCallback } from 'react';
import { assetTabsService } from '@/lib/api/services';
import {
    StoreAssetModel, ReturnAssetModel, NextAssignmentModel,
    ProcessReturnRequestModel, CreateNextAssignmentRequestModel,
    AssignFromQueueRequestModel
} from '@adminvault/shared-models';

export function useAssetTabs() {
    const [storeAssets, setStoreAssets] = useState<StoreAssetModel[]>([]);
    const [returnAssets, setReturnAssets] = useState<ReturnAssetModel[]>([]);
    const [nextAssignments, setNextAssignments] = useState<NextAssignmentModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCompanyId = (): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId || 1;
    };

    const getUserId = (): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.id || 1;
    };

    // ============================================
    // STORE ASSETS TAB
    // ============================================
    const fetchStoreAssets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await assetTabsService.getStoreAssets(getCompanyId());
            if (response.status) {
                setStoreAssets(response.assets || []);
            }
        } catch (error) {
            console.error('Failed to fetch store assets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // RETURN ASSETS TAB
    // ============================================
    const fetchReturnAssets = useCallback(async (startDate?: string, endDate?: string, employeeId?: number) => {
        setIsLoading(true);
        try {
            const response = await assetTabsService.getReturnAssets(getCompanyId(), startDate, endDate, employeeId);
            if (response.status) {
                setReturnAssets(response.returns || []);
            }
        } catch (error) {
            console.error('Failed to fetch return assets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processReturn = async (data: ProcessReturnRequestModel) => {
        setIsLoading(true);
        try {
            const response = await assetTabsService.processReturn(data);
            if (response.status) {
                await fetchReturnAssets();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to process return:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // NEXT ASSIGN ASSETS TAB
    // ============================================
    const fetchNextAssignments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await assetTabsService.getNextAssignments(getCompanyId());
            if (response.status) {
                setNextAssignments(response.assignments || []);
            }
        } catch (error) {
            console.error('Failed to fetch next assignments:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createNextAssignment = async (data: CreateNextAssignmentRequestModel) => {
        setIsLoading(true);
        try {
            const response = await assetTabsService.createNextAssignment(data);
            if (response.status) {
                await fetchNextAssignments();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to create assignment:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const assignFromQueue = async (data: AssignFromQueueRequestModel) => {
        setIsLoading(true);
        try {
            const response = await assetTabsService.assignFromQueue(data);
            if (response.status) {
                await fetchNextAssignments();
                await fetchStoreAssets(); // Refresh store assets as one was assigned
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to assign from queue:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // Store Assets
        storeAssets,
        fetchStoreAssets,

        // Return Assets
        returnAssets,
        fetchReturnAssets,
        processReturn,

        // Next Assignments
        nextAssignments,
        fetchNextAssignments,
        createNextAssignment,
        assignFromQueue,

        // Common
        isLoading,
        getCompanyId,
        getUserId
    };
}
