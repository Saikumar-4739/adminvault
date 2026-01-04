'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import {
    ShieldAlert,
    Users,
    Key,
    Settings,
    Plus,
    Edit,
    Trash2,
    Shield,
    CheckCircle2,
    XCircle,
    Search,
    Building2,
    Mail,
    Phone,
    Calendar
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchUsers,
    fetchSSOProviders,
    fetchRoles,
    deleteUser as deleteUserAction,
    createSSOProvider as createSSOAction,
    updateSSOProvider as updateSSOAction,
    deleteSSOProvider as deleteSSOAction,
    createRole as createRoleAction,
    updateRole as updateRoleAction,
    deleteRole as deleteRoleAction,
    setActiveTab,
    selectUsers,
    selectSSOProviders,
    selectRoles,
    selectIAMLoading,
    selectActiveTab,
    selectActiveUsers,
    selectActiveSSOProviders,
    selectActiveRoles,
} from '@/store/slices/iamSlice';
import {
    fetchEmployees,
    setSearchQuery,
    selectFilteredEmployees,
    selectEmployeesLoading,
    selectSearchQuery,
    selectEmployeeStats,
} from '@/store/slices/employeesSlice';
import { useToast } from '@/contexts/ToastContext';
import type { SSOProvider, Role } from '@adminvault/shared-services';
import type { Employee } from '@/store/slices/employeesSlice';

export default function IAMPage() {
    const dispatch = useAppDispatch();
    const { success, error: toastError } = useToast();

    // Redux selectors
    const activeTab = useAppSelector(selectActiveTab);
    const users = useAppSelector(selectUsers);
    const ssoProviders = useAppSelector(selectSSOProviders);
    const roles = useAppSelector(selectRoles);
    const isLoading = useAppSelector(selectIAMLoading);
    const activeUsers = useAppSelector(selectActiveUsers);
    const activeSSOProviders = useAppSelector(selectActiveSSOProviders);
    const activeRoles = useAppSelector(selectActiveRoles);

    // Employees (all users including employees)
    const employees = useAppSelector(selectFilteredEmployees);
    const employeesLoading = useAppSelector(selectEmployeesLoading);
    const searchQuery = useAppSelector(selectSearchQuery);
    const employeeStats = useAppSelector(selectEmployeeStats);

    // Modal states
    const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingSSO, setEditingSSO] = useState<SSOProvider | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form states
    const [ssoFormData, setSSOFormData] = useState({
        name: '',
        type: '',
        clientId: '',
        clientSecret: '',
        issuerUrl: '',
        authorizationUrl: '',
        tokenUrl: '',
        userInfoUrl: '',
    });

    const [roleFormData, setRoleFormData] = useState({
        name: '',
        code: '',
        description: '',
    });

    // Get company ID from localStorage
    const getCompanyId = useCallback((): number | undefined => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId ? Number(user.companyId) : undefined;
    }, []);

    const companyId = useMemo(() => getCompanyId(), [getCompanyId]);

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchUsers(companyId));
        dispatch(fetchSSOProviders());
        dispatch(fetchRoles(companyId));
        dispatch(fetchEmployees(companyId));
    }, [dispatch, companyId]);

    // Badge components
    const getStatusBadge = useCallback((status: boolean) => {
        if (status) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800">
                <XCircle className="h-3 w-3" />
                Inactive
            </span>
        );
    }, []);

    const getRoleBadge = useCallback((role: string) => {
        const colors: Record<string, string> = {
            'ADMIN': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
            'MANAGER': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'USER': 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[role] || colors['USER']}`}>
                {role}
            </span>
        );
    }, []);

    const getProviderTypeBadge = useCallback((type: string) => {
        const colors: Record<string, string> = {
            'SAML': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
            'OAuth': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            'OIDC': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[type] || colors['OIDC']}`}>
                {type}
            </span>
        );
    }, []);

    // Handlers
    const handleDeleteUser = useCallback(async (email: string, fullName: string) => {
        if (confirm(`Delete user ${fullName}?`)) {
            const result = await dispatch(deleteUserAction(email)).unwrap();
            if (result.success) {
                success('Success', result.message);
                dispatch(fetchUsers(companyId));
            }
        }
    }, [dispatch, companyId, success]);

    const handleSSOSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...ssoFormData,
            companyId: companyId || 0,
            isActive: true,
        };

        try {
            let result;
            if (editingSSO) {
                result = await dispatch(updateSSOAction({ id: editingSSO.id, data })).unwrap();
            } else {
                result = await dispatch(createSSOAction(data)).unwrap();
            }

            if (result.success) {
                success('Success', result.message);
                setIsSSOModalOpen(false);
                setSSOFormData({
                    name: '',
                    type: '',
                    clientId: '',
                    clientSecret: '',
                    issuerUrl: '',
                    authorizationUrl: '',
                    tokenUrl: '',
                    userInfoUrl: '',
                });
                setEditingSSO(null);
                dispatch(fetchSSOProviders());
            }
        } catch (error: any) {
            toastError('Error', error);
        }
    }, [dispatch, ssoFormData, editingSSO, companyId, success, toastError]);

    const handleEditSSO = useCallback((provider: SSOProvider) => {
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
    }, []);

    const handleDeleteSSO = useCallback(async (provider: SSOProvider) => {
        if (confirm(`Delete SSO provider ${provider.name}?`)) {
            try {
                const result = await dispatch(deleteSSOAction(provider.id)).unwrap();
                if (result.success) {
                    success('Success', result.message);
                    dispatch(fetchSSOProviders());
                }
            } catch (error: any) {
                toastError('Error', error);
            }
        }
    }, [dispatch, success, toastError]);

    const handleRoleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...roleFormData,
            companyId: companyId || 0,
            isActive: true,
            isSystemRole: false,
        };

        try {
            let result;
            if (editingRole) {
                result = await dispatch(updateRoleAction({ id: editingRole.id, data })).unwrap();
            } else {
                result = await dispatch(createRoleAction({ data })).unwrap();
            }

            if (result.success) {
                success('Success', result.message);
                setIsRoleModalOpen(false);
                setRoleFormData({
                    name: '',
                    code: '',
                    description: '',
                });
                setEditingRole(null);
                dispatch(fetchRoles(companyId));
            }
        } catch (error: any) {
            toastError('Error', error);
        }
    }, [dispatch, roleFormData, editingRole, companyId, success, toastError]);

    const handleEditRole = useCallback((role: Role) => {
        setEditingRole(role);
        setRoleFormData({
            name: role.name,
            code: role.code,
            description: role.description || '',
        });
        setIsRoleModalOpen(true);
    }, []);

    const handleDeleteRole = useCallback(async (role: Role) => {
        if (role.isSystemRole) {
            toastError('Error', 'System roles cannot be deleted');
            return;
        }
        if (confirm(`Delete role ${role.name}?`)) {
            try {
                const result = await dispatch(deleteRoleAction(role.id)).unwrap();
                if (result.success) {
                    success('Success', result.message);
                    dispatch(fetchRoles(companyId));
                }
            } catch (error: any) {
                toastError('Error', error);
            }
        }
    }, [dispatch, companyId, success, toastError]);

    const formatDate = useCallback((date?: Date | string) => {
        if (!date) return 'Never';
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return d.toLocaleDateString();
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSearchQuery(e.target.value));
    }, [dispatch]);

    const getInitials = useCallback((firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    }, []);

    const getDepartmentBg = useCallback((emp: Employee) => {
        const deptName = emp.departmentName?.toLowerCase() || '';
        if (!deptName || deptName === 'unknown dept') return 'from-slate-500 to-slate-600';

        if (deptName.includes('it') || deptName.includes('tech') || deptName.includes('dev')) return 'from-blue-500 to-indigo-600';
        if (deptName.includes('hr') || deptName.includes('human')) return 'from-pink-500 to-rose-500';
        if (deptName.includes('finance') || deptName.includes('account')) return 'from-emerald-500 to-teal-600';
        if (deptName.includes('admin')) return 'from-orange-400 to-amber-500';
        if (deptName.includes('sale')) return 'from-violet-500 to-purple-600';
        if (deptName.includes('operation')) return 'from-cyan-500 to-blue-600';
        if (deptName.includes('market')) return 'from-fuchsia-500 to-pink-600';
        if (deptName.includes('support')) return 'from-amber-500 to-orange-600';

        return 'from-slate-500 to-slate-600';
    }, []);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Identity & Access Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            Manage users, roles, and SSO integrations
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500">Total Users</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">{employeeStats.total}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500">Active</div>
                            <div className="text-lg font-bold text-emerald-600">{employeeStats.active}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="flex gap-1 p-2">
                            <button
                                onClick={() => dispatch(setActiveTab('users'))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users'
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Users className="h-4 w-4" />
                                All Users ({employees.length})
                            </button>
                            <button
                                onClick={() => dispatch(setActiveTab('sso'))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'sso'
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Key className="h-4 w-4" />
                                SSO Providers ({ssoProviders.length})
                            </button>
                            <button
                                onClick={() => dispatch(setActiveTab('roles'))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roles'
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Shield className="h-4 w-4" />
                                Roles & Permissions ({roles.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'users' && (
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, department, or phone..."
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                </div>

                                {employeesLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : employees.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="h-12 w-12 text-slate-400 mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No users found</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {searchQuery ? 'Try adjusting your search query' : 'Users will appear here once they are registered'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {employees.map((emp) => (
                                            <div
                                                key={emp.id}
                                                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300"
                                            >
                                                {/* Avatar & Status */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="relative shrink-0">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm bg-gradient-to-br ${getDepartmentBg(emp)}`}>
                                                            {getInitials(emp.firstName, emp.lastName)}
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-800 rounded-full ${emp.empStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                                                            {emp.firstName} {emp.lastName}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                            {emp.departmentName || 'No Department'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Contact Info */}
                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <Mail className="h-3 w-3 shrink-0 opacity-70" />
                                                        <span className="truncate">{emp.email}</span>
                                                    </div>
                                                    {emp.phNumber && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                            <Phone className="h-3 w-3 shrink-0 opacity-70" />
                                                            <span className="truncate">{emp.phNumber}</span>
                                                        </div>
                                                    )}
                                                    {emp.createdAt && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                            <Calendar className="h-3 w-3 shrink-0 opacity-70" />
                                                            <span>Joined {formatDate(emp.createdAt)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Badge */}
                                                <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${emp.empStatus === 'Active'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                            : 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${emp.empStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {emp.empStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'sso' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">SSO Providers</h2>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={<Plus className="h-4 w-4" />}
                                        onClick={() => {
                                            setEditingSSO(null);
                                            setSSOFormData({
                                                name: '',
                                                type: '',
                                                clientId: '',
                                                clientSecret: '',
                                                issuerUrl: '',
                                                authorizationUrl: '',
                                                tokenUrl: '',
                                                userInfoUrl: '',
                                            });
                                            setIsSSOModalOpen(true);
                                        }}
                                    >
                                        Add Provider
                                    </Button>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : ssoProviders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Key className="h-12 w-12 text-slate-400 mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No SSO providers configured</h3>
                                        <p className="text-sm text-slate-500 mt-1">Add an SSO provider to enable single sign-on</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ssoProviders.map((provider) => (
                                            <div
                                                key={provider.id}
                                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                            <Key className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                                                            <div className="mt-1">{getProviderTypeBadge(provider.type)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditSSO(provider)}
                                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSSO(provider)}
                                                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <div className="text-sm text-slate-500">
                                                        Status
                                                    </div>
                                                    {getStatusBadge(provider.isActive)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'roles' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Roles & Permissions</h2>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={<Plus className="h-4 w-4" />}
                                        onClick={() => {
                                            setEditingRole(null);
                                            setRoleFormData({
                                                name: '',
                                                code: '',
                                                description: '',
                                            });
                                            setIsRoleModalOpen(true);
                                        }}
                                    >
                                        Create Role
                                    </Button>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : roles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Shield className="h-12 w-12 text-slate-400 mb-3" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No roles configured</h3>
                                        <p className="text-sm text-slate-500 mt-1">Create roles to manage user permissions</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                                            <Shield className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{role.name}</h3>
                                                            <p className="text-xs text-slate-500 mt-1">{role.description || 'No description'}</p>
                                                        </div>
                                                    </div>
                                                    {!role.isSystemRole && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleEditRole(role)}
                                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRole(role)}
                                                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-slate-500">
                                                            Permissions: <span className="font-semibold text-slate-900 dark:text-white">
                                                                {role.permissions?.length || 0}
                                                            </span>
                                                        </div>
                                                        {role.isSystemRole && (
                                                            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                                System Role
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SSO Modal */}
                <Modal isOpen={isSSOModalOpen} onClose={() => setIsSSOModalOpen(false)} title={editingSSO ? 'Edit SSO Provider' : 'Add SSO Provider'} size="lg">
                    <form onSubmit={handleSSOSubmit} className="space-y-4">
                        <Input
                            label="Provider Name"
                            placeholder="Google Workspace"
                            value={ssoFormData.name}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, name: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Provider Type</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={ssoFormData.type}
                                onChange={(e) => setSSOFormData({ ...ssoFormData, type: e.target.value })}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="SAML">SAML</option>
                                <option value="OAuth">OAuth</option>
                                <option value="OIDC">OIDC</option>
                            </select>
                        </div>
                        <Input
                            label="Client ID"
                            placeholder="Enter client ID"
                            value={ssoFormData.clientId}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, clientId: e.target.value })}
                            required
                        />
                        <Input
                            label="Client Secret"
                            type="password"
                            placeholder="Enter client secret"
                            value={ssoFormData.clientSecret}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, clientSecret: e.target.value })}
                            required={!editingSSO}
                        />
                        <Input
                            label="Issuer URL"
                            placeholder="https://accounts.google.com"
                            value={ssoFormData.issuerUrl}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, issuerUrl: e.target.value })}
                        />
                        <Input
                            label="Authorization URL"
                            placeholder="https://accounts.google.com/o/oauth2/v2/auth"
                            value={ssoFormData.authorizationUrl}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, authorizationUrl: e.target.value })}
                        />
                        <Input
                            label="Token URL"
                            placeholder="https://oauth2.googleapis.com/token"
                            value={ssoFormData.tokenUrl}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, tokenUrl: e.target.value })}
                        />
                        <Input
                            label="User Info URL"
                            placeholder="https://www.googleapis.com/oauth2/v1/userinfo"
                            value={ssoFormData.userInfoUrl}
                            onChange={(e) => setSSOFormData({ ...ssoFormData, userInfoUrl: e.target.value })}
                        />
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsSSOModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingSSO ? 'Update Provider' : 'Add Provider'}</Button>
                        </div>
                    </form>
                </Modal>

                {/* Role Modal */}
                <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="lg">
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                        <Input
                            label="Role Name"
                            placeholder="Custom Manager"
                            value={roleFormData.name}
                            onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Role Code"
                            placeholder="CUSTOM_MANAGER"
                            value={roleFormData.code}
                            onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value.toUpperCase() })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                rows={3}
                                placeholder="Describe the role's purpose and responsibilities"
                                value={roleFormData.description}
                                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingRole ? 'Update Role' : 'Create Role'}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
};

export default IAMPage;
