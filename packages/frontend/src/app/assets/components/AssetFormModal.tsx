'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useMasters } from '@/hooks/useMasters';
import { useCompanies } from '@/hooks/useCompanies';
import { AssetStatusEnum } from '@adminvault/shared-models';
import { assetService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset?: any; // If provided, it's an update
    onSuccess: () => void;
}

export default function AssetFormModal({ isOpen, onClose, asset, onSuccess }: AssetFormModalProps) {
    const { brands, fetchBrands, assetTypes, fetchAssetTypes } = useMasters();
    const { companies, fetchCompanies } = useCompanies();
    const { success, error: toastError } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        deviceId: '',
        brandId: '',
        model: '',
        serialNumber: '',
        configuration: '',
        companyId: '',
        assetStatusEnum: AssetStatusEnum.AVAILABLE,
        purchaseDate: '',
        warrantyExpiry: '',
        expressCode: '',
        boxNo: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchBrands();
            fetchAssetTypes();
            fetchCompanies();

            if (asset) {
                setFormData({
                    deviceId: asset.deviceId?.toString() || '',
                    brandId: asset.brandId?.toString() || '',
                    model: asset.model || '',
                    serialNumber: asset.serialNumber || '',
                    configuration: asset.configuration || '',
                    companyId: asset.companyId?.toString() || '',
                    assetStatusEnum: asset.assetStatusEnum || AssetStatusEnum.AVAILABLE,
                    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
                    warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
                    expressCode: asset.expressCode || '',
                    boxNo: asset.boxNo || ''
                });
            } else {
                setFormData({
                    deviceId: '',
                    brandId: '',
                    model: '',
                    serialNumber: '',
                    configuration: '',
                    companyId: '',
                    assetStatusEnum: AssetStatusEnum.AVAILABLE,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    warrantyExpiry: '',
                    expressCode: '',
                    boxNo: ''
                });
            }
        }
    }, [isOpen, asset]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                deviceId: Number(formData.deviceId),
                brandId: formData.brandId ? Number(formData.brandId) : undefined,
                companyId: Number(formData.companyId),
                id: asset?.id
            };

            const response = asset
                ? await assetService.updateAsset(payload as any)
                : await assetService.createAsset(payload as any);

            if (response.status) {
                success('Success', asset ? 'Asset updated successfully' : 'Asset created successfully');
                onSuccess();
                onClose();
            } else {
                toastError('Error', response.message || 'Operation failed');
            }
        } catch (error: any) {
            toastError('Error', error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={asset ? 'Update Asset' : 'Add New Asset'}
            size="md" // Medium size but compact internal layout
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <Select
                        label="Company"
                        name="companyId"
                        value={formData.companyId}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select Company' },
                            ...companies.map(c => ({ value: c.id, label: c.companyName }))
                        ]}
                        required
                    />
                    <Select
                        label="Asset Type"
                        name="deviceId"
                        value={formData.deviceId}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select Type' },
                            ...assetTypes.map(t => ({ value: t.id, label: t.name }))
                        ]}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Select
                        label="Brand"
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select Brand' },
                            ...brands.map(b => ({ value: b.id, label: b.name }))
                        ]}
                    />
                    <Input
                        label="Model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="e.g. Latitude 5420"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Serial Number"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="S/N or Service Tag"
                        required
                    />
                    <Select
                        label="Status"
                        name="assetStatusEnum"
                        value={formData.assetStatusEnum}
                        onChange={handleChange}
                        options={[
                            { value: AssetStatusEnum.AVAILABLE, label: 'Available' },
                            { value: AssetStatusEnum.IN_USE, label: 'In Use' },
                            { value: AssetStatusEnum.MAINTENANCE, label: 'Maintenance' },
                            { value: AssetStatusEnum.RETIRED, label: 'Retired' }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Purchase Date"
                        name="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                    />
                    <Input
                        label="Warranty Expiry"
                        name="warrantyExpiry"
                        type="date"
                        value={formData.warrantyExpiry}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Express Code"
                        name="expressCode"
                        value={formData.expressCode}
                        onChange={handleChange}
                    />
                    <Input
                        label="Box Number"
                        name="boxNo"
                        value={formData.boxNo}
                        onChange={handleChange}
                    />
                </div>

                <div className="w-full">
                    <label className="text-xs font-medium text-primary-600 mb-1 block ml-4">Configuration Details</label>
                    <textarea
                        name="configuration"
                        value={formData.configuration}
                        onChange={handleChange}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm min-h-[80px] focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                        placeholder="RAM, Processor, Storage, etc."
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        className="flex-1 py-2"
                    >
                        {asset ? 'Update Asset' : 'Create Asset'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
