'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ticketService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import {
    Tag, Search, Edit, Trash2, Ticket, Clock, MessageSquare,
    Monitor, Cpu, Wifi, Mail, Lock, HelpCircle,
    AlertTriangle, CheckCircle, User, Users, Filter, Building2,
    Send, List, Plus, ChevronRight, Hash, MapPin, Phone, Briefcase, FileText, Shield, Activity, Calendar, TrendingUp, Star
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum, CompanyIdRequestModel, CreateTicketModel, UpdateTicketModel, DeleteTicketModel, UserRoleEnum, TicketSeverityEnum } from '@adminvault/shared-models';
import { Input } from '@/components/ui/Input';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
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
    [TicketCategoryEnum.REAL_ESTATE]: {
        icon: Building2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        gradient: 'from-emerald-500 to-green-500'
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
    slaDeadline?: string;
    timeSpentMinutes?: number;
}

const TicketsPage: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();



    // Check if user is admin or support admin
    const isAdmin = user && (
        user.role === UserRoleEnum.ADMIN ||
        user.role === UserRoleEnum.SUPER_ADMIN ||
        user.role === UserRoleEnum.SUPPORT_ADMIN ||
        user.role === UserRoleEnum.MANAGER
    );

    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    // Default to 'my' for non-admins
    const [viewMode, setViewMode] = useState<'all' | 'my'>('my');
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    // Update viewMode when user role is known
    useEffect(() => {
        if (isAdmin) {
            setViewMode('all');
        } else {
            setViewMode('my');
        }
    }, [isAdmin]);

    const [formData, setFormData] = useState({
        // Basic Info
        subject: '',
        description: '',
        categoryEnum: TicketCategoryEnum.OTHER,
        subCategory: '',
        priorityEnum: TicketPriorityEnum.MEDIUM,
        severityEnum: TicketSeverityEnum.LOW,
        ticketStatus: TicketStatusEnum.OPEN,
        ticketCode: '',

        // User Details
        department: '',
        contactNumber: '',
        location: '',
        contactEmail: '',

        // Admin / Assignment
        assignedGroup: '',
        assignedTo: '', // Display only for now or map to assignAdminId if user list available

        // SLA & Tracking
        slaType: '',
        responseDueTime: '',
        escalationLevel: 0,
        timeSpentMinutes: 0,

        // Resolution
        rootCause: '',
        resolutionSummary: '',
        closureRemarks: '',

        // Feedback
        userRating: 0,
        userFeedback: '',

        // Comments (simplified for UI, usually would be a list)
        adminComments: '',
        userComments: '',
        internalNotes: ''
    });

    const getCompanyId = useCallback((): number => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId || 1;
    }, []);

    const fetchTickets = useCallback(async () => {
        // setIsLoading(true);
        try {
            let response: any;
            // Force 'my' view for non-admins, regardless of state (double safety)
            const effectiveViewMode = isAdmin ? viewMode : 'my';

            if (effectiveViewMode === 'my') {
                console.log('Fetching MY tickets...');
                response = await ticketService.getMyTickets();
            } else {
                console.log('Fetching ALL tickets...');
                const req = new CompanyIdRequestModel(getCompanyId());
                response = await ticketService.getAllTickets(req);
            }

            console.log('Tickets response:', response);

            if (response.status) {
                const ticketData = (response as any).tickets || response.data || [];
                console.log('Parsed ticket data:', ticketData);
                setTickets(ticketData);
            } else {
                // Silently handle auth errors or empty states for better UX
                if (response.statusCode !== 404) {
                    console.error('Failed to fetch tickets:', response.message);
                }
                setTickets([]);
            }
        } catch (error: any) {
            console.error('Error fetching tickets:', error);
        } finally {
            // setIsLoading(false);
        }
    }, [viewMode, getCompanyId, isAdmin]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // WebSocket for real-time ticket updates (Admins only)
    useEffect(() => {
        if (!isAdmin) return;

        const socket = getSocket('/tickets');
        socket.emit('joinAdmins');

        socket.on('ticketCreated', (newTicket: any) => {
            fetchTickets();
            AlertMessages.getSuccessMessage('New ticket received!');
        });

        return () => {
            socket.off('ticketCreated');
        };
    }, [isAdmin, fetchTickets]);

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
            if (editingTicket) {
                const req = new UpdateTicketModel(
                    editingTicket.id,
                    formData.ticketCode,
                    formData.categoryEnum,
                    formData.priorityEnum,
                    formData.subject,
                    formData.ticketStatus,
                    undefined, // employeeId
                    undefined, // assignAdminId
                    formData.responseDueTime ? new Date(formData.responseDueTime) : undefined, // expectedCompletionDate
                    undefined, // resolvedAt
                    formData.timeSpentMinutes, // timeSpentMinutes
                    formData.description,
                    formData.subCategory,
                    formData.severityEnum,
                    formData.department,
                    formData.contactNumber,
                    formData.location,
                    formData.contactEmail,
                    formData.assignedGroup,
                    formData.slaType,
                    formData.responseDueTime ? new Date(formData.responseDueTime) : undefined, // responseDueTime (this seems duplicated in model? check later, but aligning with existing usage)
                    formData.escalationLevel,
                    formData.adminComments,
                    formData.userComments,
                    formData.internalNotes,
                    formData.rootCause,
                    formData.resolutionSummary,
                    undefined, // resolvedBy
                    formData.closureRemarks,
                    formData.userRating,
                    formData.userFeedback
                );
                const response = await ticketService.updateTicket(req);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Ticket updated successfully');
                    handleCloseModal();
                    fetchTickets();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Operation failed');
                }
            } else {
                // Creation is now handled on a separate page, but keeping this as backup or if needed
                const req = new CreateTicketModel(
                    '', // ticketCode - backend will generate
                    formData.categoryEnum,
                    formData.priorityEnum,
                    formData.subject,
                    TicketStatusEnum.PENDING,
                    undefined, // employeeId
                    undefined, // assignAdminId
                    formData.responseDueTime ? new Date(formData.responseDueTime) : undefined, // expectedCompletionDate
                    undefined, // resolvedAt
                    formData.timeSpentMinutes, // timeSpentMinutes
                    formData.description,
                    formData.subCategory,
                    formData.severityEnum,
                    formData.department,
                    formData.contactNumber,
                    formData.location,
                    formData.contactEmail,
                    formData.assignedGroup,
                    formData.slaType,
                    formData.responseDueTime ? new Date(formData.responseDueTime) : undefined, // responseDueTime
                    formData.escalationLevel,
                    formData.adminComments,
                    formData.userComments,
                    formData.internalNotes,
                    formData.rootCause,
                    formData.resolutionSummary,
                    undefined, // resolvedBy
                    formData.closureRemarks,
                    formData.userRating,
                    formData.userFeedback
                );
                const response = await ticketService.createTicket(req);

                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Ticket created successfully');
                    handleCloseModal();
                    fetchTickets();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Operation failed');
                }
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (ticket: any) => {
        setEditingTicket(ticket);
        setFormData({
            subject: ticket.subject,
            description: ticket.description || '',
            categoryEnum: ticket.categoryEnum,
            subCategory: ticket.subCategory || '',
            priorityEnum: ticket.priorityEnum,
            severityEnum: ticket.severityEnum || TicketSeverityEnum.LOW,
            ticketStatus: ticket.ticketStatus,
            ticketCode: ticket.ticketCode,

            department: ticket.department || '',
            contactNumber: ticket.contactNumber || '',
            location: ticket.location || '',
            contactEmail: ticket.contactEmail || '',

            assignedGroup: ticket.assignedGroup || '',
            assignedTo: ticket.assignAdminId ? String(ticket.assignAdminId) : '',

            slaType: ticket.slaType || '',
            responseDueTime: ticket.responseDueTime ? new Date(ticket.responseDueTime).toISOString().slice(0, 16) : '',
            escalationLevel: ticket.escalationLevel || 0,
            timeSpentMinutes: ticket.timeSpentMinutes || 0,

            rootCause: ticket.rootCause || '',
            resolutionSummary: ticket.resolutionSummary || '',
            closureRemarks: ticket.closureRemarks || '',

            userRating: ticket.userRating || 0,
            userFeedback: ticket.userFeedback || '',

            adminComments: ticket.adminComments || '',
            userComments: ticket.userComments || '',
            internalNotes: ticket.internalNotes || ''
        });
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const handleDelete = (ticket: any) => {
        setTicketToDelete(ticket);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;
        setIsLoading(true);
        try {
            const req = new DeleteTicketModel(ticketToDelete.id);
            const response = await ticketService.deleteTicket(req);
            if (response.status) {
                AlertMessages.getSuccessMessage(response.message || 'Ticket deleted successfully');
                fetchTickets();
            } else {
                AlertMessages.getErrorMessage(response.message || 'Delete failed');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
            setDeleteConfirmOpen(false);
            setTicketToDelete(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTicket(null);
        setActiveTab('info');
        setFormData({
            subject: '',
            description: '',
            categoryEnum: TicketCategoryEnum.OTHER,
            subCategory: '',
            priorityEnum: TicketPriorityEnum.MEDIUM,
            severityEnum: TicketSeverityEnum.LOW,
            ticketStatus: TicketStatusEnum.OPEN,
            ticketCode: '',
            department: '',
            contactNumber: '',
            location: '',
            contactEmail: '',
            assignedGroup: '',
            assignedTo: '',
            slaType: '',
            responseDueTime: '',
            escalationLevel: 0,
            timeSpentMinutes: 0,
            rootCause: '',
            resolutionSummary: '',
            closureRemarks: '',
            userRating: 0,
            userFeedback: '',
            adminComments: '',
            userComments: '',
            internalNotes: ''
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

    const getSLAStatus = (deadline?: string, status?: TicketStatusEnum) => {
        if (!deadline) return null;
        if (status === TicketStatusEnum.RESOLVED || status === TicketStatusEnum.CLOSED) return { label: 'SLA MET', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' };

        const now = new Date();
        const due = new Date(deadline);
        const diffMs = due.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs < 0) return { label: 'OVERDUE', color: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400' };
        if (diffHours < 4) return { label: 'DUE SOON', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' };
        return { label: `Due in ${Math.round(diffHours)}h`, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' };
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER]}>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
                <PageHeader
                    icon={<Ticket />}
                    title="Support Tickets"
                    description="Manage all support requests"
                    gradient="from-indigo-500 to-purple-600"
                >
                    <div className="flex items-center gap-3 w-full">
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

                        {/* Create Ticket Button - Visible to everyone */}
                        <Button
                            variant="primary"
                            onClick={() => router.push('/create-ticket')}
                            leftIcon={<Plus className="h-4 w-4" />}
                            className="whitespace-nowrap shadow-lg shadow-indigo-500/20"
                        >
                            Create Ticket
                        </Button>

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

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        title="All Tickets"
                        value={statusCounts.all}
                        icon={Ticket}
                        gradient="from-indigo-500 to-violet-600"
                        iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                        isLoading={false}
                    />
                    <StatCard
                        title="Open"
                        value={statusCounts.open}
                        icon={AlertTriangle}
                        gradient="from-blue-500 to-cyan-600"
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                        isLoading={false}
                    />
                    <StatCard
                        title="In Progress"
                        value={statusCounts.in_progress}
                        icon={Clock}
                        gradient="from-amber-500 to-orange-600"
                        iconBg="bg-amber-50 dark:bg-amber-900/20"
                        iconColor="text-amber-600 dark:text-amber-400"
                        isLoading={false}
                    />
                    <StatCard
                        title="Resolved"
                        value={statusCounts.resolved}
                        icon={CheckCircle}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={false}
                    />
                    <StatCard
                        title="Closed"
                        value={statusCounts.closed}
                        icon={Lock}
                        gradient="from-slate-500 to-gray-600"
                        iconBg="bg-slate-50 dark:bg-slate-800"
                        iconColor="text-slate-600 dark:text-slate-400"
                        isLoading={false}
                    />
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Ticket Code</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Requester</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                                                <Ticket className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Tickets Found</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Try adjusting your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => {
                                        const Config = CategoryConfig[ticket.categoryEnum] || CategoryConfig[TicketCategoryEnum.OTHER];
                                        const CategoryIcon = Config.icon;

                                        return (
                                            <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                                            {ticket.ticketCode || 'TKT-000'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="max-w-[300px]">
                                                        <div className="font-bold text-slate-900 dark:text-white truncate mb-0.5" title={ticket.subject}>
                                                            {ticket.subject}
                                                        </div>
                                                        {ticket.slaDeadline && (
                                                            (() => {
                                                                const sla = getSLAStatus(ticket.slaDeadline, ticket.ticketStatus);
                                                                if (sla) {
                                                                    return (
                                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${sla.color}`}>
                                                                            {sla.label}
                                                                        </span>
                                                                    );
                                                                }
                                                                return null;
                                                            })()
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${Config.gradient} text-white shadow-sm`}>
                                                            <CategoryIcon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {ticket.categoryEnum.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${ticket.ticketStatus === TicketStatusEnum.OPEN ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                                        ticket.ticketStatus === TicketStatusEnum.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' :
                                                            ticket.ticketStatus === TicketStatusEnum.RESOLVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' :
                                                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                        }`}>
                                                        {ticket.ticketStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${ticket.priorityEnum === TicketPriorityEnum.URGENT ? 'text-rose-600 dark:text-rose-400' :
                                                        ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-orange-600 dark:text-orange-400' :
                                                            'text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                        {(ticket.priorityEnum === TicketPriorityEnum.URGENT || ticket.priorityEnum === TicketPriorityEnum.HIGH) && (
                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                        )}
                                                        {ticket.priorityEnum}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {ticket.employeeName ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded bg-gradient-to-br ${Config.gradient} flex items-center justify-center text-white text-[10px] font-black`}>
                                                                {ticket.employeeName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{ticket.employeeName}</span>
                                                                <span className="text-[10px] text-slate-400">{ticket.employeeEmail}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {getTimeAgo(ticket.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => router.push(`/support?ticketId=${ticket.id}&ticketTitle=${encodeURIComponent(ticket.subject)}`)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                            title="Chat & Details"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                        </button>

                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(ticket)}
                                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                                    title="Edit Ticket"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(ticket)}
                                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                                                    title="Delete Ticket"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingTicket ? "Manage Ticket" : "Create New Ticket"}
                    size="2xl"
                    footer={
                        <>
                            <Button variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                                {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                            </Button>
                        </>
                    }
                >
                    <div className="flex flex-col h-full max-h-[70vh]">
                        {/* Tabs Header */}
                        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Ticket Info
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('user')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'user'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    User Details
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'admin'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin & SLA
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('resolution')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'resolution'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Resolution
                                </div>
                            </button>
                        </div>

                        {/* Tabs Content */}
                        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">

                            {/* Tab 1: Ticket Info */}
                            {activeTab === 'info' && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="Ticket subject"
                                                required
                                                className="font-bold text-lg"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Detailed description..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm min-h-[120px] resize-y"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                            <select
                                                value={formData.categoryEnum}
                                                onChange={(e) => setFormData({ ...formData, categoryEnum: e.target.value as TicketCategoryEnum })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                            >
                                                {Object.values(TicketCategoryEnum).map((cat) => (
                                                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Input
                                            label="Sub-Category"
                                            value={formData.subCategory}
                                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                            placeholder="e.g. Printer, Monitor"
                                        />

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                                            <select
                                                value={formData.priorityEnum}
                                                onChange={(e) => setFormData({ ...formData, priorityEnum: e.target.value as TicketPriorityEnum })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                            >
                                                {Object.values(TicketPriorityEnum).map((prio) => (
                                                    <option key={prio} value={prio}>{prio.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Severity</label>
                                            <select
                                                value={formData.severityEnum}
                                                onChange={(e) => setFormData({ ...formData, severityEnum: e.target.value as TicketSeverityEnum })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                            >
                                                {Object.values(TicketSeverityEnum).map((sev) => (
                                                    <option key={sev} value={sev}>{sev.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Status</label>
                                            <select
                                                value={formData.ticketStatus}
                                                onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value as TicketStatusEnum })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                                            >
                                                {Object.values(TicketStatusEnum).map((status) => (
                                                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: User Details */}
                            {activeTab === 'user' && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Department"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g. IT, HR"
                                            leftIcon={<Building2 className="h-4 w-4" />}
                                        />
                                        <Input
                                            label="Location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Floor 2, Building A"
                                            leftIcon={<MapPin className="h-4 w-4" />}
                                        />
                                        <Input
                                            label="Contact Number"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            placeholder="+1 234 567 890"
                                            leftIcon={<Phone className="h-4 w-4" />}
                                        />
                                        <Input
                                            label="Contact Email"
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                            placeholder="user@example.com"
                                            leftIcon={<Mail className="h-4 w-4" />}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Admin & SLA */}
                            {activeTab === 'admin' && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Assigned Group"
                                            value={formData.assignedGroup}
                                            onChange={(e) => setFormData({ ...formData, assignedGroup: e.target.value })}
                                            placeholder="e.g. Network Team"
                                            leftIcon={<Users className="h-4 w-4" />}
                                        />
                                        <Input
                                            label="SLA Type"
                                            value={formData.slaType}
                                            onChange={(e) => setFormData({ ...formData, slaType: e.target.value })}
                                            placeholder="e.g. Gold, Silver"
                                            leftIcon={<Activity className="h-4 w-4" />}
                                        />

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Response Due Time</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.responseDueTime}
                                                onChange={(e) => setFormData({ ...formData, responseDueTime: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm"
                                            />
                                        </div>

                                        <Input
                                            label="Escalation Level"
                                            type="number"
                                            value={formData.escalationLevel}
                                            onChange={(e) => setFormData({ ...formData, escalationLevel: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            leftIcon={<TrendingUp className="h-4 w-4" />}
                                        />

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                                                Internal Notes (Admin Only)
                                            </label>
                                            <textarea
                                                value={formData.internalNotes}
                                                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                                                placeholder="Private notes for admins..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium shadow-sm min-h-[100px] resize-y"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Resolution & Feedback */}
                            {activeTab === 'resolution' && (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                                                Root Cause
                                            </label>
                                            <textarea
                                                value={formData.rootCause}
                                                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                                                placeholder="Analysis of the root cause..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm min-h-[80px] resize-y"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                                                Resolution Summary
                                            </label>
                                            <textarea
                                                value={formData.resolutionSummary}
                                                onChange={(e) => setFormData({ ...formData, resolutionSummary: e.target.value })}
                                                placeholder="Steps taken to resolve..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm min-h-[80px] resize-y"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                                                Closure Remarks
                                            </label>
                                            <textarea
                                                value={formData.closureRemarks}
                                                onChange={(e) => setFormData({ ...formData, closureRemarks: e.target.value })}
                                                placeholder="Final remarks..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm min-h-[80px] resize-y"
                                            />
                                        </div>

                                        <Input
                                            label="User Rating (1-5)"
                                            type="number"
                                            min={0}
                                            max={5}
                                            value={formData.userRating}
                                            onChange={(e) => setFormData({ ...formData, userRating: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            leftIcon={<Star className="h-4 w-4" />}
                                        />

                                        <Input
                                            label="Time Spent (Minutes)"
                                            type="number"
                                            value={formData.timeSpentMinutes}
                                            onChange={(e) => setFormData({ ...formData, timeSpentMinutes: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            leftIcon={<Clock className="h-4 w-4" />}
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </Modal>

                <DeleteConfirmDialog
                    isOpen={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    itemName="Ticket"
                    message={ticketToDelete ? `Are you sure you want to delete ticket "${ticketToDelete.subject}"?` : undefined}
                    isDeleting={isLoading}
                />
            </div>
        </RouteGuard >
    );
}

export default TicketsPage;