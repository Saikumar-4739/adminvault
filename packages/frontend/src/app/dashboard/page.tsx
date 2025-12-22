'use client';

import { useDashboard } from '@/hooks/useDashboard';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import { Users, Package, Ticket, AlertCircle, Lock, RefreshCcw, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
    const { stats, isLoading, refresh } = useDashboard();

    // Data Transformation for Charts
    const assetData = stats?.assets.byStatus.map(item => ({
        name: item.status,
        value: parseInt(item.count)
    })) || [];

    const ticketPriorityData = stats?.tickets.byPriority.map(item => ({
        name: item.priority,
        value: parseInt(item.count)
    })) || [];

    const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#64748B']; // Emerald, Indigo, Amber, Slate

    const kpiCards = [
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
    ];

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-950">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time overview of system performance</p>
                    </div>
                    <Button variant="outline" onClick={refresh} disabled={isLoading} leftIcon={<RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
                        Refresh Data
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((card, idx) => (
                        <StatCard
                            key={idx}
                            title={card.title}
                            value={formatNumber(card.value)}
                            icon={card.icon}
                            gradient={card.gradient}
                            iconBg={card.bg}
                            iconColor={card.text}
                            isLoading={isLoading}
                        />
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Asset Distribution Chart */}
                    <Card className="p-6 border-none shadow-lg shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Package className="h-5 w-5 text-emerald-500" />
                            Asset Distribution
                        </h3>
                        {isLoading ? (
                            <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                        ) : (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assetData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {assetData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>

                    {/* Ticket Priority Chart */}
                    <Card className="p-6 border-none shadow-lg shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Tickets by Priority
                        </h3>
                        {isLoading ? (
                            <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                        ) : (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ticketPriorityData}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Recent Activity Table */}
                <Card className="p-6 border-none shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                        Recent Tickets
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Subject</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Created By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32"></div></td>
                                            <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-20"></div></td>
                                            <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-20"></div></td>
                                            <td className="p-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-24"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    stats?.tickets.recent.map((ticket: any) => (
                                        <tr key={ticket.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">{ticket.subject}</td>
                                            <td className="p-4">
                                                <Badge variant={ticket.ticketStatus === TicketStatusEnum.OPEN ? 'primary' : 'neutral'}>
                                                    {ticket.ticketStatus}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' :
                                                    'text-slate-600 bg-slate-100 dark:bg-slate-800'
                                                    }`}>
                                                    {ticket.priorityEnum}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
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
