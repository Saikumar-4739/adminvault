'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { Building2, Users, Package, Smartphone, AppWindow, MessageSquare, Store, Lock, Search, Book, FileText, Layers, Globe, Zap, Settings2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

const CompaniesMasterView = dynamic(() => import('./components/companies-master-view').then(mod => mod.CompaniesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: Companies...</p> });
const DepartmentsMasterView = dynamic(() => import('./components/departments-master-view').then(mod => mod.DepartmentsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: Departments...</p> });
const AssetTypesMasterView = dynamic(() => import('./components/asset-types-master-view').then(mod => mod.AssetTypesMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: Asset Types...</p> });
const DeviceBrandsMasterView = dynamic(() => import('./components/device-brands-master-view').then(mod => mod.DeviceBrandsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: device Brands...</p> });
const ApplicationsMasterView = dynamic(() => import('./components/applications-master-view').then(mod => mod.ApplicationsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: Applications...</p> });
const SlackUsersMasterView = dynamic(() => import('./components/slack-users-master-view').then(mod => mod.SlackUsersMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: Slack Integration...</p> });
const VendorsMasterView = dynamic(() => import('./components/vendors-master-view').then(mod => mod.VendorsMasterView), { loading: () => <p className="animate-pulse p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Neutralizing Data Layer: Vendors...</p> });

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
    const { stats, isLoading: statsLoading } = useDashboardStats();

    const masters: MasterItem[] = [
        {
            id: 'companies',
            title: 'Entities',
            description: 'Global organization registry and node management',
            icon: Building2,
            color: 'from-blue-500 to-indigo-600',
            component: CompaniesMasterView
        },
        {
            id: 'departments',
            title: 'Organizational Units',
            description: 'Structural hierarchy and departmental mapping',
            icon: Users,
            color: 'from-purple-500 to-indigo-600',
            component: DepartmentsMasterView
        },
        {
            id: 'asset-types',
            title: 'Resource Schema',
            description: 'Universal classification for enterprise hardware',
            icon: Package,
            color: 'from-emerald-500 to-teal-600',
            component: AssetTypesMasterView
        },
        {
            id: 'device-brands',
            title: 'Vendor Standards',
            description: 'Standardization protocols for device ecosystems',
            icon: Smartphone,
            color: 'from-amber-500 to-orange-600',
            component: DeviceBrandsMasterView
        },
        {
            id: 'applications',
            title: 'Software Lattice',
            description: 'Enterprise application registry and integrations',
            icon: AppWindow,
            color: 'from-cyan-500 to-blue-600',
            component: ApplicationsMasterView
        },
        {
            id: 'slack-users',
            title: 'Communication Mesh',
            description: 'Synchronized identity mapping for Slack protocols',
            icon: MessageSquare,
            color: 'from-rose-500 to-pink-600',
            component: SlackUsersMasterView
        },
        {
            id: 'vendors',
            title: 'Supply Chain Registry',
            description: 'Critical supplier and vendor network oversight',
            icon: Store,
            color: 'from-indigo-600 to-violet-700',
            component: VendorsMasterView
        },
        {
            id: 'password-vault',
            title: 'Identity Shield',
            description: 'Secure enterprise credential hardening',
            icon: Lock,
            color: 'from-slate-600 to-slate-800',
            href: '/password-vault'
        },
        {
            id: 'knowledge-base',
            title: 'Intelligence Core',
            description: 'Universal policy and procedural guide',
            icon: Book,
            color: 'from-amber-600 to-yellow-700',
            href: '/knowledge-base'
        },
        {
            id: 'document-hub',
            title: 'Registry Documents',
            description: 'Centralized organizational policy templates',
            icon: FileText,
            color: 'from-blue-600 to-indigo-700',
            href: '/documents'
        },
    ];

    const selectedMasterData = masters.find(m => m.id === selectedMaster);
    const [searchQuery, setSearchQuery] = useState('');

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
                    title="System Registry"
                    description="Enterprise-wide configuration and organization masters"
                    icon={<Settings2 />}
                    gradient="from-slate-700 to-slate-900"
                >
                    <div className="relative max-w-xs ml-auto group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Master Registry..."
                            className="pl-11 pr-4 py-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </PageHeader>

                {/* Registry Pulse */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Registered Entities"
                        value={stats?.employees.byDepartment.length || 0}
                        icon={Building2}
                        gradient="from-blue-500 to-indigo-600"
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title="Active Units"
                        value={stats?.employees.total || 0}
                        icon={Users}
                        gradient="from-purple-500 to-violet-600"
                        iconBg="bg-purple-50 dark:bg-purple-900/20"
                        iconColor="text-purple-600 dark:text-purple-400"
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title="Resource Types"
                        value={stats?.assets.total || 0}
                        icon={Layers}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title="Network Nodes"
                        value={masters.length}
                        icon={Globe}
                        gradient="from-amber-500 to-orange-600"
                        iconBg="bg-amber-50 dark:bg-amber-900/20"
                        iconColor="text-amber-600 dark:text-amber-400"
                        isLoading={false}
                    />
                </div>

                {/* Master Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                    {filteredMasters.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-4">
                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full shadow-lg">
                                <Search className="h-10 w-10 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black uppercase tracking-widest text-slate-900 dark:text-white">Registry Signal Lost</p>
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
                                    className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1.5 transition-all text-left relative overflow-hidden flex flex-col h-full"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Icon className="h-24 w-24 text-indigo-500" />
                                    </div>

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${master.color} text-white shadow-xl group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative z-10 flex-1">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                            {master.title}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                            {master.description}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10">
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-500 uppercase tracking-widest transition-colors">
                                            Access Registry
                                        </span>
                                        <Zap className="h-3 w-3 text-slate-300 group-hover:text-amber-500 group-hover:animate-pulse transition-colors" />
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