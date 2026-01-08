'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

interface Permission {
    id: number;
    name: string;
    code: string;
}

interface Role {
    id: number;
    name: string;
    code: string;
    description: string;
    isSystemRole: boolean;
    isActive: boolean;
    permissions?: Permission[];
}

interface RolesMasterViewProps {
    onBack: () => void;
}

export default function RolesMasterView({ onBack }: RolesMasterViewProps) {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const companyId = user?.companyId;

    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        permissionIds: [] as number[]
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

    useEffect(() => {
        getAllRoles();
    }, []);

    const getAllRoles = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.post('/administration/iam/roles/findAll', { companyId });
            if (response.data.success) {
                setRoles(response.data.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to load roles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                companyId: companyId || 0,
                isActive: true,
                isSystemRole: false
            };

            if (editingRole) {
                const response = await apiClient.post('/administration/iam/roles/update', {
                    id: editingRole.id,
                    ...data
                });
                if (response.data.success) {
                    success('Success', 'Role updated successfully');
                    handleCloseModal();
                    getAllRoles();
                }
            } else {
                const response = await apiClient.post('/administration/iam/roles/create', data);
                if (response.data.success) {
                    success('Success', 'Role created successfully');
                    handleCloseModal();
                    getAllRoles();
                }
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to save role');
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            code: role.code,
            description: role.description,
            permissionIds: role.permissions?.map(p => p.id) || []
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingRoleId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingRoleId) {
            try {
                const response = await apiClient.post('/administration/iam/roles/delete', {
                    id: deletingRoleId
                });
                if (response.data.success) {
                    success('Success', 'Role deleted successfully');
                    getAllRoles();
                }
            } catch (error: any) {
                toastError('Error', error.message || 'Failed to delete role');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            permissionIds: []
        });
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Roles</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Role
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Role Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Code</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Type</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Permissions</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {roles?.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No roles found</td></tr>
                                    ) : (
                                        roles?.map((role) => (
                                            <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{role.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">{role.code}</code>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{role.description}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    {role.isSystemRole ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                            System
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                                            Custom
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {role.permissions?.length || 0}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(role)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        {!role.isSystemRole && (
                                                            <button onClick={() => handleDeleteClick(role.id)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingRole ? "Edit Role" : "Add Role"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Role Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Product Manager" />
                    <Input label="Role Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })} required placeholder="e.g., product_manager" />
                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe this role..."
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{editingRole ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Role"
                message="Are you sure you want to delete this role? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}
