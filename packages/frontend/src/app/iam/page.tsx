'use client';

import { useState, useCallback, useMemo } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum, RoleResponseModel, SSOProvider } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    CheckCircle2,
    XCircle,
    Search,
    CheckSquare,
    Square
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
        assignRoles
    } = useIAM(Number(companyId));

    const [activeTab, setActiveTabState] = useState<'users' | 'sso' | 'roles'>('users');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);

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

    const [grantFormData, setGrantFormData] = useState<{ userId: string, roleIds: number[] }>({ userId: '', roleIds: [] });

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

        let targetUserId = grantFormData.userId;

        // Handle new user activation (EMP: prefix)
        if (targetUserId.toString().startsWith('EMP:')) {
            const employeeId = targetUserId.split(':')[1];
            // TODO: Call activation endpoint here
            toastError("Not Implemented", `User activation for Employee #${employeeId} is coming soon.`);
            return;
        }

        const success = await assignRoles({
            userId: Number(targetUserId),
            roleIds: grantFormData.roleIds,
            companyId: companyId || 0
        });

        if (success) {
            setIsGrantAccessModalOpen(false);
            setGrantFormData({ userId: '', roleIds: [] });
            setEditingUser(null);
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
            roleIds: currentRoleIds
        });
        setIsGrantAccessModalOpen(true);
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

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
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
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 min-h-[600px]">
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
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {activeTab === 'users' && (
                                <Button
                                    onClick={() => {
                                        setEditingUser(null);
                                        setGrantFormData({ userId: '', roleIds: [] });
                                        setIsGrantAccessModalOpen(true);
                                    }}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 h-9 shadow-sm"
                                    leftIcon={<Plus className="h-4 w-4" />}
                                >
                                    Grant Access
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
                    <div className="relative overflow-x-auto">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 z-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Principal</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Role</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Contact</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No principals found matching your filter
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                            {getInitials(user.firstName, user.lastName)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900 dark:text-white text-sm">{user.firstName} {user.lastName}</span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-2">
                                                                {user.email}
                                                                {user.authType === 'SSO' && (
                                                                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-1.5 rounded-[4px] text-[10px] font-semibold tracking-wide">
                                                                        {user.ssoProviderName || 'SSO'}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono">
                                                    {user.phNumber || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.status ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                            <XCircle className="h-3.5 w-3.5" /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">Edit</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'roles' && (
                            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Role Title</th>
                                        <th scope="col" className="px-6 py-3 font-medium">ID / Code</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Permissions</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Description</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    {role.isSystemRole && <Shield className="h-3.5 w-3.5 text-amber-500" />}
                                                    {role.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {role.code}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-slate-100 dark:bg-slate-900 rounded px-2 py-1">
                                                    {role.permissions?.length || 0} assigned
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate" title={role.description}>
                                                {role.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                {!role.isSystemRole && (
                                                    <>
                                                        <button onClick={() => handleEditRole(role)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteRole(role)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-rose-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {role.isSystemRole && <span className="text-xs text-slate-400 italic">System</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'sso' && (
                            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Provider Name</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Type</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Client ID</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ssoProviders.map((provider) => (
                                        <tr key={provider.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {provider.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getProviderTypeBadge(provider.type)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {provider.clientId}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => handleEditSSO(provider)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteSSO(provider)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-rose-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Footer / Pagination (Mock) */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                        <div>Showing {activeTab === 'users' ? filteredUsers.length : activeTab === 'roles' ? roles.length : ssoProviders.length} items</div>
                        <div className="flex gap-2">
                            <button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>

                {/* SSO Modal */}
                <Modal isOpen={isSSOModalOpen} onClose={() => setIsSSOModalOpen(false)} title={editingSSO ? 'Edit SSO Provider' : 'Add SSO Provider'} size="lg">
                    <form onSubmit={handleSSOSubmit} className="space-y-4">
                        <Input label="Name" value={ssoFormData.name} onChange={e => setSSOFormData({ ...ssoFormData, name: e.target.value })} required />
                        <div>
                            <label className="block text-sm font-bold mb-2">Type</label>
                            <select className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800" value={ssoFormData.type} onChange={e => setSSOFormData({ ...ssoFormData, type: e.target.value })} required>
                                <option value="">Select Type</option>
                                <option value="SAML">SAML</option>
                                <option value="OAuth">OAuth</option>
                                <option value="OIDC">OIDC</option>
                            </select>
                        </div>
                        <Input label="Client ID" value={ssoFormData.clientId} onChange={e => setSSOFormData({ ...ssoFormData, clientId: e.target.value })} required />
                        <Input label="Client Secret" type="password" value={ssoFormData.clientSecret} onChange={e => setSSOFormData({ ...ssoFormData, clientSecret: e.target.value })} />
                        <Input label="Issuer URL" value={ssoFormData.issuerUrl} onChange={e => setSSOFormData({ ...ssoFormData, issuerUrl: e.target.value })} />
                        <Input label="Authorization URL" value={ssoFormData.authorizationUrl} onChange={e => setSSOFormData({ ...ssoFormData, authorizationUrl: e.target.value })} />
                        <Input label="Token URL" value={ssoFormData.tokenUrl} onChange={e => setSSOFormData({ ...ssoFormData, tokenUrl: e.target.value })} />
                        <Input label="User Info URL" value={ssoFormData.userInfoUrl} onChange={e => setSSOFormData({ ...ssoFormData, userInfoUrl: e.target.value })} />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsSSOModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingSSO ? 'Update' : 'Add'}</Button>
                        </div>
                    </form>
                </Modal>

                {/* Role Modal */}
                <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={editingRole ? 'Edit Role' : 'Create Role'} size="xl">
                    <form onSubmit={handleRoleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Role Name" value={roleFormData.name} onChange={e => setRoleFormData({ ...roleFormData, name: e.target.value })} required />
                            <Input label="Role Code" value={roleFormData.code} onChange={e => setRoleFormData({ ...roleFormData, code: e.target.value.toUpperCase() })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Description</label>
                            <textarea className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800" rows={2} value={roleFormData.description} onChange={e => setRoleFormData({ ...roleFormData, description: e.target.value })} />
                        </div>

                        <div>
                            <h3 className="font-bold text-sm mb-3">Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                {permissions.map(perm => (
                                    <div key={perm.id}
                                        onClick={() => togglePermission(Number(perm.id))}
                                        className={`cursor-pointer p-3 rounded-lg border transition-all flex items-start gap-3 ${roleFormData.permissionIds.includes(Number(perm.id))
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                                            : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-indigo-300'
                                            }`}>
                                        <div className={`mt-0.5 ${roleFormData.permissionIds.includes(Number(perm.id)) ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {roleFormData.permissionIds.includes(Number(perm.id)) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{perm.name}</div>
                                            <div className="text-xs text-slate-500">{perm.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingRole ? 'Update Role' : 'Create Role'}</Button>
                        </div>
                    </form>
                </Modal>

                {/* Grant Access Modal */}
                <Modal isOpen={isGrantAccessModalOpen} onClose={() => setIsGrantAccessModalOpen(false)} title="Grant Access" size="md">
                    <form onSubmit={handleGrantAccessSubmit} className="space-y-4">
                        {!editingUser && (
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Select Principal (Employee)</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                                    value={grantFormData.userId}
                                    onChange={e => setGrantFormData({ ...grantFormData, userId: e.target.value })}
                                    required
                                >
                                    <option value="">Select an employee...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.userId || `EMP:${u.id}`} className={!u.userId ? 'text-slate-500 italic' : ''}>
                                            {u.firstName} {u.lastName} ({u.email}) {!u.userId && '(No Account)'}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Select an employee to grant access. Employees without an account will need activation.</p>
                            </div>
                        )}

                        {editingUser && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {getInitials(editingUser.firstName, editingUser.lastName)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{editingUser.firstName} {editingUser.lastName}</div>
                                    <div className="text-xs text-slate-500">{editingUser.email}</div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Assign Roles</label>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                                {roles.map((role) => (
                                    <label key={role.id} className={`flex items-center p-3 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ${grantFormData.roleIds.includes(Number(role.id)) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                        <input
                                            type="checkbox"
                                            value={role.id}
                                            checked={grantFormData.roleIds.includes(Number(role.id))}
                                            onChange={() => toggleGrantRole(Number(role.id))}
                                            className="mr-3 h-4 w-4 text-blue-600 rounded"
                                        />
                                        <div>
                                            <div className="text-sm font-medium">{role.name} <span className="text-xs text-slate-400">({role.code})</span></div>
                                            <div className="text-xs text-slate-500">{role.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
                            <Button variant="outline" onClick={() => setIsGrantAccessModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
}
