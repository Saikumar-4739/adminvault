import { useState, useCallback, useEffect } from 'react';
import { dashboardService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

export interface DashboardStats {
    assets: {
        total: number;
        byStatus: { status: string; count: string }[];
    };
    tickets: {
        total: number;
        byStatus: { status: string; count: string }[];
        byPriority: { priority: string; count: string }[];
        recent: any[];
    };
    employees: {
        total: number;
        byDepartment: { department: string; count: string }[];
    };
    licenses: {
        total: number;
        expiringSoon: {
            id: number;
            applicationName: string;
            expiryDate: Date | string;
            assignedTo: string;
        }[];
    };
    systemHealth: {
        assetUtilization: number;
        ticketResolutionRate: number;
        openCriticalTickets: number;
    };
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await dashboardService.getDashboardStats();
            if (response && response.status && response.data) {
                setStats(response.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard stats');
            console.error(err);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        isLoading,
        error,
        refresh: fetchStats
    };
}
