'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { iamService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

interface RolesMasterTabProps {
    roles: any[];
    onRefresh: () => void;
}

export const RolesMasterTab: React.FC<RolesMasterTabProps> = ({ roles, onRefresh }) => {
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<any>(null);

    const [formData, setFormData] = useState({
        key: '',
        label: '',
        description: '',
        isActive: true
    });

    const handleOpenModal = (role?: any) => {
        if (role) {
            setIsEditMode(true);
            setEditingRole(role);
            setFormData({
                key: role.key,
                label: role.label,
                description: role.description || '',
                isActive: role.isActive
            });
        } else {
            setIsEditMode(false);
            setEditingRole(null);
            setFormData({ key: '', label: '', description: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (isEditMode) {
                res = await iamService.updateRole(editingRole.id, formData);
            } else {
                res = await iamService.createRole(formData);
            }

            if (res.status) {
                toast.success(res.message || `Role ${isEditMode ? 'updated' : 'created'}`);
                setIsModalOpen(false);
                onRefresh();
            } else {
                toast.error(res.message || "Operation failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Error saving role");
        }
    };

    const handleDelete = async () => {
        if (!roleToDelete) return;
        try {
            const res = await iamService.deleteRole(roleToDelete.id);
            if (res.status) {
                toast.success("Role deleted successfully");
                setIsDeleteModalOpen(false);
                onRefresh();
            }
        } catch (error: any) {
            toast.error("Failed to delete role");
        }
    };

    return (
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Role Management</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Create and Manage System Roles</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    variant="primary"
                >
                    Add Role
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse compact-table">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Label</th>
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Key</th>
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                    <td className="p-3 text-xs font-bold text-slate-900 dark:text-white">{role.label}</td>
                                    <td className="p-3 text-xs text-center font-mono text-indigo-600 dark:text-indigo-400">{role.key}</td>
                                    <td className="p-3 text-xs text-slate-500">{role.description}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${role.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {role.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleOpenModal(role)} className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => { setRoleToDelete(role); setIsDeleteModalOpen(true); }} className="p-1.5 rounded bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Role" : "Create Role"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Role Label" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} required />
                    <Input label="Role Key" value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })} required disabled={isEditMode} />
                    <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} id="roleActive" />
                        <label htmlFor="roleActive" className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName="Role"
            />
        </Card>
    );
};
