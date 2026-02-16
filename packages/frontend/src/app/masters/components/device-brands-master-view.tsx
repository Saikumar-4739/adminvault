'use client';

import { useState, useEffect, useRef } from 'react';
import { CreateBrandModel, UpdateBrandModel, DeviceBrand } from '@adminvault/shared-models';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Plus, Pencil, Trash2, ArrowLeft, Star } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';
import { BrandService } from '@adminvault/shared-services';


interface DeviceBrandsMasterViewProps {
    onBack?: () => void;
}

export const DeviceBrandsMasterView: React.FC<DeviceBrandsMasterViewProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [brands, setBrands] = useState<DeviceBrand[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', website: '', rating: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const lastFetchedCompanyId = useRef<number | null>(null);
    const brandService = new BrandService();

    useEffect(() => {
        if (user?.companyId && lastFetchedCompanyId.current !== user.companyId) {
            lastFetchedCompanyId.current = user.companyId;
            getAllBrands();
        }
    }, [user?.companyId]);

    const getAllBrands = async (): Promise<void> => {
        try {
            const response = await brandService.getAllBrands();
            if (response.status) {
                setBrands(response.brands || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!user) return;
        try {
            if (isEditMode && editingId) {
                const model = new UpdateBrandModel(editingId, formData.name, formData.description, true, formData.website, formData.rating ? parseFloat(formData.rating) : undefined);
                const response = await brandService.updateBrand(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllBrands();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreateBrandModel(user.id, 0, formData.name, formData.description, true, formData.website, formData.rating ? parseFloat(formData.rating) : undefined);
                const response = await brandService.createBrand(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllBrands();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    };

    const handleEdit = (item: DeviceBrand): void => {
        setIsEditMode(true);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || '',
            website: item.website || '',
            rating: item.rating?.toString() || '',
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number): void => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (deletingId) {
            try {
                const response = await brandService.deleteBrand({ id: deletingId });
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    getAllBrands();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message);
            }
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', description: '', website: '', rating: '' });
    };

    return (
        <>
            <Card className="border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
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
                    <div className="overflow-x-auto h-full">
                        <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Brand Name</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Website</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Rating</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {brands?.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No brands found</td></tr>
                                ) : (
                                    brands?.map((item: DeviceBrand, index: number) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{item.description || '-'}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                {item.website ? (
                                                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                                                        {item.website}
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                {item.rating ? (
                                                    <div className="flex justify-center items-center gap-1">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-4 w-4 ${star <= (parseFloat(item.rating) || 0)
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-slate-300 dark:text-slate-600"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-medium ml-1">
                                                            ({parseFloat(item.rating).toFixed(1)})
                                                        </span>
                                                    </div>
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
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Device Brand" : "Add Device Brand"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Brand Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-14" required />

                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-14" />

                    <Input label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="h-14" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star.toString() })}
                                        className="focus:outline-none transition-transform active:scale-95 hover:scale-110"
                                    >
                                        <Star
                                            className={`h-6 w-6 ${star <= (parseFloat(formData.rating) || 0)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-slate-300 dark:text-slate-600"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm text-slate-500 font-medium">
                                {formData.rating ? `${formData.rating}/5` : 'No rating'}
                            </span>
                        </div>
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
                itemName="Brand"
            />
        </>
    );
}
