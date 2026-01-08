'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

interface Permission {
    id: number;
    name: string;
    code: string;
    description: string;
    resource: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE';
    isActive: boolean;
}

interface PermissionsMasterViewProps {
    onBack: () => void;
}

export default function PermissionsMasterView({ onBack }: PermissionsMasterViewProps) {
    const { success, error: toastError } = useToast();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        resource: '',
        action: 'READ' as 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE'
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingPermissionId, setDeletingPermissionId] = useState<number | null>(null);

    useEffect(() => {
        getAllPermissions();
    }, []);

    const getAllPermissions = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.post('/administration/iam/permissions/findAll');
            if (response.data.success) {
                setPermissions(response.data.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to load permissions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPermission) {
                const response = await apiClient.post('/administration/iam/permissions/update', {
                    id: editingPermission.id,
                    ...formData
                });
                if (response.data.success) {
                    success('Success', 'Permission updated successfully');
                    handleCloseModal();
                    getAllPermissions();
                }
            } else {
                const response = await apiClient.post('/administration/iam/permissions/create', formData);
                if (response.data.success) {
                    success('Success', 'Permission created successfully');
                    handleCloseModal();
                    getAllPermissions();
                }
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to save permission');
        }
    };

    const handleEdit = (permission: Permission) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            code: permission.code,
            description: permission.description,
            resource: permission.resource,
            action: permission.action
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingPermissionId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingPermissionId) {
            try {
                const response = await apiClient.post('/administration/iam/permissions/delete', {
                    id: deletingPermissionId
                });
                if (response.data.success) {
                    success('Success', 'Permission deleted successfully');
                    getAllPermissions();
                }
            } catch (error: any) {
                toastError('Error', error.message || 'Failed to delete permission');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPermission(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            resource: '',
            action: 'READ'
        });
    };

    const getActionBadgeColor = (action: string) => {
        const colors: Record<string, string> = {
            'CREATE': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'READ': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'UPDATE': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'DELETE': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'EXECUTE': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        };
        return colors[action] || colors['READ'];
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Permissions</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Permission
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Permission Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Code</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Resource</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Action</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {permissions?.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No permissions found</td></tr>
                                    ) : (
                                        permissions?.map((permission) => (
                                            <tr key={permission.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{permission.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">{permission.code}</code>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded text-xs font-semibold">
                                                        {permission.resource}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${getActionBadgeColor(permission.action)}`}>
                                                        {permission.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{permission.description}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(permission)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(permission.id)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPermission ? "Edit Permission" : "Add Permission"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Permission Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Create Products" />
                        <Input label="Permission Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '.') })} required placeholder="e.g., product.create" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Resource" value={formData.resource} onChange={(e) => setFormData({ ...formData, resource: e.target.value })} required placeholder="e.g., Product" />
                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Action</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={formData.action}
                                onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                                required
                            >
                                <option value="CREATE">CREATE</option>
                                <option value="READ">READ</option>
                                <option value="UPDATE">UPDATE</option>
                                <option value="DELETE">DELETE</option>
                                <option value="EXECUTE">EXECUTE</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what this permission allows..."
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{editingPermission ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Permission"
                message="Are you sure you want to delete this permission? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </>
    );
}
