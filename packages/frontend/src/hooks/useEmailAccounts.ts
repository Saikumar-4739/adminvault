import { useState, useCallback, useEffect } from 'react';
import { emailAccountsService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

import { EmailAccountResponseModel } from '@adminvault/shared-models';

export function useEmailAccounts(companyId?: number) {
    const [emailAccounts, setEmailAccounts] = useState<EmailAccountResponseModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchEmailAccounts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await emailAccountsService.getAll(companyId);
            if (response.status) {
                setEmailAccounts(response.data);
            } else {
                setError(response.message || 'Failed to fetch email accounts');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            toast.error('Failed to load email accounts');
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    const createEmailAccount = async (data: any) => {
        try {
            const response = await emailAccountsService.create(data);
            if (response.status) {
                toast.success('Email account created successfully');
                fetchEmailAccounts();
                return true;
            } else {
                toast.error(response.message || 'Failed to create email account');
                return false;
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create email account');
            return false;
        }
    };

    const deleteEmailAccount = async (id: number) => {
        if (!confirm('Are you sure you want to delete this email account?')) return;
        try {
            const response = await emailAccountsService.delete(id);
            if (response.status) {
                toast.success('Email account deleted');
                fetchEmailAccounts();
            } else {
                toast.error(response.message || 'Failed to delete email account');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete email account');
        }
    };

    useEffect(() => {
        // Only fetch if we have a companyId or if we want to fetch all (depending on requirements)
        // Previous mock implementation waited for selectedOrg.
        if (companyId) {
            fetchEmailAccounts();
        } else {
            setEmailAccounts([]);
        }
    }, [fetchEmailAccounts, companyId]);

    return {
        emailAccounts,
        isLoading,
        error,
        fetchEmailAccounts,
        createEmailAccount,
        deleteEmailAccount
    };
}
