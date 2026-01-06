'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const CompaniesMasterView = dynamic(() => import('./components/companies-master-view'), { loading: () => <p>Loading Companies...</p> });
const DepartmentsMasterView = dynamic(() => import('./components/departments-master-view'), { loading: () => <p>Loading Departments...</p> });
const AssetTypesMasterView = dynamic(() => import('./components/asset-types-master-view'), { loading: () => <p>Loading Asset Types...</p> });
const DeviceBrandsMasterView = dynamic(() => import('./components/device-brands-master-view'), { loading: () => <p>Loading Device Brands...</p> });
const ApplicationsMasterView = dynamic(() => import('./components/applications-master-view'), { loading: () => <p>Loading Applications...</p> });
const TicketCategoriesMasterView = dynamic(() => import('./components/ticket-categories-master-view'), { loading: () => <p>Loading Categories...</p> });
const SlackUsersMasterView = dynamic(() => import('./components/slack-users-master-view'), { loading: () => <p>Loading Slack Users...</p> });
const VendorsMasterView = dynamic(() => import('./components/vendors-master-view'), { loading: () => <p>Loading Vendors...</p> });
import { Building2, Users, Package, Smartphone, Tag, AppWindow, MessageSquare, Store } from 'lucide-react';

interface MasterItem {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    component?: any;
    href?: string;
}

export default function MastersPage() {
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
            id: 'ticket-categories',
            title: 'Ticket Categories',
            description: 'Manage ticket categories',
            icon: Tag,
            color: 'from-rose-500 to-rose-600',
            component: TicketCategoriesMasterView
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
    ];

    const selectedMasterData = masters.find(m => m.id === selectedMaster);

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
        const MasterComponent = selectedMasterData.component as React.ComponentType<{ onBack: () => void }>;
        return (
            <div className="p-6">
                <MasterComponent onBack={handleBack} />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Fixed Page Header */}
            <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Configuration</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Manage all master data for your organization
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable Masters Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-3 md:pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                    {masters.map((master) => {
                        const Icon = master.icon;
                        return (
                            <Card
                                key={master.id}
                                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-700"
                                onClick={() => handleSelectMaster(master)}
                            >
                                <div className="p-6 space-y-4">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${master.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {master.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            {master.description}
                                        </p>
                                    </div>

                                    {/* Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-300 dark:group-hover:border-indigo-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectMaster(master);
                                        }}
                                    >
                                        Manage {master.title}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


