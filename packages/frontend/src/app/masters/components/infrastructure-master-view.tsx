'use client';

import { useState, useEffect, useRef } from 'react';
import { CreateInfrastructureMasterModel, UpdateInfrastructureMasterModel, InfrastructureMaster, CompanyIdRequestModel } from '@adminvault/shared-models';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { InfrastructureService } from '@adminvault/shared-services';

interface InfrastructureMasterViewProps {
    onBack?: () => void;
}

export const InfrastructureMasterView: React.FC<InfrastructureMasterViewProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [infrastructure, setInfrastructure] = useState<InfrastructureMaster[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ deviceName: '', serialNumber: '', description: '', purchaseDate: '', status: '', isActive: true });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const infrastructureService = new InfrastructureService();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current && user?.companyId) {
            initialized.current = true;
            getAllInfrastructure();
        }
    }, [user?.companyId]);

    const getAllInfrastructure = async (): Promise<void> => {
        if (!user?.companyId) return;
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await infrastructureService.getAllInfrastructure(req);
            if (response.status) {
                setInfrastructure(response.data || []);
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
                const model = new UpdateInfrastructureMasterModel(
                    editingId,
                    formData.deviceName,
                    formData.serialNumber,
                    formData.description,
                    formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
                    formData.isActive
                );
                const response = await infrastructureService.updateInfrastructure(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllInfrastructure();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreateInfrastructureMasterModel(
                    user.id,
                    user.companyId,
                    formData.deviceName,
                    formData.serialNumber,
                    formData.description,
                    formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
                    formData.isActive ?? true
                );
                const response = await infrastructureService.createInfrastructure(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllInfrastructure();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    };

    const handleEdit = (item: InfrastructureMaster): void => {
        setIsEditMode(true);
        setEditingId(item.id);
        const purchaseDateStr = item.purchaseDate
            ? (typeof item.purchaseDate === 'string' ? item.purchaseDate.split('T')[0] : new Date(item.purchaseDate).toISOString().split('T')[0])
            : '';

        setFormData({
            deviceName: item.deviceName,
            serialNumber: item.serialNumber,
            description: item.description || '',
            purchaseDate: purchaseDateStr,
            status: '',
            isActive: item.isActive ?? true
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number): void => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (deletingId) {
            try {
                const response = await infrastructureService.deleteInfrastructure({ id: deletingId });
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    getAllInfrastructure();
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
        setFormData({ deviceName: '', serialNumber: '', description: '', purchaseDate: '', status: '', isActive: true });
    };

    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    return (
        <>
            <Card className="border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Infrastructure</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Infrastructure
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                    <div className="overflow-x-auto h-full">
                        <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Device Name</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Serial Number</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Purchase Date</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {infrastructure?.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No records found</td></tr>
                                ) : (
                                    infrastructure?.map((item: InfrastructureMaster) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.deviceName}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{item.serialNumber}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{item.description || '-'}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{formatDate(item.purchaseDate)}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${item.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                                                    }`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
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
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Infrastructure" : "Add Infrastructure"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Device Name" value={formData.deviceName} onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })} className="h-14" required />
                    <Input label="Serial Number" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} className="h-14" required />
                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-14" />
                    <Input label="Purchase Date" type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="h-14" />

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
                onConfirm={handleConfirmDelete}
                itemName="Infrastructure"
            />
        </>
    );
}
