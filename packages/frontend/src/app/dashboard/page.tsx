'use client';

import { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDashboard } from '@/hooks/useDashboard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Users, Package, Ticket, AlertCircle, Lock, RefreshCcw, TrendingUp, Plus, FileText, Activity, PieChart as PieChartIcon, BarChart2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// Lazy load chart components to reduce initial bundle size
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });

// Color constants (moved outside component to prevent recreation)
const COLORS = {
    emerald: '#10B981',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    sky: '#0EA5E9',
    blue: '#3B82F6',
    indigo: '#6366F1',
    violet: '#8B5CF6',
    purple: '#A855F7',
    fuchsia: '#D946EF',
    pink: '#EC4899',
    rose: '#F43F5E',
    orange: '#F97316',
    amber: '#F59E0B',
    yellow: '#EAB308',
    lime: '#84CC16',
    green: '#22C55E'
};

const CHART_COLORS = [
    COLORS.emerald,
    COLORS.violet,
    COLORS.amber,
    COLORS.rose,
    COLORS.cyan,
    COLORS.fuchsia,
    COLORS.orange,
    COLORS.blue
];

export default function DashboardPage() {
    const { stats, isLoading, refresh } = useDashboard();

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
                {/* Compact Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time system overview</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={refresh}
                        disabled={isLoading}
                        leftIcon={<RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
                        className="text-sm py-1.5 px-3"
                    >
                        Refresh
                    </Button>
                </div>

                {/* Compact KPI Cards */}
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

                {/* Quick Actions */}
                <Card className="p-3 border-none shadow-md">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-2">Quick Actions:</span>
                        <Link href="/create-ticket">
                            <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} className="text-xs py-1 px-2.5">
                                New Ticket
                            </Button>
                        </Link>
                        <Link href="/assets">
                            <Button variant="outline" size="sm" leftIcon={<Package className="h-3.5 w-3.5" />} className="text-xs py-1 px-2.5">
                                Add Asset
                            </Button>
                        </Link>
                        <Link href="/documents">
                            <Button variant="outline" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />} className="text-xs py-1 px-2.5">
                                Documents
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Compact Charts Section - 4 Different Chart Types */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Asset Distribution - Donut Chart */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                                <PieChartIcon className="h-3.5 w-3.5 text-white" />
                            </div>
                            Asset Distribution
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={1} />
                                                <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <Pie
                                            data={assetData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {assetData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={24}
                                            iconSize={10}
                                            wrapperStyle={{ fontSize: '11px', fontWeight: '500' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>

                    {/* Ticket Priority - Vertical Bar Chart with Gradient */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                                <AlertCircle className="h-3.5 w-3.5 text-white" />
                            </div>
                            Tickets by Priority
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ticketPriorityData}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.amber} stopOpacity={1} />
                                                <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.7} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            fontWeight={500}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            fontWeight={500}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="url(#barGradient)"
                                            radius={[6, 6, 0, 0]}
                                            barSize={35}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>

                    {/* Employee Department - Area Chart */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                                <Activity className="h-3.5 w-3.5 text-white" />
                            </div>
                            Employees by Department
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={employeeDeptData}>
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.violet} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            fontWeight={500}
                                            angle={-15}
                                            textAnchor="end"
                                            height={50}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            fontWeight={500}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={COLORS.violet}
                                            strokeWidth={3}
                                            fill="url(#areaGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>

                    {/* Ticket Status - Horizontal Bar Chart */}
                    <Card className="p-4 border-none shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                                <BarChart2 className="h-3.5 w-3.5 text-white" />
                            </div>
                            Tickets by Status
                        </h3>
                        {isLoading ? (
                            <div className="h-48 animate-pulse bg-white/50 dark:bg-slate-800/50 rounded-lg"></div>
                        ) : (
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ticketStatusData} layout="vertical">
                                        <defs>
                                            <linearGradient id="horizontalGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor={COLORS.blue} stopOpacity={1} />
                                                <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.7} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                        <XAxis
                                            type="number"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            fontWeight={500}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            width={80}
                                            fontWeight={500}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="url(#horizontalGradient)"
                                            radius={[0, 6, 6, 0]}
                                            barSize={22}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
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
            </div>
        </RouteGuard>
    );
}
