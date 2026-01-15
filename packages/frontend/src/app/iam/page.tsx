'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum, RoleResponseModel, SSOProvider } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import {
    CheckSquare,
    Square,
    Lock,
    Unlock,
    Key,
    Edit,
    Plus,
    Shield,
    Trash2,
    CheckCircle2,
    Copy,
    CreditCard,
    Layers,
    Cpu,
    Database,
    Network,
    Globe,
    Layout,
    Menu as MenuIcon,
    Search,
    ChevronRight,
    ArrowRight,
    Eye,
    EyeOff,
    Terminal,
    Fingerprint,
    Boxes,
    KeyRound
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { useIAM } from './hooks/useIAM';
import PageHeader from '@/components/ui/PageHeader';

type IAMTab = 'registry' | 'architecture' | 'dimensions' | 'protocols' | 'domains' | 'gateways';

export default function IAMPage() {
    const { error: toastError, success } = useToast();
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
        assignRoles,
        activateAccount,
        createMenu,
        updateMenu,
        deleteMenu,
        createScope,
        updateScope,
        deleteScope,
        createPermission,
        updatePermission,
        deletePermission,
        refresh
    } = useIAM(Number(companyId));

    const [activeTab, setActiveTab] = useState<IAMTab>('registry');

    useEffect(() => {
        refresh();
    }, [activeTab, refresh]);

    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

    // Edit states
    const [editingSSO, setEditingSSO] = useState<SSOProvider | null>(null);
    const [editingRole, setEditingRole] = useState<RoleResponseModel | null>(null);
    const [editingMenu, setEditingMenu] = useState<any | null>(null);
    const [editingScope, setEditingScope] = useState<any | null>(null);
    const [editingPermission, setEditingPermission] = useState<any | null>(null);
    const [provisioningUser, setProvisioningUser] = useState<any | null>(null);

    // Form states
    const [ssoFormData, setSSOFormData] = useState<any>({ name: '', type: 'OIDC', clientId: '', clientSecret: '', issuerUrl: '', authorizationUrl: '', tokenUrl: '', userInfoUrl: '' });
    const [roleFormData, setRoleFormData] = useState<any>({ name: '', code: '', description: '', permissionIds: [], userRole: UserRoleEnum.USER });
    const [menuFormData, setMenuFormData] = useState<any>({ label: '', code: '', parentId: null, path: '', icon: 'Circle', sortOrder: 0, requiredPermissionCode: '' });
    const [scopeFormData, setScopeFormData] = useState<any>({ name: '', code: '', description: '' });
    const [permissionFormData, setPermissionFormData] = useState<any>({ name: '', code: '', description: '', resource: '', action: 'READ' });
    const [provisionFormData, setProvisionFormData] = useState<any>({ roleIds: [], authType: 'LOCAL', password: '' });

    // Filtered data
    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return users.filter(u => u.email.toLowerCase().includes(query) || (u.firstName + ' ' + u.lastName).toLowerCase().includes(query));
    }, [users, searchQuery]);

    const filteredRoles = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return roles.filter(r => r.name.toLowerCase().includes(query) || r.code.toLowerCase().includes(query));
    }, [roles, searchQuery]);

    // Handlers
    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingRole
            ? await updateRole({ id: Number(editingRole.id), ...roleFormData })
            : await createRole({ ...roleFormData, companyId: Number(companyId) });
        if (success) setIsRoleModalOpen(false);
    };

    const handleMenuSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingMenu ? await updateMenu({ id: editingMenu.id, ...menuFormData }) : await createMenu(menuFormData);
        if (success) setIsMenuModalOpen(false);
    };

    const handleScopeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingScope ? await updateScope({ id: editingScope.id, ...scopeFormData }) : await createScope(scopeFormData);
        if (success) setIsScopeModalOpen(false);
    };

    const handlePermissionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingPermission ? await updatePermission({ id: editingPermission.id, ...permissionFormData }) : await createPermission(permissionFormData);
        if (success) setIsPermissionModalOpen(false);
    };

    const handleSSOSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = editingSSO ? await updateSSOProvider({ id: editingSSO.id, ...ssoFormData }) : await createSSOProvider({ ...ssoFormData, companyId: Number(companyId) });
        if (success) setIsSSOModalOpen(false);
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
        if (res) setIsProvisionModalOpen(false);
    };

    const togglePermission = (id: number) => {
        setRoleFormData((prev: any) => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(id)
                ? prev.permissionIds.filter((pid: number) => pid !== id)
                : [...prev.permissionIds, id]
        }));
    };

    const toggleMenu = (id: number) => {
        setRoleFormData((prev: any) => ({
            ...prev,
            menuIds: prev.menuIds.includes(id)
                ? prev.menuIds.filter((mid: number) => mid !== id)
                : [...prev.menuIds, id]
        }));
    };

    // Flatten menus for selection
    const flatMenus = useMemo(() => {
        const flatten = (items: any[]): any[] => {
            return items.reduce((acc, item) => {
                return [...acc, item, ...(item.children ? flatten(item.children) : [])];
            }, []);
        };
        return flatten(allMenusTree);
    }, [allMenusTree]);

    return (
        <RouteGuard>
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-6 lg:p-10">
                <PageHeader
                    title="Security Nexus"
                    description="Advanced Identity & Access Management Control Center"
                />

                {/* Cyber-styled Tab Bar */}
                <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 w-fit max-w-full overflow-x-auto shadow-sm">
                    {[
                        { id: 'registry', label: 'Registry', icon: Fingerprint, color: 'indigo' },
                        { id: 'architecture', label: 'Architecture', icon: Layers, color: 'blue' },
                        { id: 'dimensions', label: 'Dimensions', icon: Boxes, color: 'cyan' },
                        { id: 'protocols', label: 'Protocols', icon: Cpu, color: 'violet' },
                        { id: 'domains', label: 'Domains', icon: Globe, color: 'emerald' },
                        { id: 'gateways', label: 'Gateways', icon: Network, color: 'amber' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as IAMTab)}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-[11px] uppercase tracking-wider ${activeTab === tab.id
                                ? `bg-gradient-to-br from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg shadow-${tab.color}-100 dark:shadow-none`
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Primary Content Area */}
                <div className="space-y-6">
                    {/* Universal Search Container */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search the Nexus..."
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            {activeTab === 'architecture' && (
                                <Button variant="primary" onClick={() => { setEditingMenu(null); setMenuFormData({ label: '', code: '', parentId: null, path: '', icon: 'Circle', sortOrder: 0, requiredPermissionCode: '' }); setIsMenuModalOpen(true); }} className="rounded-xl px-6 bg-indigo-600 shadow-indigo-100 dark:shadow-none">
                                    <Plus className="h-4 w-4 mr-2" /> NEW MENU
                                </Button>
                            )}
                            {activeTab === 'dimensions' && (
                                <Button variant="primary" onClick={() => { setEditingRole(null); setRoleFormData({ name: '', code: '', description: '', permissionIds: [], userRole: UserRoleEnum.USER }); setIsRoleModalOpen(true); }} className="rounded-xl px-6 bg-indigo-600 shadow-indigo-100 dark:shadow-none">
                                    <Plus className="h-4 w-4 mr-2" /> NEW DIMENSION
                                </Button>
                            )}
                            {activeTab === 'protocols' && (
                                <Button variant="primary" onClick={() => { setEditingPermission(null); setPermissionFormData({ name: '', code: '', description: '', resource: '', action: 'READ' }); setIsPermissionModalOpen(true); }} className="rounded-xl px-6 bg-indigo-600 shadow-indigo-100 dark:shadow-none">
                                    <Plus className="h-4 w-4 mr-2" /> NEW PROTOCOL
                                </Button>
                            )}
                            {activeTab === 'domains' && (
                                <Button variant="primary" onClick={() => { setEditingScope(null); setScopeFormData({ name: '', code: '', description: '' }); setIsScopeModalOpen(true); }} className="rounded-xl px-6 bg-indigo-600 shadow-indigo-100 dark:shadow-none">
                                    <Plus className="h-4 w-4 mr-2" /> NEW DOMAIN
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Dynamic View Injection */}
                    <div className="grid grid-cols-1 gap-6">
                        {activeTab === 'registry' && <RegistryView users={filteredUsers} employees={allEmployees} onProvision={(u) => { setProvisioningUser(u); setProvisionFormData({ roleIds: [], authType: 'LOCAL', password: '' }); setIsProvisionModalOpen(true); }} onEdit={(u) => { setEditingUser(u); }} />}
                        {activeTab === 'architecture' && <ArchitectureView menus={allMenusTree} onEdit={(m) => { setEditingMenu(m); setMenuFormData(m); setIsMenuModalOpen(true); }} />}
                        {activeTab === 'dimensions' && <DimensionsView roles={filteredRoles} onEdit={(r) => { setEditingRole(r); setRoleFormData({ ...r, permissionIds: r.permissions?.map((p: any) => p.id) || [] }); setIsRoleModalOpen(true); }} onDelete={deleteRole} />}
                        {activeTab === 'protocols' && <ProtocolsView permissions={permissions} onEdit={(p) => { setEditingPermission(p); setPermissionFormData(p); setIsPermissionModalOpen(true); }} onDelete={deletePermission} />}
                        {activeTab === 'domains' && <DomainsView scopes={scopes} onEdit={(s) => { setEditingScope(s); setScopeFormData(s); setIsScopeModalOpen(true); }} onDelete={deleteScope} />}
                        {activeTab === 'gateways' && <GatewaysView providers={ssoProviders} onEdit={(p) => { setEditingSSO(p); setSSOFormData(p); setIsSSOModalOpen(true); }} onDelete={deleteSSOProvider} onNew={() => { setEditingSSO(null); setSSOFormData({ name: '', type: 'OIDC', clientId: '', clientSecret: '', issuerUrl: '', authorizationUrl: '', tokenUrl: '', userInfoUrl: '' }); setIsSSOModalOpen(true); }} />}
                    </div>
                </div>

                {/* --- MODALS --- */}

                {/* 1. Dimension Modal (Roles) */}
                <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={editingRole ? 'Modify Reality Dimension' : 'Forge New Dimension'}>
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Designation</label>
                                <Input value={roleFormData.name} onChange={e => setRoleFormData({ ...roleFormData, name: e.target.value })} placeholder="e.g. System Archon" required className="rounded-xl h-11" />
                            </section>
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Codename</label>
                                <Input value={roleFormData.code} onChange={e => setRoleFormData({ ...roleFormData, code: e.target.value })} placeholder="ROLE_ARCHON" required className="rounded-xl h-11" />
                            </section>
                        </div>
                        <section className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Role Taxonomy</label>
                            <select
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none ring-indigo-500 focus:ring-1"
                                value={roleFormData.userRole}
                                onChange={e => setRoleFormData({ ...roleFormData, userRole: e.target.value })}
                            >
                                {Object.values(UserRoleEnum).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </section>
                        <section className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Protocol Binding (Permissions)</label>
                            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                                {permissions.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => togglePermission(Number(p.id))}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${roleFormData.permissionIds.includes(Number(p.id))
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <div className={`p-1 rounded-md ${roleFormData.permissionIds.includes(Number(p.id)) ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <Shield className="h-3 w-3" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{p.name}</span>
                                            <span className="text-[8px] font-black tracking-tighter opacity-50">{p.resource}:{p.action}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Hub Subscription (Menus)</label>
                            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                                {flatMenus.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => toggleMenu(Number(m.id))}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${roleFormData.menuIds.includes(Number(m.id))
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <MenuIcon className={`h-3 w-3 ${roleFormData.menuIds.includes(Number(m.id)) ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{m.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)} className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest" type="button">Abuse</Button>
                            <Button variant="primary" type="submit" className="rounded-xl px-10 h-11 bg-indigo-600 font-black text-[10px] uppercase tracking-widest">Commit Changes</Button>
                        </div>
                    </form>
                </Modal>

                {/* 2. Menu Modal */}
                <Modal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} title={editingMenu ? 'Optimize Navigation Hub' : 'Construct New Hub'}>
                    <form onSubmit={handleMenuSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Menu Label</label>
                                <Input value={menuFormData.label} onChange={e => setMenuFormData({ ...menuFormData, label: e.target.value })} placeholder="e.g. Dashboard" required className="rounded-xl" />
                            </section>
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">System Code</label>
                                <Input value={menuFormData.code} onChange={e => setMenuFormData({ ...menuFormData, code: e.target.value })} placeholder="MENU_DASHBOARD" required className="rounded-xl" />
                            </section>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Path Endpoint</label>
                                <Input value={menuFormData.path} onChange={e => setMenuFormData({ ...menuFormData, path: e.target.value })} placeholder="/dashboard" className="rounded-xl" />
                            </section>
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Parent Link (Submenu)</label>
                                <select
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none"
                                    value={menuFormData.parentId || ''}
                                    onChange={e => setMenuFormData({ ...menuFormData, parentId: e.target.value ? Number(e.target.value) : null })}
                                >
                                    <option value="">No Parent (Root)</option>
                                    {roles.length > 0 && <optgroup label="Root Menus">
                                        {/* Mocking root menus for selection, normally would fetch all menus list */}
                                    </optgroup>}
                                </select>
                            </section>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="primary" type="submit" className="rounded-xl px-10 h-11 bg-indigo-600 font-black text-[10px] uppercase tracking-widest">Publish Hub</Button>
                        </div>
                    </form>
                </Modal>

                {/* 3. Gateways Modal (SSO) */}
                <Modal isOpen={isSSOModalOpen} onClose={() => setIsSSOModalOpen(false)} title={editingSSO ? 'Reconfigure Gateway' : 'Establish SSO Gateway'}>
                    <form onSubmit={handleSSOSubmit} className="space-y-4">
                        <section className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Provider Name</label>
                            <Input value={ssoFormData.name} onChange={e => setSSOFormData({ ...ssoFormData, name: e.target.value })} placeholder="Google Workplace" required className="rounded-xl" />
                        </section>
                        <div className="grid grid-cols-2 gap-4">
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Identity Protocol</label>
                                <select className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none ring-indigo-500 focus:ring-1" value={ssoFormData.type} onChange={e => setSSOFormData({ ...ssoFormData, type: e.target.value })}>
                                    <option value="OIDC">OpenID Connect</option>
                                    <option value="SAML">SAML 2.0</option>
                                    <option value="OAuth2">OAuth 2.0</option>
                                </select>
                            </section>
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Agent Identifier (Client ID)</label>
                                <Input value={ssoFormData.clientId} onChange={e => setSSOFormData({ ...ssoFormData, clientId: e.target.value })} placeholder="XXXX-XXXX-XXXX" required className="rounded-xl" />
                            </section>
                        </div>
                        <section className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Secret Artifact (Client Secret)</label>
                            <Input value={ssoFormData.clientSecret} type="password" onChange={e => setSSOFormData({ ...ssoFormData, clientSecret: e.target.value })} placeholder="••••••••••••" className="rounded-xl" />
                        </section>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="primary" type="submit" className="rounded-xl px-10 h-11 bg-indigo-600 font-black text-[10px] uppercase tracking-widest">Activate Gateway</Button>
                        </div>
                    </form>
                </Modal>

                {/* 4. Provisioning Modal */}
                <Modal isOpen={isProvisionModalOpen} onClose={() => setIsProvisionModalOpen(false)} title="Empower Principal">
                    <form onSubmit={handleProvisionSubmit} className="space-y-4">
                        {provisioningUser && (
                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {provisioningUser.firstName?.[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black dark:text-slate-100">{provisioningUser.firstName} {provisioningUser.lastName}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{provisioningUser.email}</span>
                                </div>
                            </div>
                        )}
                        <section className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assign Dimension (Roles)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            const id = Number(r.id);
                                            setProvisionFormData(prev => ({
                                                ...prev,
                                                roleIds: prev.roleIds.includes(id) ? prev.roleIds.filter(x => x !== id) : [...prev.roleIds, id]
                                            }));
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${provisionFormData.roleIds.includes(Number(r.id))
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-md'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600'
                                            }`}
                                    >
                                        <div className={`h-2 w-2 rounded-full ${provisionFormData.roleIds.includes(Number(r.id)) ? 'bg-indigo-600 animate-ping' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-tight">{r.name}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                        <div className="grid grid-cols-2 gap-4">
                            <section className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Auth Method</label>
                                <select className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none" value={provisionFormData.authType} onChange={e => setProvisionFormData({ ...provisionFormData, authType: e.target.value })}>
                                    <option value="LOCAL">Secure Ledger (Local)</option>
                                    <option value="SSO">External Gateway (SSO)</option>
                                </select>
                            </section>
                            {provisionFormData.authType === 'LOCAL' && (
                                <section className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Master Key (Password)</label>
                                    <Input type="password" placeholder="••••••••" value={provisionFormData.password} onChange={e => setProvisionFormData({ ...provisionFormData, password: e.target.value })} className="rounded-xl h-11" />
                                </section>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="primary" type="submit" className="rounded-xl px-12 h-11 bg-indigo-600 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">Authorize Principal</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
}

// --- SUB-VIEWS ---

function RegistryView({ users, employees, onProvision, onEdit }: any) {
    const sortedEmployees = [...employees].sort((a, b) => (a.empStatus === 'Terminated' ? 1 : -1));
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">Enterprise Registry (Staff)</h3>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vocation</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nexus Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sortedEmployees.map((emp: any) => {
                                const isUser = users.some((u: any) => u.email.toLowerCase() === emp.email.toLowerCase());
                                return (
                                    <tr key={emp.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-105">
                                                    {emp.firstName?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{emp.firstName} {emp.lastName}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{emp.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">{emp.designation || 'Specialist'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isUser ? (
                                                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                                                    <CheckCircle2 className="h-4 w-4" /> AUTHORIZED
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
                                                    <Lock className="h-3.5 w-3.5" /> PENDING
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isUser ? (
                                                <Button onClick={() => onProvision(emp)} size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase px-4 py-2 h-auto shadow-indigo-100">Establish Access</Button>
                                            ) : (
                                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                                                    <ChevronRight className="h-5 w-5" />
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

            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">Nexus Analytics</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                        <Fingerprint className="h-8 w-8 mb-4 opacity-50" />
                        <div className="text-3xl font-black mb-1">{users.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Authorized Principals</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
                        <Shield className="h-8 w-8 mb-4 text-indigo-600 opacity-50" />
                        <div className="text-3xl font-black mb-1 text-slate-800 dark:text-slate-100">{employees.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Workforce</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArchitectureView({ menus, onEdit }: any) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">Platform Navigation Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((menu: any) => (
                    <ArchitectureCard key={menu.id} menu={menu} onEdit={onEdit} />
                ))}
                <button onClick={() => onEdit(null)} className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-slate-400 hover:text-indigo-600 group">
                    <Plus className="h-10 w-10 mb-4 transition-transform group-hover:scale-110" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Architect New Hub</span>
                </button>
            </div>
        </div>
    );
}

function ArchitectureCard({ menu, onEdit }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Layout className="h-6 w-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(menu)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"><Edit className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
            <div className="mb-4">
                <div className="text-[14px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{menu.label}</div>
                <div className="text-[10px] font-black text-slate-400 tracking-wider">CODE: {menu.code}</div>
            </div>
            {menu.children?.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Sub-Elements ({menu.children.length})</div>
                    {menu.children.map((child: any) => (
                        <div key={child.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <ArrowRight className="h-3 w-3 text-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{child.label}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase">{menu.path || '/root'}</span>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase">SORT: {menu.sortOrder}</span>
            </div>
        </div>
    );
}

function DimensionsView({ roles, onEdit, onDelete }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role: any) => (
                <div key={role.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(role)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                                <Edit className="h-4 w-4 text-indigo-600" />
                            </button>
                            {!role.isSystemRole && (
                                <button onClick={() => onDelete(Number(role.id))} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-15px font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">{role.name}</span>
                            <span className="text-[10px] font-black text-indigo-500 tracking-widest">{role.code}</span>
                        </div>
                    </div>

                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed h-[34px]">{role.description || 'No description provided for this security dimension.'}</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black uppercase text-slate-400">Taxonomy</span>
                            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">{role.userRole}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black uppercase text-slate-400">Permissions</span>
                            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{role.permissions?.length || 0} Nodes</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black uppercase text-slate-400">Navigation Hubs</span>
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">{(role as any).menus?.length || 0} Subscriptions</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ProtocolsView({ permissions, onEdit, onDelete }: any) {
    const resources = [...new Set(permissions.map((p: any) => p.resource))];
    return (
        <div className="space-y-8">
            {resources.map(res => (
                <div key={res as string} className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">{res as string} Control Interface</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {permissions.filter((p: any) => p.resource === res).map((p: any) => (
                            <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-indigo-500">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate max-w-[120px]">{p.name}</div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Edit className="h-3 w-3" /></button>
                                        <button onClick={() => onDelete(Number(p.id))} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2.5 py-1 rounded-lg uppercase">{p.action}</span>
                                    <span className="text-[9px] font-black text-slate-400 tracking-tighter truncate max-w-full">ID: {p.code}</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{p.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function DomainsView({ scopes, onEdit, onDelete }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {scopes.map((scope: any) => (
                <div key={scope.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(scope)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => onDelete(Number(scope.id))} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <div className="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-1">{scope.name}</div>
                    <div className="text-[10px] font-black text-emerald-600 mb-4 tracking-wider">{scope.code}</div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{scope.description || 'Global boundary scope definition.'}</p>
                </div>
            ))}
            <button onClick={() => onEdit(null)} className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-slate-400 group">
                <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">New Boundary</span>
            </button>
        </div>
    );
}

function GatewaysView({ providers, onEdit, onDelete, onNew }: any) {
    return (
        <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">Ingress Authentication Gateways</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((p: any) => (
                    <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${p.type === 'OIDC' ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                                <Globe className="h-6 w-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(p)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                                <button onClick={() => onDelete(Number(p.id))} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <div className="mb-6">
                            <div className="text-[16px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-1">{p.name}</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${p.type === 'OIDC' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'}`}>{p.type}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Protocol Active</span>
                            </div>
                        </div>
                        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Agent ID</span>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{p.clientId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Status</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> OPERATIONAL
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={onNew} className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-slate-400 hover:text-indigo-600 group">
                    <Network className="h-12 w-12 mb-4 transition-transform group-hover:rotate-12" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Deploy New Gateway</span>
                </button>
            </div>
        </div>
    );
}
