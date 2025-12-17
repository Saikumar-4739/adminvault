'use client';

import { useCompanies } from '@/hooks/useCompanies';
import { useEmployees } from '@/hooks/useEmployees';
import { useAssets } from '@/hooks/useAssets';
import { useTickets } from '@/hooks/useTickets';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Building2, Users, Package, Ticket, TrendingUp, AlertCircle } from 'lucide-react';
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
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            isLoading: loadingCompanies,
        },
        {
            title: 'Total Employees',
            value: employees.length,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
            isLoading: loadingEmployees,
        },
        {
            title: 'Total Assets',
            value: assets.length,
            icon: Package,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
            isLoading: loadingAssets,
        },
        {
            title: 'Open Tickets',
            value: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
            icon: Ticket,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            iconColor: 'text-orange-600 dark:text-orange-400',
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Welcome to AdminVault - Your enterprise management platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
                            {stat.isLoading ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                </div>
                            ) : (
                                <>
                                    <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-4`}>
                                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        {formatNumber(stat.value)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {stat.title}
                                    </div>
                                </>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Status */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Asset Status Overview
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(assetsByStatus).map(([status, count]) => {
                            const total = assets.length || 1;
                            const percentage = Math.round((count / total) * 100);
                            const getColor = () => {
                                switch (status) {
                                    case 'Available': return 'bg-success-500';
                                    case 'Assigned': return 'bg-primary-500';
                                    case 'Maintenance': return 'bg-warning-500';
                                    case 'Retired': return 'bg-gray-500';
                                    default: return 'bg-gray-500';
                                }
                            };

                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {status}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getColor()} transition-all duration-300`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Recent Tickets */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Tickets
                    </h2>
                    <div className="space-y-3">
                        {loadingTickets ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            ))
                        ) : recentTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No tickets yet
                            </div>
                        ) : (
                            recentTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white mb-1">
                                                {ticket.title}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        ticket.status === 'Open' ? 'primary' :
                                                            ticket.status === 'In Progress' ? 'warning' :
                                                                ticket.status === 'Resolved' ? 'success' : 'secondary'
                                                    }
                                                >
                                                    {ticket.status}
                                                </Badge>
                                                {ticket.priority === 'High' && (
                                                    <Badge variant="danger">
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
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Employees
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Position
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Department
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loadingEmployees ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : recentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No employees yet
                                    </td>
                                </tr>
                            ) : (
                                recentEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {employee.fullName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {employee.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {employee.position || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {employee.department || '-'}
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
