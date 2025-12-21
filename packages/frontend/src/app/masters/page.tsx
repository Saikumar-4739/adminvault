'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Building2, Users, Package, Smartphone, Store, Tag, AppWindow, Receipt } from 'lucide-react';
import CompaniesMasterView from './components/companies-master-view';
import DepartmentsMasterView from './components/departments-master-view';
import AssetTypesMasterView from './components/asset-types-master-view';
import DeviceBrandsMasterView from './components/device-brands-master-view';
import VendorsMasterView from './components/vendors-master-view';

import TicketCategoriesMasterView from './components/ticket-categories-master-view';

export default function MastersPage() {
    const [selectedMaster, setSelectedMaster] = useState<string | null>(null);

    const masters = [
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
            id: 'vendors',
            title: 'Vendors',
            description: 'Manage vendors',
            icon: Store,
            color: 'from-pink-500 to-pink-600',
            component: VendorsMasterView
        },
        {
            id: 'applications',
            title: 'Applications',
            description: 'Manage applications',
            icon: AppWindow,
            color: 'from-teal-500 to-teal-600',
            component: () => <div className="p-6 text-center text-slate-500">Applications Master - Coming Soon</div>
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
            id: 'expense-categories',
            title: 'Expense Categories',
            description: 'Manage expense categories',
            icon: Receipt,
            color: 'from-amber-500 to-amber-600',
            component: () => <div className="p-6 text-center text-slate-500">Expense Categories Master - Coming Soon</div>
        },
    ];

    const selectedMasterData = masters.find(m => m.id === selectedMaster);

    if (selectedMaster && selectedMasterData) {
        const MasterComponent = selectedMasterData.component;
        return (
            <div className="p-6">
                <MasterComponent onBack={() => setSelectedMaster(null)} />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Fixed Page Header */}
            <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">System Configuration</h1>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage all master data for your organization
                    </p>
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
                                onClick={() => setSelectedMaster(master.id)}
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
                                            setSelectedMaster(master.id);
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
}
