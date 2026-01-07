'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ticketService } from '@/lib/api/services';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import {
    Search, Edit, Trash2, Ticket, Clock, MessageSquare,
    Monitor, Cpu, Wifi, Mail, Lock, HelpCircle,
    AlertTriangle, CheckCircle, User, Users, Filter,
    Tag, PlusCircle
} from 'lucide-react';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum, UserRoleEnum } from '@adminvault/shared-models';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getSocket } from '@/lib/socket';

const CategoryConfig: Record<string, { icon: any, color: string, bg: string, gradient: string }> = {
    [TicketCategoryEnum.HARDWARE]: {
        icon: Monitor,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        gradient: 'from-blue-500 to-cyan-500'
    },
    [TicketCategoryEnum.SOFTWARE]: {
        icon: Cpu,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        gradient: 'from-purple-500 to-pink-500'
    },
    [TicketCategoryEnum.NETWORK]: {
        icon: Wifi,
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        gradient: 'from-cyan-500 to-teal-500'
    },
    [TicketCategoryEnum.EMAIL]: {
        icon: Mail,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        gradient: 'from-indigo-500 to-blue-500'
    },
    [TicketCategoryEnum.ACCESS]: {
        icon: Lock,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        gradient: 'from-rose-500 to-pink-500'
    },
    [TicketCategoryEnum.OTHER]: {
        icon: HelpCircle,
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800',
        gradient: 'from-slate-500 to-gray-500'
    },
};

interface TicketData {
    id: number;
    subject: string;
    ticketCode: string;
    description?: string;
    priorityEnum: TicketPriorityEnum;
    categoryEnum: TicketCategoryEnum;
    ticketStatus: TicketStatusEnum;
    employeeName?: string;
    employeeEmail?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function TicketsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { success, error: toastError } = useToast();

    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        categoryEnum: TicketCategoryEnum.OTHER,
        priorityEnum: TicketPriorityEnum.MEDIUM,
        ticketStatus: TicketStatusEnum.OPEN,
        ticketCode: '',
    });

    // Check if user is admin
    const isAdmin = user && (user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.SUPER_ADMIN);

    const getCompanyId = useCallback((): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId || 1;
    }, []);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            let response: any;
            if (viewMode === 'my') {
                response = await ticketService.getMyTickets();
            } else {
                response = await ticketService.getAllTickets(getCompanyId());
            }

            if (response.status) {
                const ticketData = (response as any).tickets || response.data || [];
                setTickets(ticketData);
            }
        } catch (error: any) {
            toastError(error.message || 'Failed to fetch tickets');
        } finally {
            setIsLoading(false);
        }
    }, [viewMode, getCompanyId, toastError]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // WebSocket for real-time ticket updates (Admins only)
    useEffect(() => {
        if (!isAdmin) return;

        const socket = getSocket();
        socket.emit('joinAdmins');

        socket.on('ticketCreated', (newTicket: any) => {
            // Refresh tickets to get full details including employee name
            fetchTickets();
            success('New ticket received!');
        });

        return () => {
            socket.off('ticketCreated');
        };
    }, [isAdmin, fetchTickets, success]);

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.ticketCode && ticket.ticketCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (ticket.employeeName && ticket.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || ticket.ticketStatus.toLowerCase() === statusFilter.toLowerCase();
        const matchesCategory = categoryFilter === 'all' || ticket.categoryEnum === categoryFilter;
        const matchesPriority = priorityFilter === 'all' || ticket.priorityEnum === priorityFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let response: any;
            if (editingTicket) {
                response = await ticketService.updateTicket({ ...formData, id: editingTicket.id } as any);
            } else {
                response = await ticketService.createTicket({
                    subject: formData.subject,
                    categoryEnum: formData.categoryEnum,
                    priorityEnum: formData.priorityEnum,
                    ticketStatus: TicketStatusEnum.OPEN,
                } as any);
            }

            if (response.status) {
                success(response.message || `Ticket ${editingTicket ? 'updated' : 'created'} successfully`);
                handleCloseModal();
                fetchTickets();
            } else {
                toastError(response.message || 'Operation failed');
            }
        } catch (error: any) {
            toastError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (ticket: any) => {
        setEditingTicket(ticket);
        setFormData({
            subject: ticket.subject,
            categoryEnum: ticket.categoryEnum,
            priorityEnum: ticket.priorityEnum,
            ticketStatus: ticket.ticketStatus,
            ticketCode: ticket.ticketCode,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (ticket: any) => {
        if (confirm(`Are you sure you want to delete ticket "${ticket.subject}"?`)) {
            setIsLoading(true);
            try {
                const response = await ticketService.deleteTicket({ id: ticket.id });
                if (response.status) {
                    success(response.message || 'Ticket deleted successfully');
                    fetchTickets();
                } else {
                    toastError(response.message || 'Delete failed');
                }
            } catch (error: any) {
                toastError(error.message || 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTicket(null);
        setFormData({
            subject: '',
            categoryEnum: TicketCategoryEnum.OTHER,
            priorityEnum: TicketPriorityEnum.MEDIUM,
            ticketStatus: TicketStatusEnum.OPEN,
            ticketCode: '',
        });
    };

    const statusCounts = {
        all: tickets.length,
        open: tickets.filter(t => t.ticketStatus === TicketStatusEnum.OPEN).length,
        in_progress: tickets.filter(t => t.ticketStatus === TicketStatusEnum.IN_PROGRESS).length,
        resolved: tickets.filter(t => t.ticketStatus === TicketStatusEnum.RESOLVED).length,
        closed: tickets.filter(t => t.ticketStatus === TicketStatusEnum.CLOSED).length,
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950">
            {/* Header */}
            <PageHeader
                icon={<Ticket />}
                title="Support Tickets"
                description={viewMode === 'my' ? 'Track your support requests' : 'Manage all support requests'}
                gradient="from-indigo-500 to-purple-600"
                actions={[
                    {
                        label: 'Create Ticket',
                        onClick: () => setIsModalOpen(true),
                        icon: <PlusCircle className="h-4 w-4" />,
                        variant: 'primary'
                    }
                ]}
            >
                <div className="flex items-center gap-3 w-full">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by subject or code..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* View Mode Toggle (Only for Admins) */}
                    {isAdmin && (
                        <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${viewMode === 'all'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <Users className="h-3.5 w-3.5" />
                                All
                            </button>
                            <button
                                onClick={() => setViewMode('my')}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${viewMode === 'my'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <User className="h-3.5 w-3.5" />
                                My
                            </button>
                        </div>
                    )}

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${showFilters
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </PageHeader>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium"
                        >
                            <option value="all">All Categories</option>
                            {Object.values(TicketCategoryEnum).map((cat) => (
                                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium"
                        >
                            <option value="all">All Statuses</option>
                            {Object.values(TicketStatusEnum).map((status) => (
                                <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow font-medium"
                        >
                            <option value="all">All Priorities</option>
                            {Object.values(TicketPriorityEnum).map((prio) => (
                                <option key={prio} value={prio}>{prio.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setCategoryFilter('all');
                                setPriorityFilter('all');
                                setStatusFilter('all');
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Dashboard with Animations */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="All Tickets"
                    value={statusCounts.all}
                    icon={Ticket}
                    gradient="from-indigo-500 to-violet-600"
                    iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Open"
                    value={statusCounts.open}
                    icon={AlertTriangle}
                    gradient="from-blue-500 to-cyan-600"
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    isLoading={isLoading}
                />
                <StatCard
                    title="In Progress"
                    value={statusCounts.in_progress}
                    icon={Clock}
                    gradient="from-amber-500 to-orange-600"
                    iconBg="bg-amber-50 dark:bg-amber-900/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Resolved"
                    value={statusCounts.resolved}
                    icon={CheckCircle}
                    gradient="from-emerald-500 to-teal-600"
                    iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Closed"
                    value={statusCounts.closed}
                    icon={Lock}
                    gradient="from-slate-500 to-gray-600"
                    iconBg="bg-slate-50 dark:bg-slate-800"
                    iconColor="text-slate-600 dark:text-slate-400"
                    isLoading={isLoading}
                />
            </div>

            {/* Tickets Grid with Premium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {isLoading && tickets.length === 0 ? (
                    <div className="col-span-full py-12 flex justify-center"><PageLoader /></div>
                ) : filteredTickets.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 mb-6 shadow-lg">
                            <Ticket className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Tickets Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => {
                        const Config = CategoryConfig[ticket.categoryEnum] || CategoryConfig[TicketCategoryEnum.OTHER];
                        const Icon = Config.icon;

                        return (
                            <Card key={ticket.id} className="group relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-xl bg-white dark:bg-slate-800">
                                {/* Gradient Top Border */}
                                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${Config.gradient}`} />

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />

                                <div className="p-4 relative z-10">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${Config.gradient} shadow-md transform group-hover:scale-110 transition-transform`}>
                                                <Icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    {ticket.categoryEnum}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-semibold flex items-center mt-0.5">
                                                    <Clock className="h-2.5 w-2.5 mr-1" />
                                                    {getTimeAgo(ticket.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge with Animation */}
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${ticket.ticketStatus === TicketStatusEnum.OPEN ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                            ticket.ticketStatus === TicketStatusEnum.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                                                ticket.ticketStatus === TicketStatusEnum.RESOLVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                            }`}>
                                            {ticket.ticketStatus.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-4 min-h-[4rem]">
                                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                            {ticket.subject}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag className="h-3 w-3 text-slate-400" />
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-900/50 inline-block px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
                                                {ticket.ticketCode || 'TKT-000'}
                                            </div>
                                        </div>
                                        {/* Employee Info with Avatar */}
                                        {ticket.employeeName && (
                                            <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${Config.gradient} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                                                    {ticket.employeeName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                                        {ticket.employeeName}
                                                    </div>
                                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                                                        {ticket.employeeEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <div className={`flex items-center text-[10px] font-black uppercase tracking-wider ${ticket.priorityEnum === TicketPriorityEnum.URGENT ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-800' :
                                            ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-800' :
                                                'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {(ticket.priorityEnum === TicketPriorityEnum.URGENT || ticket.priorityEnum === TicketPriorityEnum.HIGH) && (
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                            )}
                                            {ticket.priorityEnum}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => router.push(`/support?ticketId=${ticket.id}&ticketTitle=${encodeURIComponent(ticket.subject)}`)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all transform hover:scale-110"
                                                title="Open Chat"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(ticket)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all transform hover:scale-110"
                                                        title="Manage Status"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ticket)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all transform hover:scale-110"
                                                        title="Delete Ticket"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTicket ? "Manage Ticket Status" : "Create New Ticket"}
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                            {editingTicket ? 'Update Status' : 'Create Ticket'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {editingTicket ? (
                        <>
                            {/* Read-only Information */}
                            <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl space-y-4 border-2 border-slate-200 dark:border-slate-700">
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Subject</label>
                                    <div className="text-slate-900 dark:text-white font-bold text-lg mt-1">{formData.subject}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Category</label>
                                        <div className="text-slate-900 dark:text-white font-bold mt-1">{formData.categoryEnum}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Priority</label>
                                        <div className="text-slate-900 dark:text-white font-bold mt-1">{formData.priorityEnum}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Editable Status */}
                            <div>
                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3">
                                    Update Status
                                </label>
                                <select
                                    value={formData.ticketStatus}
                                    onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value as TicketStatusEnum })}
                                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold shadow-sm"
                                >
                                    <option value={TicketStatusEnum.OPEN}>Open</option>
                                    <option value={TicketStatusEnum.IN_PROGRESS}>In Progress</option>
                                    <option value={TicketStatusEnum.PENDING}>Pending</option>
                                    <option value={TicketStatusEnum.RESOLVED}>Resolved</option>
                                    <option value={TicketStatusEnum.CLOSED}>Closed</option>
                                </select>
                                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Changing status to <strong>Resolved</strong> or <strong>Closed</strong> will notify the user.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Create Mode */}
                            <Input
                                label="Subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief summary of the issue"
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3">
                                        Category
                                    </label>
                                    <select
                                        value={formData.categoryEnum}
                                        onChange={(e) => setFormData({ ...formData, categoryEnum: e.target.value as TicketCategoryEnum })}
                                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold shadow-sm"
                                    >
                                        {Object.values(TicketCategoryEnum).map((cat) => (
                                            <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priorityEnum}
                                        onChange={(e) => setFormData({ ...formData, priorityEnum: e.target.value as TicketPriorityEnum })}
                                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold shadow-sm"
                                    >
                                        {Object.values(TicketPriorityEnum).map((prio) => (
                                            <option key={prio} value={prio}>{prio.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </Modal>
        </div>
    );
}
