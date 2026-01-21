'use client';

import { useState, useMemo, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum, RoleResponseModel, SSOProvider } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import {
    Users,
    Shield,
    Key,
    Globe,
    Layout,
    Plus,
    RefreshCw,
    Search,
    MoreHorizontal,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Settings,
    Box,
    FileText,
    AppWindow,
    Share2,
    Home
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { useIAM } from './hooks/useIAM';

type IAMView = 'overview' | 'users' | 'roles' | 'permissions' | 'applications' | 'external-identities' | 'domains';

export default function IAMPage() {
    const { user } = useAuth();
    const companyId = user?.companyId;
    const {
        users,
        allEmployees,
        roles,
        permissions,
        ssoProviders,
        allMenusTree,
        scopes,
        loading,
        createRole,
        updateRole,
        deleteRole,
        createSSOProvider,
        updateSSOProvider,
        deleteSSOProvider,
        activateAccount,
        createMenu,
        updateMenu,
        createScope,
        updateScope,
        deleteScope,
        createPermission,
        updatePermission,
        deletePermission,
        refresh
    } = useIAM(Number(companyId));

    const [currentView, setCurrentView] = useState<IAMView>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // --- Modal States ---
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleResponseModel | null>(null);
    const [roleFormData, setRoleFormData] = useState<any>({ name: '', code: '', description: '', permissionIds: [], menuIds: [], userRole: UserRoleEnum.USER });

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [provisioningUser, setProvisioningUser] = useState<any | null>(null);
    const [provisionFormData, setProvisionFormData] = useState<any>({ roleIds: [], authType: 'LOCAL', password: '' });

    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<any | null>(null);
    const [menuFormData, setMenuFormData] = useState<any>({ label: '', code: '', parentId: null, path: '', icon: 'Circle', sortOrder: 0, requiredPermissionCode: '' });

    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [editingPerm, setEditingPerm] = useState<any | null>(null);
    const [permFormData, setPermFormData] = useState<any>({ name: '', code: '', description: '', resource: '', action: 'READ' });

    const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
    const [editingSSO, setEditingSSO] = useState<SSOProvider | null>(null);
    const [ssoFormData, setSSOFormData] = useState<any>({ name: '', type: 'OIDC', clientId: '', clientSecret: '', issuerUrl: '', authorizationUrl: '', tokenUrl: '', userInfoUrl: '' });

    // --- Handlers ---

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingRole
            ? await updateRole({ id: Number(editingRole.id), ...roleFormData })
            : await createRole({ ...roleFormData, companyId: Number(companyId) });
        if (success) { setIsRoleModalOpen(false); refresh(); }
    };

    const handleProvisionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!provisioningUser) return;
        const res = await activateAccount({
            employeeId: provisioningUser.id,
            roles: provisionFormData.roleIds,
            companyId: Number(companyId),
            authType: provisionFormData.authType,
            password: provisionFormData.password
        });
        if (res) { setIsUserModalOpen(false); refresh(); }
    };

    const handleMenuSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingMenu ? await updateMenu({ id: editingMenu.id, ...menuFormData }) : await createMenu(menuFormData);
        if (success) { setIsAppModalOpen(false); refresh(); }
    };

    const handlePermSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingPerm ? await updatePermission({ id: editingPerm.id, ...permFormData }) : await createPermission(permFormData);
        if (success) { setIsPermModalOpen(false); refresh(); }
    };

    const handleSSOSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingSSO ? await updateSSOProvider({ id: editingSSO.id, ...ssoFormData }) : await createSSOProvider({ ...ssoFormData, companyId: Number(companyId) });
        if (success) { setIsSSOModalOpen(false); refresh(); }
    };


    // --- Helpers ---
    const flattenedMenus = useMemo(() => {
        const flatten = (items: any[]): any[] => items.reduce((acc, item) => [...acc, item, ...(item.children ? flatten(item.children) : [])], []);
        return flatten(allMenusTree);
    }, [allMenusTree]);

    // --- Render Logic ---

    const renderSidebar = () => (
        <div className="w-64 bg-slate-50 border-r border-slate-200 h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-700">Identity</h2>
                <p className="text-xs text-slate-500">Contoso Directory</p>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
                <div className="mb-2">
                    <button
                        onClick={() => setCurrentView('overview')}
                        className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'overview' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Home className="w-4 h-4 mr-3" />
                        Overview
                    </button>
                </div>

                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Manage</div>

                <button
                    onClick={() => setCurrentView('users')}
                    className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'users' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Users className="w-4 h-4 mr-3" />
                    Users
                </button>
                <button
                    onClick={() => setCurrentView('roles')}
                    className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'roles' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Shield className="w-4 h-4 mr-3" />
                    Roles and administrators
                </button>
                <button
                    onClick={() => setCurrentView('applications')}
                    className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'applications' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <AppWindow className="w-4 h-4 mr-3" />
                    Enterprise applications
                </button>
                <button
                    onClick={() => setCurrentView('permissions')}
                    className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'permissions' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Key className="w-4 h-4 mr-3" />
                    App registrations (Permissions)
                </button>
                <button
                    onClick={() => setCurrentView('domains')}
                    className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'domains' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Globe className="w-4 h-4 mr-3" />
                    Custom domain names
                </button>

                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">External Identities</div>

                <button
                    onClick={() => setCurrentView('external-identities')}
                    className={`w-full flex items-center px-4 py-2 text-sm ${currentView === 'external-identities' ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Share2 className="w-4 h-4 mr-3" />
                    All identity providers
                </button>
            </nav>
        </div>
    );

    const renderHeader = (title: string, actions?: React.ReactNode) => (
        <div className="flex flex-col border-b border-slate-200 bg-white px-6 py-4">
            <div className="text-xl font-semibold text-slate-800 mb-4">{title}</div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {actions}
                    <button onClick={() => refresh()} className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded w-64 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-6">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium text-slate-600">Total Users</div>
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{users.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Managed identities</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium text-slate-600">Roles Configured</div>
                        <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{roles.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Custom & System roles</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors shadow-sm">
                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs inline-block mb-2 font-semibold">Free Tier</div>
                    <div className="text-sm text-slate-600">Identity Secure Score</div>
                    <div className="mt-2 text-2xl font-bold text-slate-800">0%</div>
                </div>
            </div>

            <div className="mt-8">
                <h4 className="text-sm font-medium text-slate-800 mb-3">Quick actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => { setCurrentView('users'); }} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Add user</span>
                    </button>
                    <button onClick={() => { setCurrentView('roles'); setIsRoleModalOpen(true); }} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Create role</span>
                    </button>
                    <button onClick={() => { setCurrentView('applications'); setIsAppModalOpen(true); }} className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                            <Layout className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">New application</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => {
        const filteredEmployees = allEmployees.filter(e =>
            e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="h-full flex flex-col">
                {renderHeader("All Users", (
                    <button className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New User
                    </button>
                ))}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Display Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User Principal Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredEmployees.map((emp) => {
                                const isUser = users.some(u => u.email.toLowerCase() === emp.email.toLowerCase());
                                return (
                                    <tr key={emp.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                                                    {emp.firstName[0]}
                                                </div>
                                                <div className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emp.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">Member</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isUser ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                    Unlicensed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!isUser && (
                                                <button
                                                    onClick={() => { setProvisioningUser(emp); setProvisionFormData({ roleIds: [], authType: 'LOCAL', password: '' }); setIsUserModalOpen(true); }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Assign License
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderRoles = () => {
        const filtered = roles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
            <div className="h-full flex flex-col">
                {renderHeader("Roles and administrators", (
                    <button
                        onClick={() => { setEditingRole(null); setRoleFormData({ name: '', code: '', description: '', permissionIds: [], menuIds: [], userRole: UserRoleEnum.USER }); setIsRoleModalOpen(true); }}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Role
                    </button>
                ))}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filtered.map((role) => (
                                <tr key={role.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => { setEditingRole(role); setRoleFormData({ ...role, permissionIds: role.permissions?.map((p: any) => p.id) || [], menuIds: (role as any).menus?.map((m: any) => m.id) || [] }); setIsRoleModalOpen(true); }}>
                                        {role.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 max-w-xs truncate" title={role.description}>{role.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{role.isSystemRole ? 'Built-in' : 'Custom'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono text-xs">{role.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!role.isSystemRole && (
                                            <button onClick={() => deleteRole(Number(role.id))} className="text-red-600 hover:text-red-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    };

    const renderRolesModal = () => (
        <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Role definition" className="max-w-4xl">
            <div className="flex h-[600px]">
                {/* Left Panel - Basics */}
                <div className="w-1/3 border-r border-slate-200 pr-4 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800">Basics</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-600">Display Name <span className="text-red-500">*</span></label>
                            <Input
                                value={roleFormData.name}
                                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                                className="mt-1 h-8 text-sm"
                                placeholder="e.g. Helpdesk Administrator"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Description</label>
                            <textarea
                                value={roleFormData.description}
                                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                className="mt-1 w-full border border-slate-300 rounded text-sm p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Code</label>
                            <Input
                                value={roleFormData.code}
                                onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value })}
                                className="mt-1 h-8 text-sm bg-slate-50"
                                placeholder="ROLE_HELPDESK"
                            />
                        </div>
                    </div>
                </div>

                {/* Middle Panel - Permissions */}
                <div className="w-1/3 border-r border-slate-200 px-4 space-y-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-800">Permissions</h3>
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded">
                        {permissions.map(p => (
                            <div
                                key={p.id}
                                className={`p-2 border-b border-slate-100 flex items-start gap-2 cursor-pointer hover:bg-slate-50 ${roleFormData.permissionIds.includes(Number(p.id)) ? 'bg-blue-50' : ''}`}
                                onClick={() => {
                                    const id = Number(p.id);
                                    const newIds = roleFormData.permissionIds.includes(id)
                                        ? roleFormData.permissionIds.filter((pid: number) => pid !== id)
                                        : [...roleFormData.permissionIds, id];
                                    setRoleFormData({ ...roleFormData, permissionIds: newIds });
                                }}
                            >
                                <input type="checkbox" checked={roleFormData.permissionIds.includes(Number(p.id))} readOnly className="mt-1" />
                                <div>
                                    <div className="text-xs font-medium text-slate-700">{p.name}</div>
                                    <div className="text-[10px] text-slate-500">{p.resource}:{p.action}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Menus */}
                <div className="w-1/3 pl-4 space-y-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-800">Menu Access</h3>
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded">
                        {flattenedMenus.map(m => (
                            <div
                                key={m.id}
                                className={`p-2 border-b border-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-50 ${roleFormData.menuIds.includes(Number(m.id)) ? 'bg-blue-50' : ''}`}
                                onClick={() => {
                                    const id = Number(m.id);
                                    const newIds = roleFormData.menuIds.includes(id)
                                        ? roleFormData.menuIds.filter((mid: number) => mid !== id)
                                        : [...roleFormData.menuIds, id];
                                    setRoleFormData({ ...roleFormData, menuIds: newIds });
                                }}
                            >
                                <input type="checkbox" checked={roleFormData.menuIds.includes(Number(m.id))} readOnly />
                                <div className="text-xs font-medium text-slate-700">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                <button onClick={handleRoleSubmit} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                    {editingRole ? 'Update' : 'Create'}
                </button>
            </div>
        </Modal>
    );

    const renderApplications = () => {
        return (
            <div className="h-full flex flex-col">
                {renderHeader("Enterprise applications", (
                    <button
                        onClick={() => { setEditingMenu(null); setMenuFormData({ label: '', code: '', parentId: null, path: '', icon: 'Circle', sortOrder: 0, requiredPermissionCode: '' }); setIsAppModalOpen(true); }}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Application
                    </button>
                ))}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-slate-500">Name</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-500">Path/URL</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-500">Code</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-500">Order</th>
                                <th className="px-6 py-3 text-right font-medium text-slate-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {flattenedMenus.map(menu => (
                                <tr key={menu.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded bg-slate-100 flex items-center justify-center mr-3 text-slate-500`}>
                                                <AppWindow className="w-4 h-4" />
                                            </div>
                                            <div className="font-medium text-slate-900">{menu.label}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 font-mono text-xs">{menu.path || 'N/A'}</td>
                                    <td className="px-6 py-3 text-slate-600">{menu.code}</td>
                                    <td className="px-6 py-3 text-slate-600">{menu.sortOrder}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => { setEditingMenu(menu); setMenuFormData(menu); setIsAppModalOpen(true); }} className="text-blue-600 hover:text-blue-800 mr-2 opacity-0 group-hover:opacity-100"><Edit3 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderPermissions = () => (
        <div className="h-full flex flex-col">
            {renderHeader("App registrations (Permissions)", (
                <button
                    onClick={() => { setEditingPerm(null); setPermFormData({ name: '', code: '', description: '', resource: '', action: 'READ' }); setIsPermModalOpen(true); }}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Registration
                </button>
            ))}
            <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Display name</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Application (client) ID</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Resource</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {permissions.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 group cursor-pointer" onClick={() => { setEditingPerm(p); setPermFormData(p); setIsPermModalOpen(true); }}>
                                <td className="px-6 py-3 font-medium text-blue-600 hover:underline">{p.name}</td>
                                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{p.code}</td>
                                <td className="px-6 py-3 text-slate-600">{p.resource}</td>
                                <td className="px-6 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 uppercase">
                                        {p.action}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderExternalIdentities = () => (
        <div className="h-full flex flex-col">
            {renderHeader("External Identities", (
                <button
                    onClick={() => { setEditingSSO(null); setSSOFormData({ name: '', type: 'OIDC', clientId: '', clientSecret: '', issuerUrl: '', authorizationUrl: '', tokenUrl: '', userInfoUrl: '' }); setIsSSOModalOpen(true); }}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Provider
                </button>
            ))}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ssoProviders.map((p) => (
                    <div key={p.id} className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300">
                        <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingSSO(p); setSSOFormData(p); setIsSSOModalOpen(true); }} className="text-slate-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <h4 className="font-semibold text-slate-900">{p.name}</h4>
                        <div className="text-xs text-slate-500 mt-1 uppercase font-medium">{p.type}</div>

                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Client ID</span>
                                <span className="font-mono text-slate-700">{p.clientId.substring(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Status</span>
                                <span className="text-green-600 font-medium">Enabled</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- Main Layout ---
    return (
        <RouteGuard>
            <div className="flex h-screen bg-white">
                {renderSidebar()}
                <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
                    {/* Top Bar can go here if needed specifically for IAM app shell, but MainLayout has one. We'll stick to breadcrumb style headers in content. */}
                    <main className="flex-1 overflow-hidden relative">
                        {currentView === 'overview' && renderOverview()}
                        {currentView === 'users' && renderUsers()}
                        {currentView === 'roles' && renderRoles()}
                        {currentView === 'applications' && renderApplications()}
                        {currentView === 'permissions' && renderPermissions()}
                        {currentView === 'external-identities' && renderExternalIdentities()}

                        {/* Modals */}
                        {renderRolesModal()}

                        {/* Simple Generic Modal for App/Perm/SSO/User - To save space I'll inline the simple ones or make a generic reusable component but for now I'll just put the user modal here */}
                        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="New User">
                            <form onSubmit={handleProvisionSubmit} className="space-y-4">
                                {provisioningUser && (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-sm mb-4">
                                        You are assigning a license to <strong>{provisioningUser.email}</strong>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Authentication Method</label>
                                    <select className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded border" value={provisionFormData.authType} onChange={e => setProvisionFormData({ ...provisionFormData, authType: e.target.value })}>
                                        <option value="LOCAL">Local Password</option>
                                        <option value="SSO">Single Sign-On</option>
                                    </select>
                                </div>
                                {provisionFormData.authType === 'LOCAL' && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Password</label>
                                        <Input type="password" value={provisionFormData.password} onChange={e => setProvisionFormData({ ...provisionFormData, password: e.target.value })} className="mt-1" required />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Roles</label>
                                    <div className="mt-2 text-xs text-slate-500 italic">Roles can be managed later in the Roles blade.</div>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Create</button>
                                </div>
                            </form>
                        </Modal>

                        {/* App Modal */}
                        <Modal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} title="Application Registration">
                            <form onSubmit={handleMenuSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Display Name</label>
                                        <Input value={menuFormData.label} onChange={e => setMenuFormData({ ...menuFormData, label: e.target.value })} className="mt-1 h-8 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Code</label>
                                        <Input value={menuFormData.code} onChange={e => setMenuFormData({ ...menuFormData, code: e.target.value })} className="mt-1 h-8 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Path</label>
                                    <Input value={menuFormData.path} onChange={e => setMenuFormData({ ...menuFormData, path: e.target.value })} className="mt-1 h-8 text-sm" placeholder="/..." />
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsAppModalOpen(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </Modal>

                        {/* Perm Modal */}
                        <Modal isOpen={isPermModalOpen} onClose={() => setIsPermModalOpen(false)} title="Permission Registration">
                            <form onSubmit={handlePermSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Permission Name</label>
                                        <Input value={permFormData.name} onChange={e => setPermFormData({ ...permFormData, name: e.target.value })} className="mt-1 h-8 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Code</label>
                                        <Input value={permFormData.code} onChange={e => setPermFormData({ ...permFormData, code: e.target.value })} className="mt-1 h-8 text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Resource</label>
                                        <Input value={permFormData.resource} onChange={e => setPermFormData({ ...permFormData, resource: e.target.value })} className="mt-1 h-8 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Action</label>
                                        <select className="mt-1 block w-full pl-3 pr-10 py-1.5 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded border bg-white" value={permFormData.action} onChange={e => setPermFormData({ ...permFormData, action: e.target.value })}>
                                            <option value="READ">READ</option>
                                            <option value="CREATE">CREATE</option>
                                            <option value="UPDATE">UPDATE</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </Modal>

                        {/* SSO Modal */}
                        <Modal isOpen={isSSOModalOpen} onClose={() => setIsSSOModalOpen(false)} title="Identity Provider">
                            <form onSubmit={handleSSOSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Name</label>
                                    <Input value={ssoFormData.name} onChange={e => setSSOFormData({ ...ssoFormData, name: e.target.value })} className="mt-1 h-8 text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Protocol</label>
                                        <select className="mt-1 block w-full pl-3 pr-10 py-1.5 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded border bg-white" value={ssoFormData.type} onChange={e => setSSOFormData({ ...ssoFormData, type: e.target.value })}>
                                            <option value="OIDC">OpenID Connect</option>
                                            <option value="SAML">SAML</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Client ID</label>
                                        <Input value={ssoFormData.clientId} onChange={e => setSSOFormData({ ...ssoFormData, clientId: e.target.value })} className="mt-1 h-8 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-700">Client Secret</label>
                                        <Input value={ssoFormData.clientSecret} onChange={e => setSSOFormData({ ...ssoFormData, clientSecret: e.target.value })} className="mt-1 h-8 text-sm" type="password" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsSSOModalOpen(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Save</button>
                                </div>
                            </form>
                        </Modal>

                    </main>
                </div>
            </div>
        </RouteGuard>
    );
}

