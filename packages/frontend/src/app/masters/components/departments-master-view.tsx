'use client';

import { useState, useEffect } from 'react';
import { mastersService, companyService } from '@/lib/api/services';
import { CreateDepartmentModel, UpdateDepartmentModel } from '@adminvault/shared-models';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Department {
    id: number;
    name: string;
    description?: string;
    code?: string;
    status?: string;
    isActive: boolean;
    companyId: number;
}

export default function DepartmentsMasterView({ onBack }: { onBack?: () => void }) {
    const { success: toastSuccess, error: toastError } = useToast();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<{ id: number; name: string } | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', code: '', companyId: '', status: '', isActive: true });

    useEffect(() => {
        getAllDepartments();
        getAllCompanies();
    }, []);

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

    const getAllCompanies = async () => {
        try {
            const response = await companyService.getAllCompanies();
            if (response.status) {
                setCompanies(response.data);
            } else {
                toastError(response.message);
            }
        } catch (error: any) {
            toastError(error.message);
        }
    };

    const getAllDepartments = async () => {
        try {
            const response = await mastersService.getAllDepartments(getCompanyId() as any);
            if (response.status) {
                setDepartments(response.departments || []);
            } else {
                toastError(response.message);
            }
        } catch (error: any) {
            toastError(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingDepartmentId) {
                const model = new UpdateDepartmentModel(
                    editingDepartmentId,
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.code
                );
                const response = await mastersService.updateDepartment(model);
                if (response.status) {
                    toastSuccess(response.message || 'Department Updated Successfully');
                    handleCloseModal();
                    getAllDepartments();
                } else {
                    toastError(response.message || 'Failed to Update Department');
                }
            } else {
                const model = new CreateDepartmentModel(
                    getUserId(),
                    Number(formData.companyId) || getCompanyId(),
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.code,
                    formData.status as any
                );
                const response = await mastersService.createDepartment(model);
                if (response.status) {
                    toastSuccess(response.message);
                    handleCloseModal();
                    getAllDepartments();
                } else {
                    toastError(response.message);
                }
            }
        } catch (error: any) {
            toastError(error.message);
        }
    };

    const handleEdit = (dept: any) => {
        setIsEditMode(true);
        setEditingDepartmentId(dept.id);
        setFormData({ name: dept.name, description: dept.description, code: dept.code, companyId: dept.companyId, status: dept.status, isActive: dept.isActive });
        setIsModalOpen(true);
    };

    const handleDelete = (dept: any) => {
        setDepartmentToDelete({ id: dept.id, name: dept.name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (departmentToDelete) {
            try {
                const response = await mastersService.deleteDepartment(departmentToDelete.id);
                if (response.status) {
                    toastSuccess(response.message);
                    setIsDeleteModalOpen(false);
                    setDepartmentToDelete(null);
                    getAllDepartments();
                } else {
                    toastError(response.message);
                }
            } catch (error: any) {
                toastError(error.message);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingDepartmentId(null);
        setFormData({ name: '', description: '', code: '', companyId: '', status: '', isActive: true });
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Departments</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Department
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Company</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Code</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {departments?.length === 0 ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-slate-500">No departments found</td></tr>
                                    ) : (
                                        departments?.map((d: any) => (
                                            <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{d.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {companies.find(c => c.id === d.companyId)?.companyName || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{d.code || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                        {d.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(d)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(d)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Department" : "Add Department"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Department Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    <Input label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />

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
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName="Department"
            />
        </>
    );
}
