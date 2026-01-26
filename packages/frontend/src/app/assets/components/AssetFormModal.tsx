'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AssetStatusEnum, ComplianceStatusEnum, EncryptionStatusEnum } from '@adminvault/shared-models';
import { assetService, companyService, mastersService, assetTypeService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset?: any; // If provided, it's an update
    onSuccess: () => void;
}

interface AssetFormModalProps {
    children?: React.ReactNode;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, asset, onSuccess }: AssetFormModalProps) => {
    const { success, error: toastError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [assetTypes, setAssetTypes] = useState<any[]>([]);
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
        boxNo: '',
        complianceStatus: ComplianceStatusEnum.UNKNOWN,
        encryptionStatus: EncryptionStatusEnum.UNKNOWN,
        osVersion: '',
        macAddress: '',
        ipAddress: '',
        batteryLevel: '',
        storageTotal: '',
        storageAvailable: ''
    });

    const getCompanyId = useCallback((): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId || 1;
    }, []);

    const fetchBrands = useCallback(async () => {
        try {
            const response = await mastersService.getAllBrands(getCompanyId() as any);
            if (response.status) {
                setBrands(response.brands || []);
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
    }, [getCompanyId]);

    const fetchAssetTypes = useCallback(async () => {
        try {
            const response = await assetTypeService.getAllAssetTypesDropdown();
            if (response.status) {
                setAssetTypes(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch asset types:', error);
        }
    }, []);

    const fetchCompanies = useCallback(async () => {
        try {
            const response: any = await companyService.getAllCompanies();
            if (response.status) {
                // FIXED: API returns 'data' array, not 'companies'
                setCompanies(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        }
    }, []);

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
                    boxNo: asset.boxNo || '',
                    complianceStatus: asset.complianceStatus || ComplianceStatusEnum.UNKNOWN,
                    encryptionStatus: asset.encryptionStatus || EncryptionStatusEnum.UNKNOWN,
                    osVersion: asset.osVersion || '',
                    macAddress: asset.macAddress || '',
                    ipAddress: asset.ipAddress || '',
                    batteryLevel: asset.batteryLevel?.toString() || '',
                    storageTotal: asset.storageTotal || '',
                    storageAvailable: asset.storageAvailable || ''
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
                    boxNo: '',
                    complianceStatus: ComplianceStatusEnum.UNKNOWN,
                    encryptionStatus: EncryptionStatusEnum.UNKNOWN,
                    osVersion: '',
                    macAddress: '',
                    ipAddress: '',
                    batteryLevel: '',
                    storageTotal: '',
                    storageAvailable: ''
                });
            }
        }
    }, [isOpen, asset, fetchBrands, fetchAssetTypes, fetchCompanies]);

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
                id: asset?.id,
                batteryLevel: formData.batteryLevel ? Number(formData.batteryLevel) : undefined
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
            size="lg"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Company and Asset Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Brand and Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                </div>

                {/* Serial Number and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Serial Number"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
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

                {/* Purchase Date and Warranty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Express Code and Box Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Telemetry & Compliance Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Device Telemetry</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Select
                            label="Compliance Status"
                            name="complianceStatus"
                            value={formData.complianceStatus}
                            onChange={handleChange}
                            options={[
                                { value: ComplianceStatusEnum.UNKNOWN, label: 'Unknown' },
                                { value: ComplianceStatusEnum.COMPLIANT, label: 'Compliant' },
                                { value: ComplianceStatusEnum.NON_COMPLIANT, label: 'Non-Compliant' },
                                { value: ComplianceStatusEnum.PENDING, label: 'Pending' }
                            ]}
                        />
                        <Select
                            label="Encryption Status"
                            name="encryptionStatus"
                            value={formData.encryptionStatus}
                            onChange={handleChange}
                            options={[
                                { value: EncryptionStatusEnum.UNKNOWN, label: 'Unknown' },
                                { value: EncryptionStatusEnum.ENCRYPTED, label: 'Encrypted' },
                                { value: EncryptionStatusEnum.NOT_ENCRYPTED, label: 'Not Encrypted' },
                                { value: EncryptionStatusEnum.NOT_APPLICABLE, label: 'Not Applicable' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input
                            label="OS Version"
                            name="osVersion"
                            value={formData.osVersion}
                            onChange={handleChange}
                        />
                        <Input
                            label="MAC Address"
                            name="macAddress"
                            value={formData.macAddress}
                            onChange={handleChange}
                        />
                        <Input
                            label="IP Address"
                            name="ipAddress"
                            value={formData.ipAddress}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Battery Level (%)"
                            name="batteryLevel"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.batteryLevel}
                            onChange={handleChange}
                        />
                        <Input
                            label="Storage Total"
                            name="storageTotal"
                            placeholder="e.g. 512 GB"
                            value={formData.storageTotal}
                            onChange={handleChange}
                        />
                        <Input
                            label="Storage Available"
                            name="storageAvailable"
                            placeholder="e.g. 120 GB"
                            value={formData.storageAvailable}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Configuration */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Configuration Details
                    </label>
                    <textarea
                        name="configuration"
                        value={formData.configuration}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        className="flex-1 h-11"
                    >
                        {asset ? 'Update Asset' : 'Create Asset'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
