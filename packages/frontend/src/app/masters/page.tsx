'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { Building2, Users, Package, Smartphone, AppWindow, MessageSquare, Store, Search, FileText, Settings2, Upload, LayoutGrid, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { BulkImportModal } from './components/BulkImportModal';

const CompaniesMasterView = dynamic(() => import('./components/companies-master-view').then(mod => mod.CompaniesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Companies...</p> });
const DepartmentsMasterView = dynamic(() => import('./components/departments-master-view').then(mod => mod.DepartmentsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Departments...</p> });
const AssetTypesMasterView = dynamic(() => import('./components/asset-types-master-view').then(mod => mod.AssetTypesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Asset Types...</p> });
const DeviceBrandsMasterView = dynamic(() => import('./components/device-brands-master-view').then(mod => mod.DeviceBrandsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading device Brands...</p> });
const ApplicationsMasterView = dynamic(() => import('./components/applications-master-view').then(mod => mod.ApplicationsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Applications...</p> });
const SlackUsersMasterView = dynamic(() => import('./components/slack-users-master-view').then(mod => mod.SlackUsersMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Slack Integration...</p> });
const VendorsMasterView = dynamic(() => import('./components/vendors-master-view').then(mod => mod.VendorsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Vendors...</p> });
const MenusMasterView = dynamic(() => import('./components/menus-master-view').then(mod => mod.MenusMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Menus...</p> });
const UserRolesMappingView = dynamic(() => import('./components/user-roles-mapping-view').then(mod => mod.UserRolesMappingView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading User Roles...</p> });
import { iamService, authService } from '@/lib/api/services';
import { UserPermissionsModal } from '../iam/components/user-permissions-modal';
import { useToast } from '@/contexts/ToastContext';
import { useEffect, useCallback } from 'react';

interface MasterItem {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    component?: any;
    href?: string;
}

const MastersPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const selectedMaster = searchParams.get('view');


    const masters: MasterItem[] = [
        {
            id: 'companies',
            title: 'Companies',
            description: 'Manage organization and company details',
            icon: Building2,
            color: 'from-blue-500 to-indigo-600',
            component: CompaniesMasterView
        },
        {
            id: 'departments',
            title: 'Departments',
            description: 'Manage departments and organizational structure',
            icon: Users,
            color: 'from-purple-500 to-indigo-600',
            component: DepartmentsMasterView
        },
        {
            id: 'asset-types',
            title: 'Asset Types',
            description: 'Define and manage asset categories',
            icon: Package,
            color: 'from-emerald-500 to-teal-600',
            component: AssetTypesMasterView
        },
        {
            id: 'device-brands',
            title: 'Device Brands',
            description: 'Manage device manufacturers and brands',
            icon: Smartphone,
            color: 'from-amber-500 to-orange-600',
            component: DeviceBrandsMasterView
        },
        {
            id: 'applications',
            title: 'Applications',
            description: 'Manage software applications and integrations',
            icon: AppWindow,
            color: 'from-cyan-500 to-blue-600',
            component: ApplicationsMasterView
        },
        {
            id: 'slack-users',
            title: 'Slack Users',
            description: 'Manage Slack user integration and mapping',
            icon: MessageSquare,
            color: 'from-rose-500 to-pink-600',
            component: SlackUsersMasterView
        },
        {
            id: 'vendors',
            title: 'Vendors',
            description: 'Manage suppliers and vendor information',
            icon: Store,
            color: 'from-indigo-600 to-violet-700',
            component: VendorsMasterView
        },
        {
            id: 'menu-master',
            title: 'System Pages',
            description: 'Configure main navigation pages',
            icon: AppWindow,
            color: 'from-blue-600 to-indigo-700',
            component: (props: any) => <MenusMasterView {...props} filter="parent" />
        },
        {
            id: 'submenu-master',
            title: 'Sub-Pages',
            description: 'Manage sub-navigation items',
            icon: LayoutGrid,
            color: 'from-emerald-600 to-teal-700',
            component: (props: any) => <MenusMasterView {...props} filter="child" />
        },
        {
            id: 'user-mapping',
            title: 'Assign Roles',
            description: 'Assign roles and permissions to users',
            icon: Users,
            color: 'from-orange-600 to-rose-700',
            component: (props: any) => <IAMUserMappingWrapper {...props} />
        },
        {
            id: 'document-hub',
            title: 'Document Vault',
            description: 'Manage organizational documents and templates',
            icon: FileText,
            color: 'from-blue-600 to-indigo-700',
            href: '/documents'
        },
    ];

    const selectedMasterData = masters.find(m => m.id === selectedMaster);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const filteredMasters = masters.filter(master =>
        master.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        master.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectMaster = (master: any) => {
        if (master.href) {
            router.push(master.href);
        } else {
            router.push(`/masters?view=${master.id}`);
        }
    };

    const handleBack = () => {
        router.push('/masters');
    };

    if (selectedMaster && selectedMasterData && selectedMasterData.component) {
        const MasterComponent = selectedMasterData.component;
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
                <div className="p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MasterComponent onBack={handleBack} />
                </div>
            </div>
        );
    }

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 p-4 lg:p-8 space-y-6 overflow-y-auto">
                <PageHeader
                    title="Settings & Masters"
                    description="General settings and organization masters"
                    icon={<Settings2 />}
                    gradient="from-slate-700 to-slate-900"
                    actions={[
                        {
                            label: 'Bulk Import',
                            icon: <Upload className="h-4 w-4" />,
                            onClick: () => setIsImportModalOpen(true),
                            variant: 'primary'
                        }
                    ]}
                >
                    <div className="relative max-w-xs ml-auto group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search master settings..."
                            className="pl-11 pr-4 py-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </PageHeader>

                <BulkImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                />

                {/* Master Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-12">
                    {filteredMasters.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-4">
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full shadow-lg">
                                <Search className="h-10 w-10 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black uppercase tracking-widest text-slate-900 dark:text-white">No masters found</p>
                                <p className="text-xs text-slate-500 font-medium">No master nodes matching your query were detected.</p>
                            </div>
                        </div>
                    ) : (
                        filteredMasters.map((master) => {
                            const Icon = master.icon;
                            return (
                                <button
                                    key={master.id}
                                    onClick={() => handleSelectMaster(master)}
                                    className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all text-left relative overflow-hidden flex flex-col h-full"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Icon className="h-16 w-16 text-indigo-500" />
                                    </div>

                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${master.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 relative z-10 flex-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {master.title}
                                        </h3>
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                            {master.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10">
                                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-500 uppercase tracking-wider transition-colors">
                                            Access
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </RouteGuard>
    );
};

function IAMUserMappingWrapper({ onBack }: { onBack: () => void }) {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [mappings, setMappings] = useState<Record<string, any>>({});
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes, menusRes, mappingsRes] = await Promise.all([
                authService.getAllUsers({ companyId: 1 }),
                iamService.getRoles(),
                iamService.getAllMenus(),
                iamService.getAllRoleMenus()
            ]);

            setUsers(usersRes.users || []);
            setRoles(rolesRes.data || []);
            setMenus(menusRes.data || []);

            const grouped: Record<string, any> = {};
            (rolesRes.data || []).forEach((r: any) => grouped[r.key] = {});
            (mappingsRes.data as any[]).forEach(m => {
                if (grouped[m.roleKey]) {
                    grouped[m.roleKey][m.menuKey] = m.permissions;
                }
            });
            setMappings(grouped);
        } catch (error: any) {
            toast.error("Failed to load mapping data");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading User Roles...</p>;

    return (
        <div className="space-y-4">
            <UserRolesMappingView
                users={users}
                roles={roles}
                onBack={onBack}
                onOverride={(user) => {
                    setSelectedUser(user);
                    setIsPermModalOpen(true);
                }}
            />
            {selectedUser && (
                <UserPermissionsModal
                    isOpen={isPermModalOpen}
                    onClose={() => setIsPermModalOpen(false)}
                    user={selectedUser}
                    roleMenus={mappings[selectedUser.userRole] || {}}
                    allMenus={menus}
                />
            )}
        </div>
    );
}

export default MastersPage;