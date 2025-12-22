
import { useState, useCallback, useEffect } from 'react';

import { useToast } from '@/contexts/ToastContext';

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
    const toast = useToast();

    // Fetch Licenses
    const fetchLicenses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await licensesService.getAll(companyId);
            if (response.status) {
                setLicenses(response.data);
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
            const response = await licensesService.getStats(companyId);
            if (response.status) {
                setStats(response.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch stats', err);
        }
    }, [companyId]);

    const createLicense = async (data: any) => {
        try {
            const response = await licensesService.create(data);
            if (response.status) {
                toast.success('License assigned successfully');
                fetchLicenses();
                fetchStats();
                return true;
            }
            return false;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign license');
            return false;
        }
    };

    const updateLicense = async (id: number, data: any) => {
        try {
            const response = await licensesService.update(id, data);
            if (response.status) {
                toast.success('License updated successfully');
                fetchLicenses();
                fetchStats();
                return true;
            }
            return false;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update license');
            return false;
        }
    };

    const deleteLicense = async (id: number) => {
        try {
            const response = await licensesService.remove(id);
            if (response.status) {
                toast.success('License removed successfully');
                fetchLicenses();
                fetchStats();
                return true;
            }
            return false;
        } catch (err: any) {
            toast.error('Failed to remove license');
            return false;
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
