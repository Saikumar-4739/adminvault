'use client';

import { useState, useCallback, useMemo } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum, RoleResponseModel, SSOProvider } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import {
    Search,
    CheckSquare,
    Square,
    Mail,
    Copy,
    Lock,
    Unlock,
    Key,
    UserPlus,
    CreditCard,
    ChevronRight,
    ExternalLink,
    Edit,
    Plus,
    Shield,
    Trash2
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { useIAM } from './hooks/useIAM';

export default function IAMPage() {
    const { error: toastError } = useToast();

    // Auth context
    const { user } = useAuth();
    const companyId = user?.companyId;

    // Custom Hook
    const {
        users,
        allEmployees,
        roles,
        permissions,
        ssoProviders,
        loading,
        createRole,
        updateRole,
        deleteRole,
        createSSOProvider,
        updateSSOProvider,
        deleteSSOProvider,
        assignRoles,
        activateAccount
    } = useIAM(Number(companyId));

    const [activeTab, setActiveTabState] = useState<'users' | 'sso' | 'roles' | 'register'>('users');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    // Edit states
    const [editingSSO, setEditingSSO] = useState<SSOProvider | null>(null);
    const [editingRole, setEditingRole] = useState<RoleResponseModel | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    // Form states
    const [ssoFormData, setSSOFormData] = useState<any>({
        name: '',
        type: '',
        clientId: '',
        clientSecret: '',
        issuerUrl: '',
        authorizationUrl: '',
        tokenUrl: '',
        userInfoUrl: '',
    });

    const [roleFormData, setRoleFormData] = useState<{
        name: string;
        code: string;
        description: string;
        permissionIds: number[];
    }>({
        name: '',
        code: '',
        description: '',
        permissionIds: [],
    });

    const [grantFormData, setGrantFormData] = useState<{ userId: string, roleIds: number[], authType: string, password?: string }>({
        userId: '',
        roleIds: [],
        authType: 'LOCAL',
        password: ''
    });

    // Filtering users
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        return users.filter(u =>
            u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    // Helpers
    const getRoleBadgeColor = useCallback((role: string) => {
        const r = role.toLowerCase();
        if (r.includes('admin')) return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
        if (r.includes('manager')) return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
        return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }, []);

    const getProviderTypeBadge = useCallback((type: string) => {
        const colors: Record<string, string> = {
            'SAML': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
            'OAuth': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            'OIDC': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
            'SSO': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[type] || colors['OIDC']}`}>
                {type}
            </span>
        );
    }, []);

    const getInitials = useCallback((firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    }, []);

    // Handlers
    const handleSSOSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const sanitize = (val: string) => val && val.trim() !== '' ? val.trim() : undefined;

        const data = {
            name: ssoFormData.name,
            type: ssoFormData.type,
            clientId: ssoFormData.clientId,
            clientSecret: ssoFormData.clientSecret, // Required by DB schema usually, keeps as is
            issuerUrl: sanitize(ssoFormData.issuerUrl),
            authorizationUrl: sanitize(ssoFormData.authorizationUrl),
            tokenUrl: sanitize(ssoFormData.tokenUrl),
            userInfoUrl: sanitize(ssoFormData.userInfoUrl),
            companyId: companyId || 0,
            isActive: true,
        };

        let result;
        if (editingSSO) {
            result = await updateSSOProvider({ ...data, id: editingSSO.id });
        } else {
            result = await createSSOProvider(data);
        }

        if (result) {
            setIsSSOModalOpen(false);
            setSSOFormData({ name: '', type: '', clientId: '', clientSecret: '', issuerUrl: '', authorizationUrl: '', tokenUrl: '', userInfoUrl: '' });
            setEditingSSO(null);
        }
    };

    const handleEditSSO = (provider: SSOProvider) => {
        setEditingSSO(provider);
        setSSOFormData({
            name: provider.name,
            type: provider.type,
            clientId: provider.clientId,
            clientSecret: provider.clientSecret || '',
            issuerUrl: provider.issuerUrl || '',
            authorizationUrl: provider.authorizationUrl || '',
            tokenUrl: provider.tokenUrl || '',
            userInfoUrl: provider.userInfoUrl || '',
        });
        setIsSSOModalOpen(true);
    };

    const handleDeleteSSO = async (provider: SSOProvider) => {
        if (confirm(`Delete SSO provider ${provider.name}?`)) {
            await deleteSSOProvider(provider.id);
        }
    };

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...roleFormData,
            companyId: companyId || 0,
            isActive: true,
            isSystemRole: false,
        };

        let result;
        if (editingRole) {
            result = await updateRole({ ...data, id: editingRole.id });
        } else {
            result = await createRole(data);
        }

        if (result) {
            setIsRoleModalOpen(false);
            setRoleFormData({ name: '', code: '', description: '', permissionIds: [] });
            setEditingRole(null);
        }
    };

    const handleEditRole = (role: RoleResponseModel) => {
        setEditingRole(role);
        setRoleFormData({
            name: role.name,
            code: role.code,
            description: role.description || '',
            permissionIds: role.permissions ? role.permissions.map(p => Number(p.id)) : [],
        });
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = async (role: RoleResponseModel) => {
        if (role.isSystemRole) {
            toastError('Error', 'System roles cannot be deleted');
            return;
        }
        if (confirm(`Delete role ${role.name}?`)) {
            await deleteRole(role.id);
        }
    };

    const togglePermission = (permId: number) => {
        setRoleFormData(prev => {
            if (prev.permissionIds.includes(permId)) {
                return { ...prev, permissionIds: prev.permissionIds.filter(id => id !== permId) };
            } else {
                return { ...prev, permissionIds: [...prev.permissionIds, permId] };
            }
        });
    };

    const handleGrantAccessSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantFormData.userId || grantFormData.roleIds.length === 0) {
            toastError("Error", "Please select a user and at least one role");
            return;
        }

        let targetValue = grantFormData.userId;
        let success = false;

        // Handle selection from allEmployees/users
        if (targetValue.startsWith('EMP:')) {
            const employeeId = Number(targetValue.split(':')[1]);
            // Find existing user if any
            const existingPrincipal = users.find(u => Number(u.id) === employeeId);

            if (existingPrincipal && existingPrincipal.userId) {
                // Already has a user account
                success = await assignRoles({
                    userId: Number(existingPrincipal.userId),
                    roleIds: grantFormData.roleIds,
                    companyId: companyId || 0
                });
            } else {
                // New user - activate account
                success = await activateAccount({
                    employeeId: employeeId,
                    roles: grantFormData.roleIds,
                    companyId: companyId || 0,
                    authType: grantFormData.authType,
                    password: grantFormData.password || undefined
                });
            }
        } else if (targetValue) {
            // Probably a raw user ID (fallback)
            success = await assignRoles({
                userId: Number(targetValue),
                roleIds: grantFormData.roleIds,
                companyId: companyId || 0
            });
        }

        if (success) {
            setGrantFormData({ userId: '', roleIds: [], authType: 'LOCAL', password: '' });
            setEditingUser(null);
            setActiveTabState('users');
        }
    };

    const handleEditUser = (user: any) => {
        if (!user.userId) {
            toastError("Cannot edit", "This employee has no user account.");
            return;
        }
        setEditingUser(user);

        let currentRoleIds: number[] = user.roleIds ? user.roleIds.map((id: number) => Number(id)) : [];
        if (currentRoleIds.length === 0 && user.role) {
            const matchedRole = roles.find(r => r.code === user.role || r.name === user.role);
            if (matchedRole) currentRoleIds.push(Number(matchedRole.id));
        }

        setGrantFormData({
            userId: String(user.userId),
            roleIds: currentRoleIds,
            authType: user.authType || 'LOCAL'
        });
        setActiveTabState('register');
    };

    const toggleGrantRole = (roleId: number) => {
        setGrantFormData(prev => {
            if (prev.roleIds.includes(roleId)) {
                return { ...prev, roleIds: prev.roleIds.filter(id => id !== roleId) };
            } else {
                return { ...prev, roleIds: [...prev.roleIds, roleId] };
            }
        });
    };

    const pageContent = (
        <>
            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/20 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">IAM & Admin</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage access control and permissions for your organization</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 min-h-[600px] overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-md p-1">
                                <button
                                    onClick={() => setActiveTabState('users')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Principals
                                </button>
                                <button
                                    onClick={() => setActiveTabState('roles')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'roles' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Roles
                                </button>
                                <button
                                    onClick={() => setActiveTabState('sso')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'sso' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    SSO
                                </button>
                                <button
                                    onClick={() => setActiveTabState('register')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Provisioning
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {activeTab === 'users' && (
                                <Button
                                    onClick={() => {
                                        setEditingUser(null);
                                        setGrantFormData({ userId: '', roleIds: [], authType: 'LOCAL', password: '' });
                                        setActiveTabState('register');
                                    }}
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-slate-900 text-white rounded-xl px-5 h-10 shadow-lg shadow-indigo-100 dark:shadow-none font-bold text-xs"
                                    leftIcon={<Plus className="h-4 w-4" />}
                                >
                                    Provision New
                                </Button>
                            )}
                            {activeTab === 'roles' && (
                                <Button
                                    onClick={() => {
                                        setEditingRole(null);
                                        setRoleFormData({ name: '', code: '', description: '', permissionIds: [] });
                                        setIsRoleModalOpen(true);
                                    }}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 h-9 shadow-sm"
                                    leftIcon={<Plus className="h-4 w-4" />}
                                >
                                    Create Role
                                </Button>
                            )}
                            {activeTab === 'sso' && (
                                <Button
                                    onClick={() => {
                                        setEditingSSO(null);
                                        setSSOFormData({ name: '', type: '', clientId: '', clientSecret: '', issuerUrl: '', authorizationUrl: '', tokenUrl: '', userInfoUrl: '' });
                                        setIsSSOModalOpen(true);
                                    }}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 h-9 shadow-sm"
                                    leftIcon={<Plus className="h-4 w-4" />}
                                >
                                    Add Provider
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content Table Area */}
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 z-10 flex items-center justify-center transition-opacity">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                    <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/50 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-bold tracking-wider">Principal</th>
                                            <th scope="col" className="px-6 py-3 font-bold tracking-wider">Rights / Role</th>
                                            <th scope="col" className="px-6 py-3 font-bold tracking-wider text-center">Contact</th>
                                            <th scope="col" className="px-6 py-3 font-bold tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 font-bold tracking-wider text-right uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                            <Search className="h-8 w-8 text-slate-300" />
                                                        </div>
                                                        <p className="text-slate-400 font-medium tracking-tight">No principals found matching your filter</p>
                                                        <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>Clear Filter</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <tr key={u.id} className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold shadow-sm group-hover:shadow transition-shadow">
                                                                    {getInitials(u.firstName, u.lastName)}
                                                                </div>
                                                                {u.isUserActive && (
                                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{u.firstName} {u.lastName}</span>
                                                                <div className="flex items-center gap-2 group/email">
                                                                    <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{u.email}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(u.email);
                                                                        }}
                                                                        className="opacity-0 group-hover/email:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                                                                        title="Copy Email"
                                                                    >
                                                                        <Copy className="h-3 w-3 text-slate-400" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight border self-start ${getRoleBadgeColor(u.role || '')}`}>
                                                                {u.role || 'Unassigned'}
                                                            </span>
                                                            {u.authType === 'SSO' && (
                                                                <div className="flex items-center gap-1">
                                                                    <Unlock className="h-3 w-3 text-sky-500" />
                                                                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                                                                        {u.ssoProviderName || 'SSO AUTH'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5 ring-1 ring-slate-200 dark:ring-slate-700 px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 font-bold">
                                                                {u.phNumber || '---'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {u.isUserActive ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ACTIVE</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                                <span className="text-xs font-bold text-slate-400">INACTIVE</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditUser(u)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 transition-all uppercase tracking-widest"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" /> Manage
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

                        {activeTab === 'roles' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/30 dark:bg-slate-900/10">
                                {roles.map((role) => (
                                    <div key={role.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 shadow-sm">
                                                        <Shield className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-900 dark:text-white tracking-tight leading-none text-sm">{role.name}</h3>
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 inline-block">{role.code}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {!role.isSystemRole && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditRole(role)}
                                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRole(role)}
                                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2 h-8 font-medium">
                                                {role.description || "No description provided."}
                                            </p>

                                            <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Key className="h-3 w-3 text-slate-300" />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        {role.permissions?.length || 0} Rights
                                                    </span>
                                                </div>
                                                {role.isSystemRole && (
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'sso' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                                {ssoProviders.map((provider) => (
                                    <div key={provider.id} className="group flex flex-col sm:flex-row gap-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow shadow-blue-500/20 shrink-0">
                                            <Unlock className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{provider.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getProviderTypeBadge(provider.type)}
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleEditSSO(provider)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteSSO(provider)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 truncate text-[10px] font-mono text-slate-400">
                                                ID: {provider.clientId}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ssoProviders.length === 0 && (
                                    <div className="lg:col-span-2 flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-200 mb-4">
                                            <CreditCard className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No SSO Providers</h3>
                                        <p className="text-xs text-slate-500 text-center max-w-xs mb-6">Connect external identity systems like Azure AD or Okta.</p>
                                        <Button onClick={() => setIsSSOModalOpen(true)} variant="primary" size="sm">Add Provider</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'register' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl mx-auto py-12 px-6">
                                <form onSubmit={handleGrantAccessSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                                            <UserPlus className="h-5 w-5 text-indigo-600" />
                                            Identity Provisioning
                                        </h2>
                                        <p className="text-[11px] text-slate-500 mt-1 font-bold uppercase tracking-tight">Activate secure system access for organization members.</p>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Member Profile</label>
                                            {editingUser ? (
                                                <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                                            {getInitials(editingUser.firstName, editingUser.lastName)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-sm text-slate-900 dark:text-white tracking-tight">{editingUser.firstName} {editingUser.lastName}</div>
                                                            <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-tighter"><Mail className="h-2.5 w-2.5" /> {editingUser.email}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingUser(null);
                                                            setGrantFormData({ ...grantFormData, userId: '' });
                                                        }}
                                                        className="text-[9px] font-black text-rose-500 uppercase tracking-[0.15em] hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 transition-all"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none cursor-pointer pr-12 font-bold group-hover:bg-slate-50 shadow-sm"
                                                        value={grantFormData.userId}
                                                        onChange={e => setGrantFormData({ ...grantFormData, userId: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Select target employee from directory...</option>
                                                        {allEmployees.map((u: any) => (
                                                            <option key={u.id} value={`EMP:${u.id}`}>
                                                                {u.firstName} {u.lastName} ({u.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 rotate-90" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Auth Strategy</label>
                                                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                                    <button
                                                        type="button"
                                                        onClick={() => setGrantFormData({ ...grantFormData, authType: 'LOCAL' })}
                                                        className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${grantFormData.authType === 'LOCAL' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-indigo-500'}`}
                                                    >
                                                        Local Path
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGrantFormData({ ...grantFormData, authType: 'SSO' })}
                                                        className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${grantFormData.authType === 'SSO' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-indigo-500'}`}
                                                    >
                                                        SSO Bridge
                                                    </button>
                                                </div>
                                            </div>

                                            {grantFormData.authType === 'LOCAL' && (
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Identity Secret</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            placeholder="Set initial password"
                                                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm font-bold"
                                                            value={grantFormData.password}
                                                            onChange={e => setGrantFormData({ ...grantFormData, password: e.target.value })}
                                                        />
                                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Privilege Allocation</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                                                {roles.map(role => (
                                                    <div
                                                        key={role.id}
                                                        onClick={() => toggleGrantRole(Number(role.id))}
                                                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${grantFormData.roleIds.includes(Number(role.id))
                                                            ? 'bg-indigo-50/50 border-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-600 shadow-sm'
                                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {grantFormData.roleIds.includes(Number(role.id))
                                                                ? <CheckSquare className="h-5 w-5 text-indigo-600" />
                                                                : <Square className="h-5 w-5 text-slate-200" />}
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">{role.name}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-70 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded">{role.code}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/20 dark:bg-slate-800/10">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveTabState('users')}
                                            className="px-8 rounded-xl text-[10px] font-black uppercase tracking-widest h-12 shadow-sm border-slate-200 dark:border-slate-700"
                                        >
                                            Dismiss
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="px-12 h-12 bg-indigo-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-200/50 dark:shadow-none transition-all"
                                        >
                                            {editingUser ? 'Sync Identity' : 'Establish Provisioning'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Footer Info Row */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/20">
                            <div>Total Registry: {activeTab === 'users' ? filteredUsers.length : activeTab === 'roles' ? roles.length : activeTab === 'sso' ? ssoProviders.length : 0} Nodes</div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed">Previous Page</button>
                                <button className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed">Next Page</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SSO Modal */}
            <Modal
                isOpen={isSSOModalOpen}
                onClose={() => setIsSSOModalOpen(false)}
                title={editingSSO ? 'Sync Gateway Config' : 'Enlist Identity Provider'}
                size="lg"
            >
                <form onSubmit={handleSSOSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Provider Signature" placeholder="e.g. Corporate Azure" value={ssoFormData.name} onChange={e => setSSOFormData({ ...ssoFormData, name: e.target.value })} required />
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Protocol</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer appearance-none font-bold"
                                value={ssoFormData.type}
                                onChange={e => setSSOFormData({ ...ssoFormData, type: e.target.value })}
                                required
                            >
                                <option value="">Select Handshake...</option>
                                <option value="SAML">SAML 2.0</option>
                                <option value="OAuth">OAuth 2.0</option>
                                <option value="OIDC">OIDC 1.0</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Vault</span>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Identity Key (Client ID)" value={ssoFormData.clientId} onChange={e => setSSOFormData({ ...ssoFormData, clientId: e.target.value })} required />
                            <Input label="Secret (Client Secret)" type="password" value={ssoFormData.clientSecret} onChange={e => setSSOFormData({ ...ssoFormData, clientSecret: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="outline" onClick={() => setIsSSOModalOpen(false)} className="rounded-xl px-6 h-11 text-xs font-bold uppercase tracking-widest">Discard</Button>
                        <Button variant="primary" type="submit" className="rounded-xl px-10 h-11 bg-indigo-600 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">
                            {editingSSO ? 'Sync Provider' : 'Establish Link'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title={editingRole ? 'Sync Security Dimension' : 'Forge New Role Dimension'}
                size="xl"
            >
                <form onSubmit={handleRoleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Role Alias" placeholder="e.g., Security Lead" value={roleFormData.name} onChange={e => setRoleFormData({ ...roleFormData, name: e.target.value })} required />
                                <Input label="Nexus Code" placeholder="SEC_LEAD" value={roleFormData.code} onChange={e => setRoleFormData({ ...roleFormData, code: e.target.value.toUpperCase() })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descriptive Intent</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 min-h-[100px] font-medium"
                                    placeholder="Define the scope and operational limits of this role..."
                                    rows={3}
                                    value={roleFormData.description}
                                    onChange={e => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-inner">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-50 mb-4">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Role Node</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter opacity-70">Logical bundle of system entitlements.</p>
                            <div className="mt-4 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">
                                {roleFormData.permissionIds.length} Rights
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Entitlement Spectrum</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto p-1 custom-scrollbar">
                            {permissions.map(perm => (
                                <div key={perm.id}
                                    onClick={() => togglePermission(Number(perm.id))}
                                    className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 ${roleFormData.permissionIds.includes(Number(perm.id))
                                        ? 'bg-indigo-50/50 border-indigo-400 dark:bg-indigo-900/20 shadow-sm'
                                        : 'bg-white border-slate-100 dark:bg-slate-800 hover:border-indigo-200'
                                        }`}>
                                    <div className={`mt-0.5 ${roleFormData.permissionIds.includes(Number(perm.id)) ? 'text-indigo-600' : 'text-slate-200'}`}>
                                        {roleFormData.permissionIds.includes(Number(perm.id)) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-tight">{perm.name}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter opacity-70 line-clamp-1">{perm.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="outline" onClick={() => setIsRoleModalOpen(false)} className="rounded-xl px-6 h-11 text-xs font-bold uppercase tracking-widest" type="button">Discard</Button>
                        <Button variant="primary" type="submit" className="rounded-xl px-10 h-11 bg-indigo-600 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">
                            {editingRole ? 'Sync Dimension' : 'Establish Role'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            {pageContent}
        </RouteGuard>
    );
}
