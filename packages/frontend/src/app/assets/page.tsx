'use client';

import React, { useState } from 'react';
import {
    Package, Warehouse, History, Plus, FileUp, Filter,
    Activity, CheckCircle2, User, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

import { ModernTabs } from './components/ModernTabs';
import { AllAssetsTab } from './components/AllAssetsTab';
import dynamic from 'next/dynamic';

const AssetQRModal = dynamic(() => import('./components/AssetQRModal').then(mod => mod.AssetQRModal), { ssr: false });
const AssetTimelineModal = dynamic(() => import('./components/AssetTimelineModal').then(mod => mod.AssetTimelineModal), { ssr: false });
const BulkImportModal = dynamic(() => import('./components/BulkImportModal').then(mod => mod.BulkImportModal), { ssr: false });
const AdvancedFilterModal = dynamic(() => import('./components/AdvancedFilterModal').then(mod => mod.AdvancedFilterModal), { ssr: false });
const AssetFormModal = dynamic(() => import('./components/AssetFormModal').then(mod => mod.AssetFormModal), { ssr: false });
const AssignAssetModal = dynamic(() => import('./components/AssignAssetModal').then(mod => mod.AssignAssetModal), { ssr: false });

import { PageHeader } from '@/components/ui/PageHeader';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';
import { assetService } from '@/lib/api/services';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { AssetSearchRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';

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
    previousUser?: string;
}

interface AssetStatistics {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    retired: number;
}

const AssetsPage: React.FC = () => {
    const { user } = useAuth();
    const companyId = Number(user?.companyId || 1);
    const [activeTab, setActiveTab] = useState('store');

    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const [assets, setAssets] = useState<Asset[]>([]);
    const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchAssets = React.useCallback(async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const req = new CompanyIdRequestModel(companyId);
            const response = await assetService.getAssetsWithAssignments(req);
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
                    previousUserEmployeeId: item.previousUserEmployeeId,
                    previousUser: item.previousUser
                }));
                setAssets(mappedAssets);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'An error occurred while fetching assets');
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    const fetchStatistics = React.useCallback(async () => {
        if (!companyId) return;
        try {
            const req = new CompanyIdRequestModel(companyId);
            const response = await assetService.getAssetStatistics(req);
            if (response.status) {
                setStatistics(response.statistics);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to fetch statistics');
        }
    }, [companyId]);

    const refresh = React.useCallback(() => {
        fetchAssets();
        fetchStatistics();
    }, [fetchAssets, fetchStatistics]);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    React.useEffect(() => {
        if (fetchError) {
            AlertMessages.getErrorMessage(fetchError);
            setFetchError(null);
        }
    }, [fetchError]);

    const searchAssets = React.useCallback(async (filters: any) => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const request = new AssetSearchRequestModel(
                companyId,
                filters.searchQuery,
                filters.statusFilter,
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
                    previousUserEmployeeId: item.previousUserEmployeeId,
                    previousUser: item.previousUser
                }));
                setAssets(mappedAssets);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to search assets');
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    const tabs = [
        { id: 'store', label: 'Store Assets', icon: Warehouse, gradient: 'from-emerald-500 to-teal-500' },
        { id: 'assigned', label: 'Assigned Assets', icon: User, gradient: 'from-blue-500 to-indigo-500' },
        { id: 'maintenance', label: 'Maintenance Assets', icon: RefreshCw, gradient: 'from-orange-500 to-amber-500' },
        { id: 'not_used', label: 'Not Used Assets', icon: History, gradient: 'from-slate-500 to-gray-500' }
    ];

    const handleEdit = (asset: any) => {
        setSelectedAsset(asset);
        setIsAssetFormOpen(true);
    };

    const handleAddAsset = () => {
        setSelectedAsset(null);
        setIsAssetFormOpen(true);
    };

    const handleAssign = (asset: any) => {
        setSelectedAsset(asset);
        setIsAssignModalOpen(true);
    };

    const handleDelete = (asset: any) => {
        setSelectedAsset(asset);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedAsset) return;
        try {
            const response = await assetService.deleteAsset({ id: selectedAsset.id });
            if (response.status) {
                AlertMessages.getSuccessMessage('Asset deleted successfully');
                refresh();
                setIsDeleteModalOpen(false);
                setSelectedAsset(null);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to delete asset');
        }
    };

    const handlePrint = (asset: any) => {
        setSelectedAsset(asset);
        setIsQRModalOpen(true);
    };

    const handleHistory = (asset: any) => {
        setSelectedAsset(asset);
        setIsTimelineModalOpen(true);
    };

    const StatCard = ({ label, value, icon, gradient }: any) => (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-3 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight mb-0.5">{label}</p>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight tabular-nums">{value || 0}</h3>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md`}>
                        {React.cloneElement(icon, { className: 'h-4 w-4' })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/50 space-y-6">
            <PageHeader
                title="Asset Inventory"
                description="Manage and track hardware assets across the organization."
                icon={<Package />}
                gradient="from-emerald-500 to-teal-600"
                actions={[
                    {
                        label: 'Filter',
                        onClick: () => setIsFilterModalOpen(true),
                        icon: <Filter className="h-4 w-4" />,
                        variant: 'outline'
                    },
                    {
                        label: 'Bulk Import',
                        onClick: () => setIsBulkImportOpen(true),
                        icon: <FileUp className="h-4 w-4" />,
                        variant: 'outline'
                    },
                    {
                        label: 'Add Asset',
                        onClick: handleAddAsset,
                        icon: <Plus className="h-4 w-4" />,
                        variant: 'primary'
                    }
                ]}
            />

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Inventory"
                    value={statistics?.total}
                    icon={<Package className="h-6 w-6" />}
                    gradient="from-indigo-500 to-blue-600"
                />
                <StatCard
                    label="Active Units"
                    value={statistics?.inUse}
                    icon={<Activity className="h-6 w-6" />}
                    gradient="from-emerald-500 to-teal-600"
                />
                <StatCard
                    label="Available Stock"
                    value={statistics?.available}
                    icon={<CheckCircle2 className="h-6 w-6" />}
                    gradient="from-emerald-500 to-teal-600"
                />
                <StatCard
                    label="Under Maintenance"
                    value={statistics?.maintenance}
                    icon={<RefreshCw className="h-6 w-6" />}
                    gradient="from-orange-500 to-amber-600"
                />
            </div>

            <ModernTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <div className="mt-6">
                    {activeTab === 'store' && (
                        <AllAssetsTab
                            assets={assets}
                            isLoading={isLoading}
                            status="available"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPrint={handlePrint}
                            onHistory={handleHistory}
                            onAssign={handleAssign}
                        />
                    )}
                    {activeTab === 'assigned' && (
                        <AllAssetsTab
                            assets={assets}
                            isLoading={isLoading}
                            status="in_use"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPrint={handlePrint}
                            onHistory={handleHistory}
                            onAssign={handleAssign}
                        />
                    )}
                    {activeTab === 'maintenance' && (
                        <AllAssetsTab
                            assets={assets}
                            isLoading={isLoading}
                            status="maintenance"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPrint={handlePrint}
                            onHistory={handleHistory}
                            onAssign={handleAssign}
                        />
                    )}
                    {activeTab === 'not_used' && (
                        <AllAssetsTab
                            assets={assets}
                            isLoading={isLoading}
                            status="retired"
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPrint={handlePrint}
                            onHistory={handleHistory}
                            onAssign={handleAssign}
                        />
                    )}
                </div>
            </ModernTabs>

            {/* Modals */}
            {isQRModalOpen && (
                <AssetQRModal
                    isOpen={isQRModalOpen}
                    asset={selectedAsset}
                    onClose={() => setIsQRModalOpen(false)}
                />
            )}
            {isTimelineModalOpen && (
                <AssetTimelineModal
                    isOpen={isTimelineModalOpen}
                    asset={selectedAsset}
                    companyId={companyId}
                    onClose={() => setIsTimelineModalOpen(false)}
                />
            )}
            {isBulkImportOpen && (
                <BulkImportModal
                    isOpen={isBulkImportOpen}
                    companyId={companyId}
                    onSuccess={() => { /* handled */ }}
                    onClose={() => setIsBulkImportOpen(false)}
                />
            )}
            {isFilterModalOpen && (
                <AdvancedFilterModal
                    isOpen={isFilterModalOpen}
                    initialFilters={{}}
                    onClose={() => setIsFilterModalOpen(false)}
                    onApply={(filters) => {
                        searchAssets(filters);
                        setIsFilterModalOpen(false);
                    }}
                />
            )}
            {isAssetFormOpen && (
                <AssetFormModal
                    isOpen={isAssetFormOpen}
                    asset={selectedAsset}
                    onClose={() => setIsAssetFormOpen(false)}
                    onSuccess={() => {
                        refresh();
                    }}
                />
            )}
            {isAssignModalOpen && (
                <AssignAssetModal
                    isOpen={isAssignModalOpen}
                    asset={selectedAsset}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSuccess={() => {
                        refresh();
                    }}
                />

            )}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedAsset(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Asset"
                itemName={selectedAsset ? selectedAsset.assetName : undefined}
                description="Are you sure you want to delete this asset? This action cannot be undone."
            />
        </div>
    );
}


export default AssetsPage;