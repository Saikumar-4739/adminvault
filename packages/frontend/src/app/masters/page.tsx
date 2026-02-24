'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { Building2, Users, Package, Smartphone, AppWindow, MessageSquare, Store, Search, FileText, Settings2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { BulkImportModal } from './components/BulkImportModal';

const CompaniesMasterView = dynamic(() => import('./components/companies-master-view').then(mod => mod.CompaniesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Companies...</p> });
const DepartmentsMasterView = dynamic(() => import('./components/departments-master-view').then(mod => mod.DepartmentsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Departments...</p> });
const AssetTypesMasterView = dynamic(() => import('./components/asset-types-master-view').then(mod => mod.AssetTypesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Asset Types...</p> });
const DeviceBrandsMasterView = dynamic(() => import('./components/device-brands-master-view').then(mod => mod.DeviceBrandsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading device Brands...</p> });
const LicensesMasterView = dynamic(() => import('./components/licenses-master-view').then(mod => mod.LicensesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Licenses...</p> });
const SlackUsersMasterView = dynamic(() => import('./components/slack-users-master-view').then(mod => mod.SlackUsersMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Slack Integration...</p> });
const VendorsMasterView = dynamic(() => import('./components/vendors-master-view').then(mod => mod.VendorsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Vendors...</p> });
const InfrastructureMasterView = dynamic(() => import('./components/infrastructure-master-view').then(mod => mod.InfrastructureMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Infrastructure...</p> });
const RemoteMasterView = dynamic(() => import('./components/remote-master-view').then(mod => mod.RemoteMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Remote Tools...</p> });
const DocumentsMasterView = dynamic(() => import('./components/documents-master-view').then(mod => mod.DocumentsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Documents...</p> });


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
            title: 'Licenses',
            description: 'Manage software licenses and subscriptions',
            icon: AppWindow,
            color: 'from-cyan-500 to-blue-600',
            component: LicensesMasterView
        },
        {
            id: 'infrastructure',
            title: 'Infrastructure',
            description: 'Manage hardware and infrastructure assets',
            icon: Package,
            color: 'from-orange-500 to-red-600',
            component: InfrastructureMasterView
        },
        {
            id: 'remote-tools',
            title: 'Remote Tools',
            description: 'Manage remote access tools and credentials',
            icon: Smartphone,
            color: 'from-teal-500 to-emerald-600',
            component: RemoteMasterView
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
            id: 'document-hub',
            title: 'Document Vault',
            description: 'Manage organizational documents and templates',
            icon: FileText,
            color: 'from-blue-600 to-indigo-700',
            component: DocumentsMasterView
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
                    title="System Configuration"
                    description="General settings and organization masters"
                    icon={<Settings2 />}
                    gradient="from-slate-700 to-slate-900"
                >
                    <div className="relative max-w-xs ml-auto group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search master settings..."
                            className="pl-9 pr-3 py-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm h-8"
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

export default MastersPage;