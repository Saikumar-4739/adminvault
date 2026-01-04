'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/hooks/useDashboard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Users, Package, Ticket, AlertCircle, Lock, RefreshCcw, TrendingUp, Activity, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';

// Lazy load chart components
const AssetDistributionChart = dynamic(() => import('@/features/dashboard/components/AssetDistributionChart'), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
});
const TicketPriorityChart = dynamic(() => import('@/features/dashboard/components/TicketPriorityChart'), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
});
const EmployeeDeptChart = dynamic(() => import('@/features/dashboard/components/EmployeeDeptChart'), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
});
const TicketStatusChart = dynamic(() => import('@/features/dashboard/components/TicketStatusChart'), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
});

// Lazy load new Enterprise Widgets
const SystemHealthWidget = dynamic(() => import('@/features/dashboard/components/SystemHealthWidget'), {
    ssr: false,
    loading: () => <div className="h-full animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg p-4"></div>
});
const RenewalsWidget = dynamic(() => import('@/features/dashboard/components/RenewalsWidget'), {
    ssr: false,
    loading: () => <div className="h-full animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg p-4"></div>
});

const SecurityScoreCard = dynamic(() => import('@/features/dashboard/components/SecurityScoreCard'), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
});

export default function DashboardPage() {
    const { stats, isLoading, refresh } = useDashboard();

    // Mock security metrics for demonstration
    const securityMetrics = {
        score: 87,
        metrics: {
            identity: 95,
            devices: 78,
            compliance: 92
        }
    };

    // Memoize data transformations to prevent unnecessary recalculations
    const assetData = useMemo(() =>
        stats?.assets.byStatus.map(item => ({
            name: item.status,
            value: parseInt(item.count)
        })) || []
        , [stats?.assets.byStatus]);

    const ticketPriorityData = useMemo(() =>
        stats?.tickets.byPriority.map(item => ({
            name: item.priority,
            value: parseInt(item.count)
        })) || []
        , [stats?.tickets.byPriority]);

    const ticketStatusData = useMemo(() =>
        stats?.tickets.byStatus.map(item => ({
            name: item.status,
            value: parseInt(item.count)
        })) || []
        , [stats?.tickets.byStatus]);

    const employeeDeptData = useMemo(() =>
        stats?.employees.byDepartment.map(item => ({
            name: item.department || 'Unassigned',
            value: parseInt(item.count)
        })) || []
        , [stats?.employees.byDepartment]);

    // Memoize KPI cards configuration
    const kpiCards = useMemo(() => [
        {
            title: 'Total Assets',
            value: stats?.assets.total || 0,
            icon: Package,
            gradient: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
            text: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            title: 'Active Tickets',
            value: stats?.tickets.total || 0,
            icon: Ticket,
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 dark:bg-amber-900/10',
            text: 'text-amber-600 dark:text-amber-400'
        },
        {
            title: 'Total Employees',
            value: stats?.employees.total || 0,
            icon: Users,
            gradient: 'from-violet-500 to-fuchsia-600',
            bg: 'bg-violet-50 dark:bg-violet-900/10',
            text: 'text-violet-600 dark:text-violet-400'
        },
        {
            title: 'Active Licenses',
            value: stats?.licenses.total || 0,
            icon: Lock,
            gradient: 'from-blue-500 to-cyan-600',
            bg: 'bg-blue-50 dark:bg-blue-900/10',
            text: 'text-blue-600 dark:text-blue-400'
        }
    ], [stats]);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-4 space-y-4 min-h-screen bg-slate-50/50 dark:bg-slate-950">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpiCards.map((card, idx) => (
                        <Card key={idx} className="p-3 border-none shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{card.title}</p>
                                    {isLoading ? (
                                        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
                                    ) : (
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatNumber(card.value)}</p>
                                    )}
                                </div>
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} shrink-0`}>
                                    <card.icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>



                {/* Multi-Column Grid for Core Analytics & Risk */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Security Score Card (High Priority) */}
                    <div className="lg:col-span-1">
                        <SecurityScoreCard score={securityMetrics.score} metrics={securityMetrics.metrics} />
                    </div>

                    {/* System Health Widget */}
                    <div className="lg:col-span-1">
                        <SystemHealthWidget stats={stats} />
                    </div>

                    {/* Ticket Priority Distribution */}
                    <div className="lg:col-span-1">
                        <Card className="p-4 border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-full flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                    <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                                </div>
                                Ticket Priorities
                            </h3>
                            <div className="flex-1 w-full min-h-[160px]">
                                <TicketPriorityChart data={ticketPriorityData} />
                            </div>
                        </Card>
                    </div>

                    {/* Renewal & Compliance Alerts */}
                    <div className="lg:col-span-1 border-l-2 border-dashed border-slate-200 dark:border-slate-800 pl-4">
                        <RenewalsWidget stats={stats} />
                    </div>
                </div>

                {/* Dashboard Grid - Unified 3-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                    {/* Asset Distribution */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                <PieChartIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                            Asset Distribution
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="flex-1 w-full min-h-[200px]">
                                <AssetDistributionChart data={assetData} />
                            </div>
                        )}
                    </Card>

                    {/* Employee Department (Moved down) */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Activity className="h-3.5 w-3.5 text-white" />
                            </div>
                            Employees by Department
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="flex-1 w-full min-h-[200px]">
                                <EmployeeDeptChart data={employeeDeptData} />
                            </div>
                        )}
                    </Card>

                    {/* Ticket Status */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 h-full flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                <BarChart2 className="h-3.5 w-3.5 text-white" />
                            </div>
                            Tickets by Status
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="flex-1 w-full min-h-[200px]">
                                <TicketStatusChart data={ticketStatusData} />
                            </div>
                        )}
                    </Card>
                </div>

                {/* Compact Recent Tickets Table */}
                <Card className="p-4 border-none shadow-md">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        Recent Tickets
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-2 px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Subject</th>
                                    <th className="py-2 px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                    <th className="py-2 px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                                    <th className="py-2 px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32"></div></td>
                                            <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div></td>
                                            <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div></td>
                                            <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    stats?.tickets.recent.map((ticket: any) => (
                                        <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 text-xs font-medium text-slate-700 dark:text-slate-300">{ticket.subject}</td>
                                            <td className="p-3">
                                                <Badge variant={ticket.ticketStatus === TicketStatusEnum.OPEN ? 'primary' : 'neutral'} className="text-[10px] px-1.5 py-0.5">
                                                    {ticket.ticketStatus}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' :
                                                    'text-slate-600 bg-slate-100 dark:bg-slate-800'
                                                    }`}>
                                                    {ticket.priorityEnum}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-slate-500 dark:text-slate-400">
                                                {ticket.raisedByEmployee?.firstName} {ticket.raisedByEmployee?.lastName}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div >
        </RouteGuard >
    );
};


