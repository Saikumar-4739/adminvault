'use client';

import { useState, useEffect } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useCompanies } from '@/hooks/useCompanies';
import { useEmployees } from '@/hooks/useEmployees';
import { useMasters } from '@/hooks/useMasters';
import { PageLoader } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Search, Plus, Package, Building2, TrendingUp, CheckCircle2, AlertCircle, Laptop, Monitor, Smartphone, Tablet, HardDrive, Pencil, Trash2, User, Calendar, Printer } from 'lucide-react';
import { AssetStatusEnum } from '@adminvault/shared-models';

const getAssetIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laptop') || lowerName.includes('macbook')) return Laptop;
    if (lowerName.includes('monitor') || lowerName.includes('screen') || lowerName.includes('display')) return Monitor;
    if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('android')) return Smartphone;
    if (lowerName.includes('tablet') || lowerName.includes('ipad')) return Tablet;
    return HardDrive;
};

const isWarrantyExpiring = (warrantyDate?: string) => {
    if (!warrantyDate) return false;
    const expiry = new Date(warrantyDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
};

const isWarrantyExpired = (warrantyDate?: string) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
};

export default function AssetsPage() {
    const { companies } = useCompanies();
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const { assets, statistics, isLoading, createAsset, updateAsset, deleteAsset, searchAssets } = useAssets(selectedOrg ? Number(selectedOrg) : undefined);
    const { employees } = useEmployees(selectedOrg ? Number(selectedOrg) : undefined);
    const { brands, fetchBrands } = useMasters();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [formData, setFormData] = useState({ brandId: '', model: '', serviceTag: '', configuration: '', assignedToEmployeeId: '', previousUserEmployeeId: '', purchaseDate: '', warrantyExpiry: '', userAssignedDate: '', lastReturnDate: '', status: 'available' });

    useEffect(() => {
        if (companies.length > 0 && !selectedOrg) {
            setSelectedOrg(String(companies[0].id));
        }
    }, [companies, selectedOrg]);

    useEffect(() => {
        if (selectedOrg) {
            fetchBrands();
        }
    }, [selectedOrg, fetchBrands]);

    const handleSearch = () => {
        const status = statusFilter ? (statusFilter as AssetStatusEnum) : undefined;
        searchAssets(searchQuery || undefined, status);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const companyId = Number(selectedOrg);
        if (!companyId) {
            alert('Please select an organization first');
            return;
        }
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : 1;
        // For now, using serviceTag as serialNumber and creating a mock deviceId
        const payload = {
            companyId,
            deviceId: 1,
            serialNumber: formData.serviceTag,
            purchaseDate: new Date(formData.purchaseDate),
            assetStatusEnum: formData.status as any,
            warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry) : undefined,
            userAssignedDate: formData.userAssignedDate ? new Date(formData.userAssignedDate) : undefined,
            lastReturnDate: formData.lastReturnDate ? new Date(formData.lastReturnDate) : undefined,
            assignedToEmployeeId: formData.assignedToEmployeeId ? Number(formData.assignedToEmployeeId) : undefined,
            previousUserEmployeeId: formData.previousUserEmployeeId ? Number(formData.previousUserEmployeeId) : undefined,
            brandId: formData.brandId ? Number(formData.brandId) : undefined,
            userId
        };

        if (editingAsset) {
            await updateAsset({ id: editingAsset.id, ...payload } as any);
        } else {
            await createAsset(payload as any);
        }
        handleCloseModal();
    };

    const handleEdit = (asset: any) => {
        setEditingAsset(asset);
        setFormData({
            brandId: asset.brandId ? String(asset.brandId) : '',
            model: asset.model || '',
            serviceTag: asset.serviceTag || asset.serialNumber || '',
            configuration: asset.configuration || '',
            assignedToEmployeeId: asset.assignedToEmployeeId ? String(asset.assignedToEmployeeId) : '',
            previousUserEmployeeId: asset.previousUserEmployeeId ? String(asset.previousUserEmployeeId) : '',
            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
            warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
            userAssignedDate: asset.userAssignedDate ? new Date(asset.userAssignedDate).toISOString().split('T')[0] : '',
            lastReturnDate: asset.lastReturnDate ? new Date(asset.lastReturnDate).toISOString().split('T')[0] : '',
            status: asset.status || 'Available'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (asset: any) => {
        if (confirm(`Are you sure you want to delete asset ${asset.assetName}?`)) {
            await deleteAsset({ id: asset.id });
        }
    };

    const handlePrint = (asset: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Asset Information - ${asset.assetName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
                    .header h1 { color: #1E293B; margin: 0; font-size: 28px; }
                    .header p { color: #64748B; margin: 5px 0; }
                    .section { margin: 25px 0; }
                    .section-title { font-size: 18px; font-weight: bold; color: #4F46E5; margin-bottom: 15px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .info-item { padding: 12px; background: #F8FAFC; border-radius: 8px; border-left: 3px solid #4F46E5; }
                    .info-label { font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
                    .info-value { font-size: 14px; color: #1E293B; font-weight: 500; }
                    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                    .status-available { background: #D1FAE5; color: #065F46; }
                    .status-in-use { background: #DBEAFE; color: #1E40AF; }
                    .status-maintenance { background: #FEF3C7; color: #92400E; }
                    .status-retired { background: #F1F5F9; color: #475569; }
                    .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; border-top: 1px solid #E2E8F0; padding-top: 20px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Asset Information</h1>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>

                <div class="section">
                    <div class="section-title">Basic Information</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Asset Name</div>
                            <div class="info-value">${asset.assetName || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Serial Number</div>
                            <div class="info-value">${asset.serialNumber || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Asset Type</div>
                            <div class="info-value">${asset.assetType || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value">
                                <span class="status-badge ${asset.status === 'AVAILABLE' || asset.status === 'Available' ? 'status-available' :
                asset.status === 'IN_USE' || asset.status === 'InUse' ? 'status-in-use' :
                    asset.status === 'MAINTENANCE' || asset.status === 'Maintenance' ? 'status-maintenance' :
                        'status-retired'
            }">${asset.status || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Assignment Information</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Assigned To</div>
                            <div class="info-value">${asset.assignedTo || 'Not Assigned'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Assignment Date</div>
                            <div class="info-value">${asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">User Assigned Date</div>
                            <div class="info-value">${asset.userAssignedDate ? new Date(asset.userAssignedDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Last Return Date</div>
                            <div class="info-value">${asset.lastReturnDate ? new Date(asset.lastReturnDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Purchase & Warranty</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Purchase Date</div>
                            <div class="info-value">${asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Warranty Expiry</div>
                            <div class="info-value">${asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Asset Management System - AdminVault</p>
                    <p>This document is confidential and for internal use only</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
        setFormData({ brandId: '', model: '', serviceTag: '', configuration: '', assignedToEmployeeId: '', previousUserEmployeeId: '', purchaseDate: '', warrantyExpiry: '', userAssignedDate: '', lastReturnDate: '', status: 'available' });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Asset Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Track and manage your organization's assets
                    </p>
                </div>
                <div className="flex items-center gap-3">
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

            {/* Statistics Dashboard */}
            {selectedOrg && statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="p-5 border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Assets</p>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{statistics.total}</p>
                            </div>
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                                <Package className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Available</p>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{statistics.available}</p>
                            </div>
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Use</p>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{statistics.inUse}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                                <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Maintenance</p>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{statistics.maintenance}</p>
                            </div>
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                                <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 border-l-4 border-slate-500 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/20 dark:to-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Retired</p>
                                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{statistics.retired}</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                                <Package className="h-7 w-7 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Search and Filters */}
            {selectedOrg && (
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by serial number..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="IN_USE">In Use</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="RETIRED">Retired</option>
                        </select>
                        <Button variant="primary" size="sm" onClick={handleSearch}>
                            Search
                        </Button>
                    </div>
                </Card>
            )}

            {/* Assets Grid */}
            {isLoading ? (
                <PageLoader />
            ) : !selectedOrg ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-transparent shadow-none">
                    <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Building2 className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Please select an organization to view assets</p>
                </Card>
            ) : assets.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-transparent shadow-none">
                    <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No assets found</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{assets.map((asset) => {
                    const AssetIcon = getAssetIcon(asset.assetName || 'Device');
                    const warrantyExpiring = isWarrantyExpiring(asset.warrantyExpiry);
                    const warrantyExpired = isWarrantyExpired(asset.warrantyExpiry);

                    return (
                        <Card key={asset.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden relative">
                            {/* Status Stripe */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${asset.status === 'AVAILABLE' || asset.status === 'Available' ? 'bg-emerald-500' :
                                asset.status === 'IN_USE' || asset.status === 'InUse' ? 'bg-blue-500' :
                                    asset.status === 'MAINTENANCE' || asset.status === 'Maintenance' ? 'bg-amber-500' :
                                        'bg-slate-400'
                                }`} />

                            <div className="p-5 pl-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                                        <AssetIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${asset.status === 'AVAILABLE' || asset.status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        asset.status === 'IN_USE' || asset.status === 'InUse' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            asset.status === 'MAINTENANCE' || asset.status === 'Maintenance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
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

                                {/* Assignment Info */}
                                {asset.assignedTo && (
                                    <div className="mb-4 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                                            <User className="h-3.5 w-3.5" />
                                            <span className="font-semibold">{asset.assignedTo}</span>
                                        </div>
                                        {asset.assignedDate && (
                                            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-500 mt-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{new Date(asset.assignedDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 mb-4">
                                    <div>
                                        <span className="block text-slate-400 text-[10px] uppercase">Purchased</span>
                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 text-[10px] uppercase">Warranty</span>
                                        <span className={warrantyExpired ? 'text-rose-600 dark:text-rose-400 font-semibold' : warrantyExpiring ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                                            {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 text-[10px] uppercase">User Assigned</span>
                                        {asset.userAssignedDate ? new Date(asset.userAssignedDate).toLocaleDateString() : '-'}
                                    </div>
                                    <div>
                                        <span className="block text-slate-400 text-[10px] uppercase">Last Return</span>
                                        {asset.lastReturnDate ? new Date(asset.lastReturnDate).toLocaleDateString() : '-'}
                                    </div>
                                </div>

                                {/* Warranty Warning */}
                                {(warrantyExpiring || warrantyExpired) && (
                                    <div className={`mb-4 p-2 rounded-lg text-xs font-medium ${warrantyExpired
                                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30'
                                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                                        }`}>
                                        {warrantyExpired ? '⚠️ Warranty Expired' : '⏰ Warranty Expiring Soon'}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleEdit(asset)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-xs font-semibold"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handlePrint(asset)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-xs font-semibold"
                                    >
                                        <Printer className="h-3.5 w-3.5" />
                                        Print
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors text-xs font-semibold"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Card>
                    );
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
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                            {editingAsset ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                            <select
                                value={formData.brandId}
                                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Model"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Service Tag"
                        value={formData.serviceTag}
                        onChange={(e) => setFormData({ ...formData, serviceTag: e.target.value })}
                        required
                    />

                    <Input
                        label="Configuration"
                        value={formData.configuration}
                        onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Assigned to (Optional)</label>
                            <select
                                value={formData.assignedToEmployeeId}
                                onChange={(e) => setFormData({ ...formData, assignedToEmployeeId: e.target.value })}
                                className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Previous User (Optional)</label>
                            <select
                                value={formData.previousUserEmployeeId}
                                onChange={(e) => setFormData({ ...formData, previousUserEmployeeId: e.target.value })}
                                className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Purchase Date"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            className="h-20"
                            required
                        />
                        <Input
                            label="Warranty Expire Date"
                            type="date"
                            value={formData.warrantyExpiry}
                            onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                            className="h-20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="User Assigned Date"
                            type="date"
                            value={formData.userAssignedDate}
                            onChange={(e) => setFormData({ ...formData, userAssignedDate: e.target.value })}
                            className="h-20"
                        />
                        <Input
                            label="Last Return Date"
                            type="date"
                            value={formData.lastReturnDate}
                            onChange={(e) => setFormData({ ...formData, lastReturnDate: e.target.value })}
                            className="h-20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="available">Available</option>
                            <option value="in_use">In Use</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
