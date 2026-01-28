'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserRoleEnum, CreatePasswordVaultModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { PasswordVaultService, ApplicationService, EmployeesService, AuthUsersService } from '@adminvault/shared-services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Plus, Eye, EyeOff, Copy, Check, Globe, Wand2, Pencil, Trash2, ArrowLeft, Lock, Unlock } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { PasswordGenerator } from '@/components/vault/PasswordGenerator';

interface PasswordVault {
    id: number;
    name: string;
    password: string;
    description?: string;
    username?: string;
    url?: string;
    notes?: string;
    isActive: boolean;
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

const PasswordVaultPage: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter(); // Initialize router
    const [passwordVaults, setPasswordVaults] = useState<PasswordVault[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    // Lock Screen State
    const [isLocked, setIsLocked] = useState(true);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockError, setUnlockError] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const passwordVaultService = new PasswordVaultService();
    const applicationService = new ApplicationService();
    const employeesService = new EmployeesService();
    const authService = new AuthUsersService();
    const [formData, setFormData] = useState({ name: '', password: '', username: '', url: '', notes: '', description: '', employeeId: '' });

    const fetchPasswordVaults = async () => {
        try {
            const response: any = await passwordVaultService.getAllPasswordVaults();
            if (response.status) {
                setPasswordVaults(response.passwordVaults || response.data || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    }

    const fetchEmployees = async () => {
        if (!user?.companyId) return;
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await employeesService.getAllEmployees(req as any);
            if (response.status) {
                const data = response.data || [];
                setEmployees(data);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    };

    const fetchApplications = async () => {
        if (!user?.companyId) return;
        try {
            const response = await applicationService.getAllApplications();
            if (response.status) {
                const data = (response as any).applications || (response as any).data || [];
                setApplications(data);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    }

    useEffect(() => {
        fetchPasswordVaults();
        fetchEmployees();
        fetchApplications();
    }, []);

    const employeeMap = useMemo(() => {
        return new Map(employees.map(emp => [emp.id.toString(), `${emp.firstName} ${emp.lastName}`]));
    }, [employees]);

    const filteredVaults = useMemo(() => {
        return (passwordVaults || []).filter(vault => {
        });
    }, [passwordVaults, employeeMap]);

    const handleOpenCreate = () => {
        setModalMode('create');
        setEditingItem(null);
        setFormData({ name: '', password: '', username: '', url: '', notes: '', description: '', employeeId: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (vault: any) => {
        setModalMode('edit');
        setEditingItem(vault);
        setFormData({
            name: vault.name,
            password: vault.password,
            username: vault.username || '',
            url: vault.url || '',
            notes: vault.notes || '',
            description: vault.description || '',
            employeeId: vault.description || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, description: formData.employeeId };

            if (modalMode === 'edit' && editingItem) {
                const response = await passwordVaultService.updatePasswordVault({
                    ...payload,
                    id: editingItem.id,
                    isActive: true
                } as any);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    setIsModalOpen(false);
                    fetchPasswordVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreatePasswordVaultModel(user?.id || 1, user?.companyId || 1, payload.name, payload.password, payload.description, true, payload.username, payload.url, payload.notes);
                const response = await passwordVaultService.createPasswordVault(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    setIsModalOpen(false);
                    fetchPasswordVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    };

    const handleDelete = (id: number) => {
        const item = passwordVaults.find(p => p.id === id);
        if (item) {
            setItemToDelete(item);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const req = new IdRequestModel(itemToDelete.id);
            const response = await passwordVaultService.deletePasswordVault(req);
            if (response.status) {
                AlertMessages.getSuccessMessage('Removed from vault');
                fetchPasswordVaults();
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            } else {
                AlertMessages.getErrorMessage(response.message || 'Delete failed');
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Delete failed');
        }
    };

    const togglePasswordVisibility = (id: number) => {
        const next = new Set(visiblePasswords);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setVisiblePasswords(next);
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setUnlockError('');
        setIsUnlocking(true);
        try {
            const response = await authService.verifyPassword(unlockPassword);
            if (response.status) {
                setIsLocked(false);
                setUnlockPassword('');
            } else {
                setUnlockError(response.message || 'Incorrect password');
            }
        } catch (error: any) {
            setUnlockError(error.message || 'Failed to verify password');
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="h-full p-4 relative">
                {isLocked && (
                    <div className="absolute inset-0 z-50 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                        <Card className="w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                            <CardHeader className="text-center pb-2 pt-6">
                                <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                    <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vault Locked</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Enter your password to access credentials</p>
                            </CardHeader>
                            <CardContent className="pt-4 pb-6 px-6">
                                <form onSubmit={handleUnlock} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            placeholder="Enter your login password"
                                            value={unlockPassword}
                                            onChange={(e) => setUnlockPassword(e.target.value)}
                                            className="text-center"
                                            autoFocus
                                        />
                                        {unlockError && (
                                            <p className="text-xs text-red-500 text-center font-medium">{unlockError}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        disabled={!unlockPassword || isUnlocking}
                                        isLoading={isUnlocking}
                                        leftIcon={<Unlock className="h-4 w-4" />}
                                    >
                                        Unlock Vault
                                    </Button>
                                    <div className="text-center">
                                        <Button variant="ghost" size="xs" type="button" onClick={() => router.back()}>
                                            Go Back
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
                <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[calc(100vh-2rem)] flex flex-col p-0">
                    <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Password Vault</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button size="xs" variant="secondary" onClick={() => setIsGeneratorOpen(true)} leftIcon={<Wand2 className="h-3.5 w-3.5" />}>
                                Generator
                            </Button>
                            <Button size="xs" variant="primary" onClick={() => router.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                            <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
                                Add Entry
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-4">
                        <div className="overflow-x-auto h-full">
                            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Application Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Employee</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Username</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Password</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">URL</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {filteredVaults.map((vault) => {
                                        const empName = vault.description ? employeeMap.get(vault.description) : 'Shared';
                                        return (
                                            <tr key={vault.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{vault.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{empName}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span>{vault.username || '-'}</span>
                                                        {vault.username && (
                                                            <button onClick={() => copyToClipboard(vault.username || '', vault.id)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                                                <Copy className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center justify-center gap-2 group">
                                                        <span>{visiblePasswords.has(vault.id) ? vault.password : '••••••••'}</span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => togglePasswordVisibility(vault.id)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                                                {visiblePasswords.has(vault.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                            </button>
                                                            <button onClick={() => copyToClipboard(vault.password, vault.id)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                                                {copiedId === vault.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                                                    {vault.url ? (
                                                        <a href={vault.url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 hover:text-indigo-500 hover:underline">
                                                            <Globe className="h-3 w-3" />
                                                            <span className="truncate">{vault.url}</span>
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${vault.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                                                        }`}>
                                                        {vault.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleOpenEdit(vault)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(vault.id)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === 'edit' ? 'Edit Entry' : 'Add New Entry'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Target Employee</label>
                                <select
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Application</label>
                                <select
                                    value={formData.name}
                                    onChange={(e) => {
                                        const app = applications.find(a => a.name === e.target.value);
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                            url: app?.url || formData.url
                                        });
                                    }}
                                    required
                                    className="w-full px-4 py-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select Application</option>
                                    {applications.map(app => (
                                        <option key={app.id} value={app.name}>{app.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <div className="relative group/mpy">
                                <Input
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsGeneratorOpen(true)}
                                    className="absolute right-3 top-9 text-[9px] font-bold text-indigo-600 uppercase tracking-widest opacity-0 group-hover/mpy:opacity-100 transition-opacity"
                                >
                                    Gen
                                </button>
                            </div>
                        </div>

                        <Input
                            label="URL"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">
                                {modalMode === 'edit' ? 'Update' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={isGeneratorOpen}
                    onClose={() => setIsGeneratorOpen(false)}
                    title="Password Generator"
                    size="lg"
                >
                    <PasswordGenerator
                        onPasswordGenerated={(pwd) => {
                            setFormData(prev => ({ ...prev, password: pwd }));
                            setIsGeneratorOpen(false);
                            if (!isModalOpen) handleOpenCreate();
                        }}
                    />
                </Modal>
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setItemToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Credential"
                    itemName={itemToDelete ? itemToDelete.name : undefined}
                    description="Are you sure you want to permanently remove this credential from your vault? This action cannot be undone."
                />
            </div>
        </RouteGuard >
    );
};

export default PasswordVaultPage;