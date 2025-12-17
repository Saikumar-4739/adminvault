'use client';

import { useCompanies } from '@/hooks/useCompanies';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssets } from '@/hooks/useAssets';
import { useTickets } from '@/hooks/useTickets';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Building2, Users, Package, Ticket, AlertCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function DashboardPage() {
    const { companies, isLoading: loadingCompanies } = useCompanies();
    const { employees, isLoading: loadingEmployees } = useEmployees();
    const { assets, isLoading: loadingAssets } = useAssets();
    const { tickets, isLoading: loadingTickets } = useTickets();

    const stats = [
        {
            title: 'Total Companies',
            value: companies.length,
            icon: Building2,
            color: 'from-indigo-500 to-violet-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            isLoading: loadingCompanies,
        },
        {
            title: 'Total Employees',
            value: employees.length,
            icon: Users,
            color: 'from-violet-500 to-fuchsia-600',
            bgColor: 'bg-violet-50 dark:bg-violet-900/20',
            iconColor: 'text-violet-600 dark:text-violet-400',
            isLoading: loadingEmployees,
        },
        {
            title: 'Total Assets',
            value: assets.length,
            icon: Package,
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            isLoading: loadingAssets,
        },
        {
            title: 'Open Tickets',
            value: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
            icon: Ticket,
            color: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
            isLoading: loadingTickets,
        },
    ];

    const recentTickets = tickets.slice(0, 5);
    const recentEmployees = employees.slice(0, 5);

    const assetsByStatus = {
        Available: assets.filter(a => a.status === 'Available').length,
        Assigned: assets.filter(a => a.status === 'Assigned').length,
        Maintenance: assets.filter(a => a.status === 'Maintenance').length,
        Retired: assets.filter(a => a.status === 'Retired').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Welcome to AdminVault - Your enterprise management platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="group relative overflow-hidden p-6 hover:shadow-xl transition-all duration-300 border-none bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                            {stat.isLoading ? (
                                <div className="animate-pulse flex justify-between items-center relative z-10 w-full">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-20"></div>
                                        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-12"></div>
                                    </div>
                                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-700 rounded-2xl"></div>
                                </div>
                            ) : (
                                <div className="relative z-10 flex items-center justify-between w-full gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                                            {stat.title}
                                        </p>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                                            {formatNumber(stat.value)}
                                        </h3>
                                    </div>
                                    <div className={`shrink-0 p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Status */}
                <Card className="p-6 border-none shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary-500" />
                        Asset Status Overview
                    </h2>
                    <div className="space-y-5">
                        {Object.entries(assetsByStatus).map(([status, count]) => {
                            const total = assets.length || 1;
                            const percentage = Math.round((count / total) * 100);
                            const getColor = () => {
                                switch (status) {
                                    case 'Available': return 'bg-emerald-500';
                                    case 'Assigned': return 'bg-indigo-500';
                                    case 'Maintenance': return 'bg-amber-500';
                                    case 'Retired': return 'bg-slate-400';
                                    default: return 'bg-slate-400';
                                }
                            };

                            return (
                                <div key={status} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors">
                                            {status}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                            {count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${getColor()} transition-all duration-500 ease-out group-hover:opacity-90`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Recent Tickets */}
                <Card className="p-6 border-none shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-indigo-500" />
                        Recent Tickets
                    </h2>
                    <div className="space-y-3">
                        {loadingTickets ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                </div>
                            ))
                        ) : recentTickets.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Ticket className="h-8 w-8 text-slate-300" />
                                </div>
                                <p>No tickets yet</p>
                            </div>
                        ) : (
                            recentTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="group p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-700 transition-colors">
                                                {ticket.title}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        ticket.status === 'Open' ? 'primary' :
                                                            ticket.status === 'In Progress' ? 'warning' :
                                                                ticket.status === 'Resolved' ? 'success' : 'neutral'
                                                    }
                                                >
                                                    {ticket.status}
                                                </Badge>
                                                {ticket.priority === 'High' && (
                                                    <Badge variant="error" className="animate-pulse-slow">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        High Priority
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Employees */}
            <Card className="p-6 border-none shadow-lg shadow-slate-200/50 dark:shadow-none">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-500" />
                    Recent Employees
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Position
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Department
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loadingEmployees ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : recentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No employees yet
                                    </td>
                                </tr>
                            ) : (
                                recentEmployees.map((employee) => (
                                    <tr key={employee.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                                    {employee.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                    {employee.fullName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {employee.email}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {employee.position || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            <Badge variant="neutral" className="bg-slate-100 text-slate-600">
                                                {employee.department || '-'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
