'use client';

import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useCompanies } from '@/hooks/useCompanies';
import { PageLoader } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Search, Plus, Filter, LayoutGrid, List, MoreVertical, Edit, Trash2, CheckCircle, Package, Building2, Calendar, Hash, Laptop, Monitor, Smartphone, Tablet, HardDrive } from 'lucide-react';
import { AssetStatusEnum } from '@adminvault/shared-models';

const getAssetIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laptop') || lowerName.includes('macbook')) return Laptop;
    if (lowerName.includes('monitor') || lowerName.includes('screen') || lowerName.includes('display')) return Monitor;
    if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('android')) return Smartphone;
    if (lowerName.includes('tablet') || lowerName.includes('ipad')) return Tablet;
    return HardDrive; // Default
};

export default function AssetsPage() {
    const { companies } = useCompanies();
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const { assets, isLoading, createAsset, updateAsset, deleteAsset } = useAssets(selectedOrg ? Number(selectedOrg) : undefined);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [formData, setFormData] = useState({
        deviceId: '',
        serialNumber: '',
        purchaseDate: '',
        status: 'Available',
        warrantyExpiry: ''
    });

    // Mock devices for dropdown since we don't have useDevices hook yet
    const deviceOptions = [
        { id: 1, name: 'MacBook Pro M1' },
        { id: 2, name: 'Dell XPS 15' },
        { id: 3, name: 'iPhone 13' },
        { id: 4, name: 'Monitor 27"' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const companyId = Number(selectedOrg);
        if (!companyId) {
            alert('Please select an organization first');
            return;
        }

        const payload = {
            companyId,
            deviceId: Number(formData.deviceId),
            serialNumber: formData.serialNumber,
            purchaseDate: new Date(formData.purchaseDate),
            assetStatusEnum: formData.status as any,
            warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry) : undefined
        };

        if (editingAsset) {
            await updateAsset({
                id: editingAsset.id,
                ...payload
            } as any);
        } else {
            await createAsset(payload as any);
        }

        handleCloseModal();
    };

    const handleEdit = (asset: any) => {
        setEditingAsset(asset);
        setFormData({
            deviceId: asset.deviceId ? String(asset.deviceId) : '',
            serialNumber: asset.serialNumber,
            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
            status: asset.status || 'Available',
            warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (asset: any) => {
        if (confirm(`Are you sure you want to delete asset ${asset.assetName}?`)) {
            await deleteAsset({ id: asset.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
        setFormData({
            deviceId: '',
            serialNumber: '',
            purchaseDate: '',
            status: 'Available',
            warrantyExpiry: ''
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Assets</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Manage your organization's physical assets
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Organization Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedOrg}
                            onChange={(e) => setSelectedOrg(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium h-9"
                        >
                            <option value="">Select Organization</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.companyName}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <Building2 className="h-4 w-4" />
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="sm"
                        className="shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
                        leftIcon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsModalOpen(true)}
                        disabled={!selectedOrg}
                    >
                        Add Asset
                    </Button>
                </div>
            </div>

            {/* Assets Grid View */}
            {isLoading ? (
                <PageLoader />
            ) : assets.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-transparent shadow-none">
                    <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No assets found for this organization</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {assets.map((asset) => {
                        const AssetIcon = getAssetIcon(asset.assetName || 'Device');
                        return (
                            <Card key={asset.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden relative">
                                {/* Status Stripe */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${asset.status === 'Available' ? 'bg-emerald-500' :
                                    asset.status === 'InUse' ? 'bg-blue-500' :
                                        'bg-slate-400'
                                    }`} />

                                <div className="p-5 pl-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                                            <AssetIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${asset.status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            asset.status === 'InUse' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {asset.status || 'Unknown'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1 mb-4">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate" title={asset.assetName}>{asset.assetName}</h3>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">SN: {asset.serialNumber}</p>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 mb-4">
                                        <div>
                                            <span className="block text-slate-400 text-[10px] uppercase">Purchased</span>
                                            {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 text-[10px] uppercase">Warranty</span>
                                            {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '-'}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs h-8"
                                            leftIcon={<Edit className="h-3.5 w-3.5" />}
                                            onClick={() => handleEdit(asset)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline" // Changed to outline danger for cleaner look
                                            size="sm"
                                            className="flex-1 text-xs h-8 text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200 dark:border-rose-900/30"
                                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                                            onClick={() => handleDelete(asset)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}


            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
                size="md"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                            {editingAsset ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Device Type
                        </label>
                        <select
                            value={formData.deviceId}
                            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Select Device</option>
                            {deviceOptions.map(device => (
                                <option key={device.id} value={device.id}>{device.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Serial Number"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                        required
                    />
                    <Input
                        label="Purchase Date"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Available">Available</option>
                            <option value="InUse">In Use</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>
                    <Input
                        label="Warranty Expiry"
                        type="date"
                        value={formData.warrantyExpiry}
                        onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    />
                </form>
            </Modal>
        </div>
    );
}
