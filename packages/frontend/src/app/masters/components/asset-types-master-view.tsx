'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetTypeService, companyService } from '@/lib/api/services';
import { CreateAssetTypeModel, UpdateAssetTypeModel, AssetType } from '@adminvault/shared-models';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';


interface AssetTypesMasterViewProps {
    onBack?: () => void;
}

interface CompanyInfo {
    id: number;
    companyName: string;
}

export const AssetTypesMasterView: React.FC<AssetTypesMasterViewProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [companies, setCompanies] = useState<CompanyInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', code: '', status: '', isActive: true, companyId: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const getAllCompanies = async (): Promise<void> => {
        try {
            const response = await companyService.getAllCompanies();
            if (response.status) {
                setCompanies(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    };

    const getAllAssetTypes = useCallback(async (): Promise<void> => {
        if (!user?.companyId) return;
        setIsLoading(true);
        try {
            const response = await assetTypeService.getAllAssetTypes({ companyId: user.companyId });
            if (response.status) {
                setAssetTypes(response.assetTypes || []);
            } else {
                AlertMessages.getErrorMessage(response.message || 'Failed to fetch asset types');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch asset types');
        } finally {
            setIsLoading(false);
        }
    }, [user?.companyId]);

    useEffect(() => {
        if (user?.companyId) {
            getAllAssetTypes();
            getAllCompanies();
        }
    }, [getAllAssetTypes, user?.companyId]);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const companyIdToUse = Number(formData.companyId) || user.companyId;
            if (isEditMode && editingId) {
                const model = new UpdateAssetTypeModel(
                    editingId,
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.code,
                    companyIdToUse,
                );
                const response = await assetTypeService.updateAssetType(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Asset Type Updated Successfully');
                    handleCloseModal();
                    getAllAssetTypes();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to Update Asset Type');
                }
            } else {
                const model = new CreateAssetTypeModel(
                    user.id,
                    companyIdToUse,
                    formData.name,
                    formData.description,
                    formData.isActive ?? true,
                    formData.code,
                    formData.status
                );
                const response = await assetTypeService.createAssetType(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Asset Type Created Successfully');
                    handleCloseModal();
                    getAllAssetTypes();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to Create Asset Type');
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: AssetType): void => {
        setIsEditMode(true);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || '',
            code: item.code || '',
            status: item.status || '',
            isActive: item.isActive ?? true,
            companyId: item.companyId?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number): void => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (deletingId) {
            setIsLoading(true);
            try {
                const response = await assetTypeService.deleteAssetType({ id: deletingId });
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Asset Type Deleted Successfully');
                    getAllAssetTypes();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to Delete Asset Type');
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
                setDeletingId(null);
            }
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', description: '', code: '', status: '', isActive: true, companyId: '' });
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Asset Types</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Asset Type
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                    {isLoading ? (
                        <PageLoader />
                    ) : (
                        <div className="overflow-x-auto h-full">
                            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Asset Type</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Company</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Asset Code</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {assetTypes?.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No asset types found</td></tr>
                                    ) : (
                                        assetTypes?.map((item: AssetType) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {companies.find(c => c.id === item.companyId)?.companyName || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{item.code || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{item.description || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(item)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(item.id)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Asset Type" : "Add Asset Type"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Asset Type Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Asset Code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
                        <select
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <option value="">Select Company</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.companyName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                            placeholder="Enter asset type description..."
                        />
                    </div>

                    <Input
                        label="Status Label (Optional)"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        placeholder="e.g. In Use, Returned"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName="Asset Type"
            />
        </>
    );
}
