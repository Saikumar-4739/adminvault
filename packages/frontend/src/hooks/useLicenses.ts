
import { useState, useCallback, useEffect } from 'react';

// Define types locally for now, should ideally be in shared-models
export interface CompanyLicense {
    id: number;
    companyId: number;
    applicationId: number;

    expiryDate?: string;
    assignedDate?: string;
    remarks?: string;
    company?: {
        id: number;
        companyName: string;
    };
    application?: {
        id: number;
        name: string;
        logo?: string; // Potential future field
    };
    assignedEmployeeId?: number;
    assignedEmployee?: {
        id: number;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    createdAt: string;
}

export interface LicensesStats {
    totalLicenses: number;
    usedLicenses: number;
    totalCost: number;
    expiringSoon: number;
}

import { licensesService } from '@/lib/api/services';

export function useLicenses(companyId?: number) {
    const [licenses, setLicenses] = useState<CompanyLicense[]>([]);
    const [stats, setStats] = useState<LicensesStats>({ totalLicenses: 0, usedLicenses: 0, totalCost: 0, expiringSoon: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Licenses
    const fetchLicenses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            if (!companyId) return;
            const response = await licensesService.findAll(companyId);
            if (response.status) {
                setLicenses(response.data as any);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch licenses');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            if (!companyId) return;
            // Stats endpoint might not exist yet, commenting out for now
            // const response = await licensesService.findStats(companyId);
            // if (response.status) {
            //     setStats(response.data);
            // }
        } catch (err: any) {
            console.error('Failed to fetch stats', err);
        }
    }, [companyId]);

    const createLicense = async (data: any) => {
        try {
            const response = await licensesService.create(data);
            if (response.status) {
                fetchLicenses();
                fetchStats();
                return { success: true, message: response.message || 'License assigned successfully' };
            }
            return { success: false, message: response.message || 'Failed to assign license' };
        } catch (err: any) {
            return { success: false, message: err.response?.data?.message || err.message || 'Failed to assign license' };
        }
    };

    const updateLicense = async (id: number, data: any) => {
        try {
            const response = await licensesService.update({ ...data, id });
            if (response.status) {
                fetchLicenses();
                fetchStats();
                return { success: true, message: response.message || 'License updated successfully' };
            }
            return { success: false, message: response.message || 'Failed to update license' };
        } catch (err: any) {
            return { success: false, message: err.response?.data?.message || err.message || 'Failed to update license' };
        }
    };

    const deleteLicense = async (id: number) => {
        try {
            const response = await licensesService.remove({ id });
            if (response.status) {
                fetchLicenses();
                fetchStats();
                return { success: true, message: response.message || 'License removed successfully' };
            }
            return { success: false, message: response.message || 'Failed to remove license' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Failed to remove license' };
        }
    };

    useEffect(() => {
        fetchLicenses();
        fetchStats();
    }, [fetchLicenses, fetchStats]);

    return {
        licenses,
        stats,
        isLoading,
        error,
        createLicense,
        updateLicense,
        deleteLicense,
        refresh: fetchLicenses
    };
}
