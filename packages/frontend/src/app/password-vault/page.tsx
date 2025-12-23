'use client';

import { useState, useEffect } from 'react';
import { useMasters } from '@/hooks/useMasters';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Search, Plus, Lock, Eye, EyeOff, Copy, Check, Pencil, Trash2, Key, Shield, AlertTriangle } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

export default function PasswordVaultPage() {
    const { passwordVaults, isLoading, createPasswordVault, updatePasswordVault, deletePasswordVault, fetchPasswordVaults } = useMasters();
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', password: '', username: '', url: '', notes: '', description: '' });

    useEffect(() => {
        fetchPasswordVaults();
    }, [fetchPasswordVaults]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                const result = await updatePasswordVault({ ...formData, id: editingItem.id, isActive: true });
                if (result) {
                    success('Password updated successfully');
                    handleCloseModal();
                }
            } else {
                const result = await createPasswordVault(formData);
                if (result) {
                    success('Password created successfully');
                    handleCloseModal();
                }
            }
        } catch (err) {
            error('An error occurred');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
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

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this password?')) {
            try {
                const result = await deletePasswordVault(id);
                if (result) {
                    success('Password deleted successfully');
                }
            } catch (err) {
                error('Failed to delete password');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', password: '', username: '', url: '', notes: '', description: '' });
    };

    const togglePasswordVisibility = (id: number) => {
        const newSet = new Set(visiblePasswords);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setVisiblePasswords(newSet);
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredVaults = passwordVaults.filter(vault =>
        vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vault.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: passwordVaults.length,
        secured: passwordVaults.filter(v => v.password && v.password.length >= 8).length,
        weak: passwordVaults.filter(v => v.password && v.password.length < 8).length,
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                            Password Vault
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Securely manage your passwords
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search passwords..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={() => setIsModalOpen(true)}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            Add Password
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Passwords"
                        value={stats.total}
                        icon={Key}
                        gradient="from-indigo-500 to-violet-600"
                        iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Secured"
                        value={stats.secured}
                        icon={Shield}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Weak Passwords"
                        value={stats.weak}
                        icon={AlertTriangle}
                        gradient="from-rose-500 to-red-600"
                        iconBg="bg-rose-50 dark:bg-rose-900/20"
                        iconColor="text-rose-600 dark:text-rose-400"
                        isLoading={isLoading}
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                ) : filteredVaults.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Lock className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No passwords found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVaults.map((vault) => (
                            <Card key={vault.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white dark:bg-slate-800">
                                <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-90 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                                </div>

                                <div className="px-6 pb-6 relative">
                                    <div className="-mt-12 mb-4">
                                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                                            <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
                                                <Lock className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                            {vault.name}
                                        </h3>
                                        {vault.username && (
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                                {vault.username}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center justify-between gap-2">
                                            <input
                                                type={visiblePasswords.has(vault.id) ? 'text' : 'password'}
                                                value={vault.password}
                                                readOnly
                                                className="flex-1 text-xs font-mono bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border-0"
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => togglePasswordVisibility(vault.id)}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                                >
                                                    {visiblePasswords.has(vault.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(vault.password, vault.id)}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                                >
                                                    {copiedId === vault.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                        {vault.url && (
                                            <div className="text-xs text-slate-500 dark:text-slate-500 truncate">
                                                {vault.url}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                            <button onClick={() => handleEdit(vault)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 hover:text-indigo-600 transition-colors">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(vault.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-600 hover:text-rose-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Password' : 'Add Password'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Gmail Account" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="username@example.com" />
                            <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="••••••••" />
                        </div>
                        <Input label="URL" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={handleCloseModal} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingItem ? 'Update Password' : 'Create Password'}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
}
