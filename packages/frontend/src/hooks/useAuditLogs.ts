import { useState, useCallback, useEffect } from 'react';
import { auditLogsService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

export interface AuditLog {
    id: number;
    action: string;
    resource: string;
    details: string;
    status: string;
    ipAddress: string;
    user: any;
    createdAt: string;
}

export function useAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await auditLogsService.getLogs();
            if (response && response.data) { // Assuming response structure { success: true, data: [...] }
                setLogs(response.data);
            } else if (Array.isArray(response)) {
                setLogs(response);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch audit logs');
            console.error(err);
            toast.error('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return {
        logs,
        isLoading,
        error,
        refresh: fetchLogs
    };
}
