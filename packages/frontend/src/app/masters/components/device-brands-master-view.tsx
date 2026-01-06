'use client';

import { useState, useEffect, useCallback } from 'react';
import { mastersService, companyService } from '@/lib/api/services';
import { CreateBrandModel, UpdateBrandModel } from '@adminvault/shared-models';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceBrand {
    id: number;
    name: string;
    description?: string;
    website?: string;
    rating?: number;
    code?: string;
    isActive: boolean;
    companyId: number;
}

export default function DeviceBrandsMasterView({ onBack }: { onBack?: () => void }) {
    const { user } = useAuth();
    const { success: toastSuccess, error: toastError } = useToast();
    const [brands, setBrands] = useState<DeviceBrand[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', website: '', rating: '', code: '', companyId: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const getAllCompanies = async () => {
        try {
            const response = await companyService.getAllCompanies();
            if (response.status) {
                setCompanies(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    };

    const getAllBrands = useCallback(async () => {
        if (!user?.companyId) return;
        setIsLoading(true);
        try {
            const response = await mastersService.getAllBrands(user.companyId as any);
            if (response.status) {
                setBrands(response.brands || []);
            } else {
                toastError(response.message || 'Failed to fetch brands');
            }
        } catch (error: any) {
            toastError(error.message || 'Failed to fetch brands');
        } finally {
            setIsLoading(false);
        }
    }, [toastError, user?.companyId]);

    useEffect(() => {
        if (user?.companyId) {
            getAllBrands();
            getAllCompanies();
        }
    }, [getAllBrands, user?.companyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const companyIdToUse = Number(formData.companyId) || user.companyId;
            if (isEditMode && editingId) {
                const model = new UpdateBrandModel(
                    editingId,
                    formData.name,
                    formData.description,
                    true, // isActive, not in form currently so defaulting to true or existing
                    formData.website,
                    formData.rating ? parseFloat(formData.rating) : undefined,
                    formData.code,
                    companyIdToUse
                );

                const response = await mastersService.updateBrand(model);
                if (response.status) {
                    toastSuccess(response.message || 'Brand Updated Successfully');
                    handleCloseModal();
                    getAllBrands();
                } else {
                    toastError(response.message || 'Failed to Update Brand');
                }
            } else {
                const model = new CreateBrandModel(
                    user.id,
                    companyIdToUse,
                    formData.name,
                    formData.description,
                    true,
                    formData.website,
                    formData.rating ? parseFloat(formData.rating) : undefined,
                    formData.code
                );
                const response = await mastersService.createBrand(model);
                if (response.status) {
                    toastSuccess(response.message || 'Brand Created Successfully');
                    handleCloseModal();
                    getAllBrands();
                } else {
                    toastError(response.message || 'Failed to Create Brand');
                }
            }
        } catch (err: any) {
            toastError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setIsEditMode(true);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || '',
            website: item.website || '',
            rating: item.rating?.toString() || '',
            code: item.code || '',
            companyId: item.companyId || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingId) {
            setIsLoading(true);
            try {
                const response = await mastersService.deleteBrand(deletingId);
                if (response.status) {
                    toastSuccess(response.message || 'Brand Deleted Successfully');
                    getAllBrands();
                } else {
                    toastError(response.message || 'Failed to Delete Brand');
                }
            } catch (err: any) {
                toastError(err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
                setDeletingId(null);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', description: '', website: '', rating: '', code: '', companyId: '' });
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Device Brands</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Brand
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Brand Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Company</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Brand Code</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Website</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Rating</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {brands?.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No brands found</td></tr>
                                    ) : (
                                        brands?.map((item: any, index: number) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {companies.find(c => c.id === item.companyId)?.companyName || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{item.code || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {item.website ? (
                                                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                                                            {item.website}
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    {item.rating ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                            â­  {parseFloat(item.rating).toFixed(1)}
                                                        </span>
                                                    ) : '-'}
                                                </td>
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Device Brand" : "Add Device Brand"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Brand Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

                    <Input label="Brand Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />

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

                    <Input label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                    <Input
                        label="Rating (0-5)"
                        type="number"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        min="0"
                        max="5"
                        step="0.1"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Brand"
                message="Are you sure you want to delete this brand? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}
