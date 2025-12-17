'use client';

import { useState, useEffect, useCallback } from 'react';
import { companyService } from '@/lib/api/services';
import { CreateCompanyModel, UpdateCompanyModel, DeleteCompanyModel, GetCompanyModel } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

interface Company {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    createdAt?: string;
}

export function useCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchCompanies = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await companyService.getAllCompanies();

            if (response.status && response.data) {
                setCompanies(response.data as Company[]);
            } else {
                throw new Error(response.message || 'Failed to fetch companies');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch companies';
            setError(errorMessage);
            toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const createCompany = useCallback(
        async (data: CreateCompanyModel) => {
            try {
                setIsLoading(true);
                const response = await companyService.createCompany(data);

                if (response.status) {
                    toast.success('Success', 'Company created successfully');
                    await fetchCompanies();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to create company');
                }
            } catch (err: any) {
                toast.error('Error', err.message || 'Failed to create company');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchCompanies]
    );

    const updateCompany = useCallback(
        async (data: UpdateCompanyModel) => {
            try {
                setIsLoading(true);
                const response = await companyService.updateCompany(data);

                if (response.status) {
                    toast.success('Success', 'Company updated successfully');
                    await fetchCompanies();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to update company');
                }
            } catch (err: any) {
                toast.error('Error', err.message || 'Failed to update company');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchCompanies]
    );

    const deleteCompany = useCallback(
        async (data: DeleteCompanyModel) => {
            try {
                setIsLoading(true);
                const response = await companyService.deleteCompany(data);

                if (response.status) {
                    toast.success('Success', 'Company deleted successfully');
                    await fetchCompanies();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete company');
                }
            } catch (err: any) {
                toast.error('Error', err.message || 'Failed to delete company');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchCompanies]
    );

    const getCompany = useCallback(
        async (data: GetCompanyModel) => {
            try {
                setIsLoading(true);
                const response = await companyService.getCompany(data);

                if (response.status && response.data) {
                    return response.data as Company;
                } else {
                    throw new Error(response.message || 'Failed to fetch company');
                }
            } catch (err: any) {
                toast.error('Error', err.message || 'Failed to fetch company');
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    return {
        companies,
        isLoading,
        error,
        fetchCompanies,
        createCompany,
        updateCompany,
        deleteCompany,
        getCompany,
    };
}
