'use client';

import { useState, useEffect } from 'react';
import { useMasters } from '@/hooks/useMasters';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ApplicationsMasterView({ onBack }: { onBack?: () => void }) {
    const { applications, isLoading, createApplication, updateApplication, deleteApplication, fetchApplications } = useMasters();
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', ownerName: '', appReleaseDate: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                appReleaseDate: formData.appReleaseDate ? new Date(formData.appReleaseDate) : undefined
            };

            if (isEditMode && editingId) {
                const result = await updateApplication({ ...submitData, id: editingId });
                if (result) {
                    success('Application Updated Successfully');
                    handleCloseModal();
                } else {
                    error('Failed to Update Application');
                }
            } else {
                const result = await createApplication(submitData);
                if (result) {
                    success('Application Created Successfully');
                    handleCloseModal();
                } else {
                    error('Failed to Create Application');
                }
            }
        } catch (err) {
            error('An error occurred');
        }
    };

    const handleEdit = (item: any) => {
        setIsEditMode(true);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || '',
            ownerName: item.ownerName || '',
            appReleaseDate: item.appReleaseDate ? new Date(item.appReleaseDate).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingId) {
            try {
                const result = await deleteApplication(deletingId);
                if (result) {
                    success('Application Deleted Successfully');
                } else {
                    error('Failed to Delete Application');
                }
            } catch (err) {
                error('An error occurred');
            }
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', description: '', ownerName: '', appReleaseDate: '' });
    };

    const formatDate = (date: any) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    if (isLoading && applications.length === 0) return <PageLoader />;

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Applications</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="sm" variant="outline" onClick={onBack}>
                                â† Back to Masters
                            </Button>
                        )}
                        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Application
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Application Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Owner Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">App Release Date</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Last Update</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {applications?.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No applications found</td></tr>
                                    ) : (
                                        applications?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{item.ownerName || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{formatDate(item.appReleaseDate)}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{formatDate(item.updatedAt)}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(item.id)} className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Application" : "Add Application"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Application Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    <Input label="Owner Name" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} />
                    <Input label="App Release Date" type="date" value={formData.appReleaseDate} onChange={(e) => setFormData({ ...formData, appReleaseDate: e.target.value })} />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Application"
                message="Are you sure you want to delete this application? This action cannot be undone."
                variant="danger"
            />
        </>
    );
}
