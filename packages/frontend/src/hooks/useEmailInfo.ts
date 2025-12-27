import { useState, useCallback, useEffect } from 'react';
import { emailService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { EmailInfoResponseModel, CreateEmailInfoModel, DeleteEmailInfoModel } from '@adminvault/shared-models';

export function useEmailInfo(companyId?: number) {
    const [emailInfoList, setEmailInfoList] = useState<EmailInfoResponseModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchEmailInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await emailService.getAllEmailInfo(companyId);
            if (response.status) {
                setEmailInfoList(response.data || []);
            } else {
                const msg = response.message || 'Failed to fetch email info';
                setError(msg);
                toast.error('Error', msg);
            }
        } catch (err: any) {
            const msg = err.message || 'An error occurred while fetching email info';
            setError(msg);
            toast.error('Connection Error', msg);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, toast]);

    const createEmailInfo = useCallback(async (data: CreateEmailInfoModel) => {
        setIsLoading(true);
        try {
            const response = await emailService.createEmailInfo(data);
            if (response.status) {
                toast.success('Success', 'Email info record created successfully');
                await fetchEmailInfo();
                return true;
            } else {
                toast.error('Error', response.message || 'Failed to create email info');
                return false;
            }
        } catch (err: any) {
            toast.error('Error', err.message || 'Failed to create email info');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchEmailInfo, toast]);

    const deleteEmailInfo = useCallback(async (id: number) => {
        setIsLoading(true);
        try {
            const response = await emailService.deleteEmailInfo({ id } as DeleteEmailInfoModel);
            if (response.status) {
                toast.success('Deleted', 'Email info record removed');
                await fetchEmailInfo();
                return true;
            } else {
                toast.error('Error', response.message || 'Failed to delete record');
                return false;
            }
        } catch (err: any) {
            toast.error('Error', err.message || 'Failed to delete record');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchEmailInfo, toast]);

    useEffect(() => {
        if (companyId) {
            fetchEmailInfo();
        } else {
            setEmailInfoList([]);
        }
    }, [companyId, fetchEmailInfo]);

    return {
        emailInfoList,
        isLoading,
        error,
        fetchEmailInfo,
        createEmailInfo,
        deleteEmailInfo
    };
}
