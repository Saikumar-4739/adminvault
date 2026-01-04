'use client';

import { useState, useEffect } from 'react';
import { useMasters } from '@/hooks/useMasters';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function PasswordVaultMasterView({ onBack }: { onBack?: () => void }) {
    const { passwordVaults, isLoading, createPasswordVault, updatePasswordVault, deletePasswordVault, fetchPasswordVaults } = useMasters();
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', password: '', username: '', url: '', notes: '', description: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [hasClosedModal, setHasClosedModal] = useState(false);

    useEffect(() => {
        fetchPasswordVaults();
    }, [fetchPasswordVaults]);

    // Auto-open Add Password modal when vault is empty (only once)
    useEffect(() => {
        if (!isLoading && passwordVaults?.length === 0 && !isModalOpen && !hasClosedModal) {
            setIsModalOpen(true);
        }
    }, [isLoading, passwordVaults, isModalOpen, hasClosedModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingId) {
                const result = await updatePasswordVault({ ...formData, id: editingId, isActive: true });
                if (result) {
                    success('Password Vault Updated Successfully');
                    handleCloseModal();
                } else {
                    error('Failed to Update Password Vault');
                }
            } else {
                const result = await createPasswordVault(formData);
                if (result) {
                    success('Password Vault Created Successfully');
                    handleCloseModal();
                } else {
                    error('Failed to Create Password Vault');
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
            password: item.password,
            username: item.username || '',
            url: item.url || '',
            notes: item.notes || '',
            description: item.description || ''
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
                const result = await deletePasswordVault(deletingId);
                if (result) {
                    success('Password Vault Deleted Successfully');
                } else {
                    error('Failed to Delete Password Vault');
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
        setFormData({ name: '', password: '', username: '', url: '', notes: '', description: '' });
        setHasClosedModal(true); // Prevent auto-reopen after user closes
    };

    const togglePasswordVisibility = (id: number) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const copyToClipboard = async (text: string, id: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            success('Password copied to clipboard');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            error('Failed to copy password');
        }
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Password Vault</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="sm" variant="outline" onClick={onBack}>
                                â† Back to Masters
                            </Button>
                        )}
                        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Password
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
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Username</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Password</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">URL</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Notes</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {passwordVaults?.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No passwords found</td></tr>
                                    ) : (
                                        passwordVaults?.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{item.username || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-mono text-slate-900 dark:text-white">
                                                            {visiblePasswords.has(item.id) ? item.password : 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(item.id)}
                                                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                            title={visiblePasswords.has(item.id) ? "Hide password" : "Show password"}
                                                        >
                                                            {visiblePasswords.has(item.id) ? (
                                                                <EyeOff className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(item.password, item.id)}
                                                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                            title="Copy password"
                                                        >
                                                            {copiedId === item.id ? (
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                                                    {item.url ? (
                                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                            {item.url.length > 30 ? item.url.substring(0, 30) + '...' : item.url}
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                                                    {item.notes ? (item.notes.length > 30 ? item.notes.substring(0, 30) + '...' : item.notes) : '-'}
                                                </td>
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Password" : "Add Password"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., AWS Production Account" />
                    <Input label="Password" type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Enter password" />
                    <Input label="Username/Email" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Optional" />
                    <Input label="URL" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                            rows={3}
                            placeholder="Additional information"
                        />
                    </div>
                    <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />

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
                title="Delete Password"
                message="Are you sure you want to delete this password? This action cannot be undone."
                variant="danger"
            />
        </>
    );
}
