'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { mastersService, employeeService } from '@/lib/api/services';
import { UserRoleEnum, CreatePasswordVaultModel } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus, Lock, Eye, EyeOff, Copy, Check, ShieldCheck, Globe, User, Wand2, LayoutGrid, List, ArrowUpRight, Users, Activity } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import PasswordGenerator from '@/components/vault/PasswordGenerator';

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
    const [passwordVaults, setPasswordVaults] = useState<PasswordVault[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [isVaultLoading, setIsVaultLoading] = useState(false);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', password: '', username: '', url: '', notes: '', description: '', employeeId: ''
    });

    const fetchPasswordVaults = useCallback(async () => {
        if (!user?.companyId) return;
        setIsVaultLoading(true);
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response: any = await mastersService.getAllPasswordVaults(req);
            if (response.status) {
                setPasswordVaults(response.passwordVaults || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch password vaults');
        } finally {
            setIsVaultLoading(false);
        }
    }, [user?.companyId]);

    const fetchEmployees = useCallback(async () => {
        if (!user?.companyId) return;
        setIsEmployeesLoading(true);
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await employeeService.getAllEmployees(req as any);
            if (response.status) {
                const data = (response as any).employees || (response as any).data || [];
                setEmployees(data);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch employees');
        } finally {
            setIsEmployeesLoading(false);
        }
    }, [user?.companyId]);

    const fetchApplications = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await mastersService.getAllApplications(req);
            if (response.status) {
                const data = (response as any).applications || (response as any).data || [];
                setApplications(data);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch applications');
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchPasswordVaults();
        fetchEmployees();
        fetchApplications();
    }, [fetchPasswordVaults, fetchEmployees, fetchApplications]);

    const categories = ['All', 'Work', 'Social', 'Personal', 'Finance'];

    // Map employees for quick lookups
    const employeeMap = useMemo(() => {
        return new Map(employees.map(emp => [emp.id.toString(), `${emp.firstName} ${emp.lastName}`]));
    }, [employees]);

    const filteredVaults = useMemo(() => {
        return (passwordVaults || []).filter(vault => {
            const employeeName = vault.description ? employeeMap.get(vault.description) || '' : '';
            const matchesSearch = vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vault.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vault.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employeeName.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeCategory === 'All') return matchesSearch;
            const categoryMatch = vault.notes?.toLowerCase().includes(activeCategory.toLowerCase()) ||
                vault.name.toLowerCase().includes(activeCategory.toLowerCase());
            return matchesSearch && categoryMatch;
        });
    }, [passwordVaults, searchQuery, activeCategory, employeeMap]);

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
            description: vault.description || '', // We use description to store employeeId
            employeeId: vault.description || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVaultLoading(true);
        try {
            // We store the employeeId in the description field for the office purpose
            const payload = { ...formData, description: formData.employeeId };

            if (modalMode === 'edit' && editingItem) {
                const response = await mastersService.updatePasswordVault({
                    ...payload,
                    id: editingItem.id,
                    isActive: true
                } as any);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Vault record updated');
                    setIsModalOpen(false);
                    fetchPasswordVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Operation failed');
                }
            } else {
                const model = new CreatePasswordVaultModel(
                    user?.id || 1,
                    user?.companyId || 1,
                    payload.name,
                    payload.password,
                    payload.description,
                    true,
                    payload.username,
                    payload.url,
                    payload.notes
                );
                const response = await mastersService.createPasswordVault(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Added to vault successfully');
                    setIsModalOpen(false);
                    fetchPasswordVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Operation failed');
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Operation failed');
        } finally {
            setIsVaultLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to permanently remove this from your vault?')) {
            setIsVaultLoading(true);
            try {
                const req = new IdRequestModel(id);
                const response = await mastersService.deletePasswordVault(req);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Removed from vault');
                    fetchPasswordVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Delete failed');
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message || 'Delete failed');
            } finally {
                setIsVaultLoading(false);
            }
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

    const getStrength = (pwd: string) => {
        if (!pwd) return 0;
        if (pwd.length < 8) return 1;
        if (pwd.length < 12) return 2;
        return 3;
    };

    const StrengthRing = ({ pwd }: { pwd: string }) => {
        const strength = getStrength(pwd);
        const colors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
        const textColors = ['text-slate-400', 'text-rose-500', 'text-amber-500', 'text-emerald-500'];

        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className={`w-1.5 h-1.5 rounded-full ${colors[strength]}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${textColors[strength]}`}>
                    {strength === 1 ? 'Weak' : strength === 2 ? 'Mod' : 'High'}
                </span>
            </div>
        );
    };

    const adminStats = useMemo(() => {
        const uniqueEmployees = new Set(passwordVaults.map(v => v.description).filter(Boolean));
        return [
            { label: 'Total Accounts', value: passwordVaults.length, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Employees Covered', value: uniqueEmployees.size, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Average Entropy', value: 'High', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' }
        ];
    }, [passwordVaults]);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-6 max-w-[1800px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md rotate-2 hover:rotate-0 transition-transform duration-300">
                            <Lock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Password Vault</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Identity & Access Registry</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Locate secret..."
                                className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm h-9 items-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => setIsGeneratorOpen(true)}
                            leftIcon={<Wand2 className="w-3.5 h-3.5" />}
                            className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest"
                        >
                            Entropy Engine
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleOpenCreate}
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                            className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md shadow-indigo-500/20"
                        >
                            New Entry
                        </Button>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {adminStats.map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-indigo-500 transition-colors">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeCategory === cat
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Vault Grid/List */}
                {isVaultLoading || isEmployeesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-56 bg-white dark:bg-slate-900 animate-pulse rounded-[32px] border border-slate-200 dark:border-slate-800" />
                        ))}
                    </div>
                ) : filteredVaults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                            <Lock className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No employee passwords found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Try searching for a different employee or add a new application entry.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                        : "space-y-4 max-w-5xl mx-auto"
                    }>
                        {filteredVaults.map((vault) => {
                            const empName = vault.description ? employeeMap.get(vault.description) : null;
                            const appInitial = vault.name.charAt(0).toUpperCase();

                            return (
                                <div
                                    key={vault.id}
                                    className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 rounded-2xl overflow-hidden ${viewMode === 'list' ? 'p-4 flex items-center gap-4' : 'p-5 flex flex-col'}`}
                                >
                                    {/* Employee Badge (Corner Floating) */}
                                    <div className="absolute top-3 right-5">
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100/50 dark:border-indigo-800/50">
                                            <User className="w-2.5 h-2.5 text-indigo-600" />
                                            <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 tracking-wider truncate max-w-[80px]">
                                                {empName || 'Shared'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Header / Icon */}
                                    <div className={`shrink-0 flex items-center justify-between mb-4 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                            {appInitial}
                                        </div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <StrengthRing pwd={vault.password} />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{vault.name}</h3>
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                                    <Globe className="w-2.5 h-2.5" />
                                                    <span className="truncate">{vault.url || 'Internal Asset'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Identity Detail */}
                                        <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Access Identity</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{vault.username || '—'}</p>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(vault.username || '', vault.id)}
                                                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Secret Zone */}
                                        <div className="mt-2.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group/pass shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                                    {visiblePasswords.has(vault.id) ? vault.password : '••••••••••••'}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/pass:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); togglePasswordVisibility(vault.id); }}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400"
                                                    >
                                                        {visiblePasswords.has(vault.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(vault.password, vault.id)}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400"
                                                    >
                                                        {copiedId === vault.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleOpenEdit(vault)}
                                                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                            >
                                                Maintain
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vault.id)}
                                                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}



                {/* Modals */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === 'edit' ? 'Maintain Application Record' : 'Vault New Identity'}
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
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Global Application</label>
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
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Application</option>
                                    {applications.map(app => (
                                        <option key={app.id} value={app.name}>{app.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="App Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <div className="relative group/mpy">
                                <Input
                                    label="App Password"
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
                            label="Service URL"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Admin Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Discard</Button>
                            <Button variant="primary" type="submit" className="px-12 font-black">
                                {modalMode === 'edit' ? 'Save Changes' : 'Protect Secret'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={isGeneratorOpen}
                    onClose={() => setIsGeneratorOpen(false)}
                    title="Entropy Engine"
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
            </div>
        </RouteGuard>
    );
};


export default PasswordVaultPage;