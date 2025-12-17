'use client';

import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Edit, Trash2, Package, Calendar, Hash } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AssetsPage() {
    const { assets, isLoading, createAsset, updateAsset, deleteAsset } = useAssets();
    const { companies } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        assetName: '',
        assetType: '',
        serialNumber: '',
        companyId: '',
        status: 'Available',
        purchaseDate: '',
    });

    const filteredAssets = assets.filter((asset) =>
        asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            companyId: parseInt(formData.companyId),
        };

        if (editingAsset) {
            await updateAsset({ ...data, id: editingAsset.id } as any);
        } else {
            await createAsset(data as any);
        }

        handleCloseModal();
    };

    const handleEdit = (asset: any) => {
        setEditingAsset(asset);
        setFormData({
            assetName: asset.assetName,
            assetType: asset.assetType || '',
            serialNumber: asset.serialNumber || '',
            companyId: asset.companyId.toString(),
            status: asset.status || 'Available',
            purchaseDate: asset.purchaseDate || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (asset: any) => {
        if (confirm(`Are you sure you want to delete ${asset.assetName}?`)) {
            await deleteAsset({ id: asset.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
        setFormData({ assetName: '', assetType: '', serialNumber: '', companyId: '', status: 'Available', purchaseDate: '' });
    };

    const getCompanyName = (companyId: number) => {
        const company = companies.find(c => c.id === companyId);
        return company?.name || 'Unknown';
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'available': return 'success';
            case 'assigned': return 'primary';
            case 'maintenance': return 'warning';
            case 'retired': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assets</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your organization's assets and equipment
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Asset
                </Button>
            </div>

            {/* Search */}
            <Card>
                <div className="p-4">
                    <Input
                        placeholder="Search assets by name or serial number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-5 w-5" />}
                    />
                </div>
            </Card>

            {/* Assets Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Asset
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Serial Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Purchase Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchQuery ? 'No assets found' : 'No assets yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {asset.assetName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {asset.assetType || 'General'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                <Hash className="h-4 w-4 text-gray-400" />
                                                {asset.serialNumber || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {getCompanyName(asset.companyId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={getStatusColor(asset.status) as any}>
                                                {asset.status || 'Available'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                {asset.purchaseDate ? formatDate(asset.purchaseDate) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Edit className="h-4 w-4" />}
                                                    onClick={() => handleEdit(asset)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                                    onClick={() => handleDelete(asset)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

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
                    <Input
                        label="Asset Name"
                        value={formData.assetName}
                        onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                        required
                        placeholder="MacBook Pro 16"
                    />
                    <Input
                        label="Asset Type"
                        value={formData.assetType}
                        onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                        placeholder="Laptop"
                    />
                    <Input
                        label="Serial Number"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                        placeholder="SN123456789"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Company <span className="text-error-500">*</span>
                        </label>
                        <select
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Select a company</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Available">Available</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>
                    <Input
                        label="Purchase Date"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                </form>
            </Modal>
        </div>
    );
}
