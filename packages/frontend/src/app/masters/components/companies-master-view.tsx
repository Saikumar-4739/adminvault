'use client';

import { useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function CompaniesMasterView({ onAddClick, onBack }: { onAddClick?: () => void, onBack?: () => void }) {
    const { companies, createCompany, updateCompany, deleteCompany, isLoading } = useCompanies();
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ companyName: '', location: '', email: '', phone: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingCompanyId) {
                const result = await updateCompany({ ...formData, id: editingCompanyId, estDate: new Date() });
                if (result) {
                    success('Company Updated Successfully');
                    handleCloseModal();
                } else {
                    error('Failed to Update Company');
                }
            } else {
                const result = await createCompany({ ...formData, estDate: new Date() });
                if (result) {
                    success('Company Created Successfully');
                    handleCloseModal();
                } else {
                    error('Failed to Create Company');
                }
            }
        } catch (err) {
            error('An error occurred');
        }
    };

    const handleEdit = (company: any) => {
        setIsEditMode(true);
        setEditingCompanyId(company.id);
        setFormData({
            companyName: company.companyName,
            location: company.location || '',
            email: company.email || '',
            phone: company.phone || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingCompanyId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingCompanyId) {
            const result = await deleteCompany({ id: deletingCompanyId });
            if (result) {
                success('Company Deleted Successfully');
            } else {
                error('Failed to Delete Company');
            }
            setDeletingCompanyId(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingCompanyId(null);
        setFormData({ companyName: '', location: '', email: '', phone: '' });
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Companies</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="sm" variant="outline" onClick={onBack}>
                                â† Back to Masters
                            </Button>
                        )}
                        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Company
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Company Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Location</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Email</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Phone Number</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {companies?.length === 0 ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-slate-500">No companies found</td></tr>
                                    ) : (
                                        companies?.map((company: any, index: number) => (
                                            <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{company.companyName}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{company.location || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {company.email || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {company.phone || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(company)} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(company.id)} className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Company" : "Add Company"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
                    <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    <Input label="Contact Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <Input label="Contact Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
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
                title="Delete Company"
                message="Are you sure you want to delete this company? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}
