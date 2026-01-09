'use client';

import { useState, useEffect, useCallback } from 'react';
import { mastersService } from '@/lib/api/services';
import { CreateTicketCategoryModel } from '@adminvault/shared-models';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface TicketCategory {
    id: number;
    name: string;
    description?: string;
    defaultPriority?: 'Low' | 'Medium' | 'High' | null;
    isActive: boolean;
}

export default function TicketCategoriesMasterView({ onBack }: { onBack?: () => void }) {
    const { success: toastSuccess, error: toastError } = useToast();
    const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', defaultPriority: 'Low' as 'Low' | 'Medium' | 'High' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const getCompanyId = (): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId || 1;
    };

    const getUserId = (): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.id || 1;
    };

    const getAllTicketCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response: any = await mastersService.getAllTicketCategories(getCompanyId() as any);
            if (response.status) {
                setTicketCategories(response.ticketCategories || []);
            } else {
                toastError(response.message || 'Failed to fetch ticket categories');
            }
        } catch (error: any) {
            toastError(error.message || 'Failed to fetch ticket categories');
        } finally {
            setIsLoading(false);
        }
    }, [toastError]);

    useEffect(() => {
        getAllTicketCategories();
    }, [getAllTicketCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditMode && editingId) {
                const response = await mastersService.updateTicketCategory({
                    ...formData,
                    id: editingId,
                    isActive: true
                } as any);
                if (response.status) {
                    toastSuccess(response.message || 'Ticket Category Updated Successfully');
                    handleCloseModal();
                    getAllTicketCategories();
                } else {
                    toastError(response.message || 'Failed to Update Ticket Category');
                }
            } else {
                const model = new CreateTicketCategoryModel(
                    getUserId(),
                    getCompanyId(),
                    formData.name,
                    formData.description,
                    true,
                    formData.defaultPriority
                );
                const response = await mastersService.createTicketCategory(model);
                if (response.status) {
                    toastSuccess(response.message || 'Ticket Category Created Successfully');
                    handleCloseModal();
                    getAllTicketCategories();
                } else {
                    toastError(response.message || 'Failed to Create Ticket Category');
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
            defaultPriority: item.defaultPriority || 'Low'
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingId) {
            setIsLoading(true);
            try {
                const response = await mastersService.deleteTicketCategory(deletingId);
                if (response.status) {
                    toastSuccess(response.message || 'Ticket Category Deleted Successfully');
                    getAllTicketCategories();
                } else {
                    toastError(response.message || 'Failed to Delete Ticket Category');
                }
            } catch (err: any) {
                toastError(err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', description: '', defaultPriority: 'Low' });
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Ticket Categories</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Category
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Priority</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {ticketCategories?.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No ticket categories found</td></tr>
                                    ) : (
                                        ticketCategories?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{item.description || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.defaultPriority === 'High'
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                                        : item.defaultPriority === 'Medium'
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        }`}>
                                                        {item.defaultPriority || 'Low'}
                                                    </span>
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Ticket Category" : "Add Ticket Category"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Category Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Priority</label>
                        <select
                            value={formData.defaultPriority}
                            onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value as any })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
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
                onConfirm={handleConfirmDelete}
                itemName="Ticket Category"
            />
        </>
    );
}
