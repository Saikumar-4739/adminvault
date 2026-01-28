'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const CompaniesMasterView = dynamic(() => import('./components/companies-master-view').then(mod => mod.CompaniesMasterView), { loading: () => <p>Loading Companies...</p> });
const DepartmentsMasterView = dynamic(() => import('./components/departments-master-view').then(mod => mod.DepartmentsMasterView), { loading: () => <p>Loading Departments...</p> });
const AssetTypesMasterView = dynamic(() => import('./components/asset-types-master-view').then(mod => mod.AssetTypesMasterView), { loading: () => <p>Loading Asset Types...</p> });
const DeviceBrandsMasterView = dynamic(() => import('./components/device-brands-master-view').then(mod => mod.DeviceBrandsMasterView), { loading: () => <p>Loading Device Brands...</p> });
const ApplicationsMasterView = dynamic(() => import('./components/applications-master-view').then(mod => mod.ApplicationsMasterView), { loading: () => <p>Loading Applications...</p> });
const SlackUsersMasterView = dynamic(() => import('./components/slack-users-master-view').then(mod => mod.SlackUsersMasterView), { loading: () => <p>Loading Slack Users...</p> });
const VendorsMasterView = dynamic(() => import('./components/vendors-master-view').then(mod => mod.VendorsMasterView), { loading: () => <p>Loading Vendors...</p> });
import { Building2, Users, Package, Smartphone, AppWindow, MessageSquare, Store, Lock, Search, X, Book, FileText } from 'lucide-react';

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
            description: 'Manage company information',
            icon: Building2,
            color: 'from-blue-500 to-blue-600',
            component: CompaniesMasterView
        },
        {
            id: 'departments',
            title: 'Departments',
            description: 'Manage departments',
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            component: DepartmentsMasterView
        },
        {
            id: 'asset-types',
            title: 'Asset Types',
            description: 'Manage asset types',
            icon: Package,
            color: 'from-green-500 to-green-600',
            component: AssetTypesMasterView
        },
        {
            id: 'device-brands',
            title: 'Device Brands',
            description: 'Manage device brands',
            icon: Smartphone,
            color: 'from-orange-500 to-orange-600',
            component: DeviceBrandsMasterView
        },
        {
            id: 'applications',
            title: 'Applications',
            description: 'Manage applications',
            icon: AppWindow,
            color: 'from-teal-500 to-teal-600',
            component: ApplicationsMasterView
        },
        {
            id: 'slack-users',
            title: 'Slack Users',
            description: 'Manage slack integration users',
            icon: MessageSquare,
            color: 'from-sky-500 to-sky-600',
            component: SlackUsersMasterView
        },
        {
            id: 'vendors',
            title: 'Vendors',
            description: 'Manage vendors and suppliers',
            icon: Store,
            color: 'from-pink-500 to-pink-600',
            component: VendorsMasterView
        },

        {
            id: 'password-vault',
            title: 'Password Vault',
            description: 'Secure enterprise password storage',
            icon: Lock,
            color: 'from-emerald-600 to-teal-700',
            href: '/password-vault'
        },
        {
            id: 'knowledge-base',
            title: 'Knowledge Base',
            description: 'Enterprise guide and policy center',
            icon: Book,
            color: 'from-amber-500 to-orange-600',
            href: '/knowledge-base'
        },
        {
            id: 'document-hub',
            title: 'Document Hub',
            description: 'Centralized policy and template hub',
            icon: FileText,
            color: 'from-indigo-600 to-blue-700',
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
            <div className="p-4">
                <MasterComponent onBack={handleBack} />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Fixed Page Header */}

            <div className="flex-shrink-0 p-4 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md rotate-2 hover:rotate-0 transition-transform duration-300">
                        <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">System Configuration</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Organization Master Registry
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search masters..."
                        className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="h-3 w-3 text-slate-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Masters Grid */}
            <div className="flex-1 overflow-y-auto p-4 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-6">
                    {filteredMasters.length === 0 ? (
                        <div className="col-span-full py-12 text-center">
                            <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 dark:text-white">No masters found</h3>
                            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query</p>
                        </div>
                    ) : (
                        filteredMasters.map((master) => {
                            const Icon = master.icon;
                            return (
                                <Card
                                    key={master.id}
                                    className="group hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-700"
                                    onClick={() => handleSelectMaster(master)}
                                >
                                    <div className="p-3 space-y-2">
                                        {/* Icon */}
                                        <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${master.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight line-clamp-1">
                                                {master.title}
                                            </h3>
                                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                {master.description}
                                            </p>
                                        </div>

                                        {/* Button */}
                                        <Button
                                            variant="outline"
                                            className="w-full h-7 rounded-md text-[9px] font-bold uppercase tracking-wide group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-300 dark:group-hover:border-indigo-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectMaster(master);
                                            }}
                                        >
                                            Open
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MastersPage;