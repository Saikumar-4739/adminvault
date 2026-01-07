'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { dashboardService } from '@/lib/api/services';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
    Users, Package, Ticket, Lock, RefreshCcw, TrendingUp, Activity,
    PieChart as PieChartIcon, BarChart2, Mail, FileText, Settings,
    Clock, AlertTriangle, CheckCircle, ArrowUpRight, Zap,
    Key, LayoutGrid
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

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

// Lazy load Enterprise Widgets
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

export interface DashboardStats {
    assets: {
        total: number;
        byStatus: { status: string; count: string }[];
    };
    tickets: {
        total: number;
        byStatus: { status: string; count: string }[];
        byPriority: { priority: string; count: string }[];
        recent: any[];
    };
    employees: {
        total: number;
        byDepartment: { department: string; count: string }[];
    };
    licenses: {
        total: number;
        expiringSoon: {
            id: number;
            applicationName: string;
            expiryDate: Date | string;
            assignedTo: string;
        }[];
    };
    systemHealth: {
        assetUtilization: number;
        ticketResolutionRate: number;
        openCriticalTickets: number;
    };
    security: {
        score: number;
        metrics: {
            identity: number;
            devices: number;
            compliance: number;
        };
    };
}

export default function DashboardPage() {
    const { error: toastError } = useToast();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await dashboardService.getDashboardStats();
            if (response && response.status && response.data) {
                setStats(response.data);
                setLastUpdated(new Date());
            }
        } catch (err: any) {
            console.error(err);
            toastError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, [toastError]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const securityStats = useMemo(() => stats?.security || {
        score: 0,
        metrics: {
            identity: 0,
            devices: 0,
            compliance: 0
        }
    }, [stats]);

    // Memoize data transformations
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

    // Enhanced KPI cards with trends
    const kpiCards = useMemo(() => [
        {
            title: 'IT Assets',
            value: stats?.assets.total || 0,
            icon: Package,
            gradient: 'from-emerald-500 to-teal-600',
            link: '/assets',
            subtitle: 'Hardware Inventory'
        },
        {
            title: 'Support Tickets',
            value: stats?.tickets.total || 0,
            icon: Ticket,
            gradient: 'from-amber-500 to-orange-600',
            link: '/tickets',
            subtitle: 'Active Requests'
        },
        {
            title: 'Employees',
            value: stats?.employees.total || 0,
            icon: Users,
            gradient: 'from-violet-500 to-fuchsia-600',
            link: '/employees',
            subtitle: 'Global Registry'
        },
        {
            title: 'Licenses',
            value: stats?.licenses.total || 0,
            icon: Lock,
            gradient: 'from-blue-500 to-cyan-600',
            link: '/licenses',
            subtitle: 'Software Subscriptions'
        }
    ], [stats]);

    // Quick action modules
    const quickActions = [
        { label: 'Assets', icon: Package, link: '/assets', color: 'emerald' },
        { label: 'Tickets', icon: Ticket, link: '/tickets', color: 'amber' },
        { label: 'Employees', icon: Users, link: '/employees', color: 'violet' },
        { label: 'Licenses', icon: Key, link: '/licenses', color: 'blue' },
        { label: 'Documents', icon: FileText, link: '/documents', color: 'indigo' },
        { label: 'Reports', icon: BarChart2, link: '/reports', color: 'rose' },
        { label: 'Email Hub', icon: Mail, link: '/emails', color: 'cyan' },
        { label: 'Settings', icon: Settings, link: '/settings', color: 'slate' },
    ];

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md rotate-2 hover:rotate-0 transition-transform duration-300">
                            <LayoutGrid className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Command Center
                            </h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                                <Clock className="h-3 w-3" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={fetchStats}
                            disabled={isLoading}
                            leftIcon={<RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
                            className="rounded-xl h-8 px-3 text-xs"
                        >
                            Refresh
                        </Button>
                        <Link href="/reports">
                            <Button
                                variant="primary"
                                leftIcon={<BarChart2 className="h-3.5 w-3.5" />}
                                className="rounded-xl h-8 px-3 text-xs"
                            >
                                Generate Report
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Primary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((card, idx) => (
                        <Link key={idx} href={card.link}>
                            <Card className="p-5 border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-900 hover:-translate-y-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
                                        {isLoading ? (
                                            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                                        ) : (
                                            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatNumber(card.value)}</p>
                                        )}
                                        <p className="text-[10px] font-medium text-slate-400 mt-1">{card.subtitle}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                                        <card.icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Details <ArrowUpRight className="h-3 w-3 ml-1" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Critical Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Security Score */}
                    <div className="lg:col-span-1">
                        <SecurityScoreCard score={securityStats.score} metrics={securityStats.metrics} />
                    </div>

                    {/* System Health */}
                    <div className="lg:col-span-1">
                        <SystemHealthWidget stats={stats} />
                    </div>

                    {/* Ticket Priorities */}
                    <div className="lg:col-span-1">
                        <Card className="p-4 border-none shadow-md bg-white dark:bg-slate-900 h-full flex flex-col">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                    <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                                </div>
                                Ticket Priorities
                            </h3>
                            <div className="flex-1 w-full min-h-[160px]">
                                <TicketPriorityChart data={ticketPriorityData} />
                            </div>
                        </Card>
                    </div>

                    {/* Renewals */}
                    <div className="lg:col-span-1">
                        <RenewalsWidget stats={stats} />
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Asset Distribution */}
                    <Card className="p-5 border-none shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                    <PieChartIcon className="h-3.5 w-3.5 text-white" />
                                </div>
                                Asset Distribution
                            </h3>
                            <Link href="/assets">
                                <button className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                    View All <ArrowUpRight className="h-3 w-3" />
                                </button>
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="flex-1 w-full min-h-[200px]">
                                <AssetDistributionChart data={assetData} />
                            </div>
                        )}
                    </Card>

                    {/* Employee Distribution */}
                    <Card className="p-5 border-none shadow-md bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                    <Activity className="h-3.5 w-3.5 text-white" />
                                </div>
                                Employee Distribution
                            </h3>
                            <Link href="/employees">
                                <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                                    View All <ArrowUpRight className="h-3 w-3" />
                                </button>
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="flex-1 w-full min-h-[200px]">
                                <EmployeeDeptChart data={employeeDeptData} />
                            </div>
                        )}
                    </Card>

                    {/* Ticket Status */}
                    <Card className="p-5 border-none shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                    <BarChart2 className="h-3.5 w-3.5 text-white" />
                                </div>
                                Ticket Status
                            </h3>
                            <Link href="/tickets">
                                <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                    View All <ArrowUpRight className="h-3 w-3" />
                                </button>
                            </Link>
                        </div>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="flex-1 w-full min-h-[200px]">
                                <TicketStatusChart data={ticketStatusData} />
                            </div>
                        )}
                    </Card>
                </div>

                {/* Bottom Section: Quick Actions + Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Quick Actions */}
                    <Card className="p-5 border-none shadow-md bg-white dark:bg-slate-900">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-indigo-500" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action, idx) => (
                                <Link key={idx} href={action.link}>
                                    <button className={`w-full p-3 rounded-xl border-2 border-${action.color}-100 dark:border-${action.color}-900/30 hover:border-${action.color}-300 dark:hover:border-${action.color}-700 bg-${action.color}-50/50 dark:bg-${action.color}-900/10 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/20 transition-all group`}>
                                        <action.icon className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400 mx-auto mb-1 group-hover:scale-110 transition-transform`} />
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{action.label}</p>
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </Card>

                    {/* Recent Tickets */}
                    <Card className="lg:col-span-2 p-5 border-none shadow-md bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                Recent Support Tickets
                            </h3>
                            <Link href="/tickets">
                                <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                    View All <ArrowUpRight className="h-3 w-3" />
                                </button>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-2 px-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                        <th className="py-2 px-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-2 px-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                        <th className="py-2 px-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requester</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-800/50">
                                                <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-40"></div></td>
                                                <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16"></div></td>
                                                <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16"></div></td>
                                                <td className="p-3"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24"></div></td>
                                            </tr>
                                        ))
                                    ) : stats?.tickets.recent.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                                    <p className="text-sm font-medium text-slate-500">No recent tickets</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        stats?.tickets.recent.map((ticket: any) => (
                                            <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-xs truncate">{ticket.subject}</td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant={ticket.ticketStatus === TicketStatusEnum.OPEN ? 'primary' : ticket.ticketStatus === TicketStatusEnum.CLOSED ? 'neutral' : 'success'}
                                                        className="text-[9px] px-2 py-0.5 font-bold uppercase"
                                                    >
                                                        {ticket.ticketStatus}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${ticket.priorityEnum === TicketPriorityEnum.URGENT ? 'text-rose-700 bg-rose-100 dark:bg-rose-900/30' :
                                                        ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/30' :
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
                </div>
            </div>
        </RouteGuard>
    );
}
