import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

export function useAssets() {
    const toast = useToast();
    const [assets, setAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssets = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/operations/assets');
            const data = await res.json();
            setAssets(data);
        } catch (error) {
            console.error('Failed to fetch assets');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const assignAsset = async (assetId: number, employeeId: number, remarks: string) => {
        try {
            const res = await fetch(`/api/operations/assets/${assetId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, remarks })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Asset assigned successfully');
                fetchAssets();
            } else {
                toast.error(data.message || 'Failed to assign asset');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const returnAsset = async (assetId: number, remarks: string) => {
        try {
            const res = await fetch(`/api/operations/assets/${assetId}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ remarks })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Asset returned successfully');
                fetchAssets();
            } else {
                toast.error(data.message || 'Failed to return asset');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    return { assets, isLoading, refresh: fetchAssets, assignAsset, returnAsset };
}
