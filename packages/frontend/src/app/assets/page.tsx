'use client';

import React, { useState } from 'react';
import {
    Package, Warehouse, History, Plus, FileUp, Filter,
    Activity, CheckCircle2, AlertCircle, User, AlertTriangle
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import { useAssets } from '@/hooks/useAssets';
import ModernTabs from './components/ModernTabs';
import AllAssetsTab from './components/AllAssetsTab';
import AssetQRModal from './components/AssetQRModal';
import AssetTimelineModal from './components/AssetTimelineModal';
import BulkImportModal from './components/BulkImportModal';
import AdvancedFilterModal from './components/AdvancedFilterModal';
import AssetFormModal from './components/AssetFormModal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { assetService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

export default function AssetsPage() {
    const { user } = useAuth();
    const { success, error: toastError } = useToast();
    const companyId = Number(user?.companyId || 1);
    const [activeTab, setActiveTab] = useState('store');

    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const tabs = [
        { id: 'store', label: 'Store Assets', icon: Warehouse, gradient: 'from-emerald-500 to-teal-500' },
        { id: 'assigned', label: 'Assigned Assets', icon: User, gradient: 'from-blue-500 to-indigo-500' },
        { id: 'maintenance', label: 'Maintenance Assets', icon: AlertTriangle, gradient: 'from-amber-500 to-orange-500' },
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

    const handleDelete = async (asset: any) => {
        if (confirm(`Are you sure you want to delete asset ${asset.serialNumber}?`)) {
            try {
                const response = await assetService.deleteAsset({ id: asset.id });
                if (response.status) {
                    success('Success', 'Asset deleted successfully');
                    refresh();
                }
            } catch (err: any) {
                toastError('Error', err.message || 'Failed to delete asset');
            }
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

    const { assets, statistics, refresh, isLoading, error } = useAssets(companyId);

    // Show toast on fetch error
    React.useEffect(() => {
        if (error) {
            toastError('Error', error);
        }
    }, [error, toastError]);

    const StatCard = ({ label, value, icon, gradient }: any) => (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-4 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{value || 0}</h3>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-inner`}>
                        {React.cloneElement(icon, { className: 'h-5 w-5' })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Asset Inventory</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage and track hardware assets across the organization.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)} leftIcon={<Filter className="h-4 w-4" />}>
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsBulkImportOpen(true)} leftIcon={<FileUp className="h-4 w-4" />}>
                        Bulk Import
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleAddAsset} leftIcon={<Plus className="h-4 w-4" />}>
                        Add Asset
                    </Button>
                </div>
            </div>

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
                    gradient="from-amber-500 to-orange-600"
                />
                <StatCard
                    label="In Maintenance"
                    value={statistics?.maintenance}
                    icon={<AlertCircle className="h-6 w-6" />}
                    gradient="from-rose-500 to-pink-600"
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
                        // TODO: Implement filter logic
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
        </div>
    );
}
