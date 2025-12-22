'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTickets } from '@/hooks/useTickets';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/modal';
import { PageLoader } from '@/components/ui/Spinner';
import {
    Search, Edit, Trash2, Ticket, Clock, MessageSquare,
    Monitor, Cpu, Wifi, Mail, Lock, HelpCircle, FileText,
    AlertTriangle, CheckCircle, Plus
} from 'lucide-react';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';
import Input from '@/components/ui/Input';

const CategoryConfig: Record<string, { icon: any, color: string, bg: string }> = {
    [TicketCategoryEnum.HARDWARE]: { icon: Monitor, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    [TicketCategoryEnum.SOFTWARE]: { icon: Cpu, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    [TicketCategoryEnum.NETWORK]: { icon: Wifi, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    [TicketCategoryEnum.EMAIL]: { icon: Mail, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    [TicketCategoryEnum.ACCESS]: { icon: Lock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    [TicketCategoryEnum.OTHER]: { icon: HelpCircle, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' },
};

import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum } from '@adminvault/shared-models';

export default function TicketsPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Redirect standard users to create-ticket page if they try to access this list view
    if (user && (user.role === UserRoleEnum.USER || user.role === UserRoleEnum.VIEWER)) {
        router.push('/create-ticket');
        return null; // Prevent rendering
    }

    const { tickets, isLoading, createTicket, updateTicket, deleteTicket } = useTickets();
    // const { companies } = useCompanies(); // Unused for now
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    // const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all'); // Unused
    const [formData, setFormData] = useState({
        subject: '',
        categoryEnum: TicketCategoryEnum.OTHER,
        priorityEnum: TicketPriorityEnum.MEDIUM,
        ticketStatus: TicketStatusEnum.OPEN,
        ticketCode: '',
    });

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.ticketCode && ticket.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || ticket.ticketStatus.toLowerCase() === statusFilter.toLowerCase();
        // Placeholder for company filtering logic once ticket entity has companyId
        // const matchesCompany = selectedCompanyId === 'all' || ticket.companyId === Number(selectedCompanyId); 
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTicket) {
                await updateTicket({ ...formData, id: editingTicket.id } as any);
            } else {
                await createTicket({
                    subject: formData.subject,
                    categoryEnum: formData.categoryEnum,
                    priorityEnum: formData.priorityEnum,
                    ticketStatus: TicketStatusEnum.OPEN, // Always start as Open
                } as any);
            }
            handleCloseModal();
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleCreate = () => {
        setEditingTicket(null);
        setFormData({
            subject: '',
            categoryEnum: TicketCategoryEnum.OTHER,
            priorityEnum: TicketPriorityEnum.MEDIUM,
            ticketStatus: TicketStatusEnum.OPEN,
            ticketCode: '',
        });
        setIsModalOpen(true);
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
            await deleteTicket({ id: ticket.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTicket(null);
    };

    const statusCounts = {
        all: tickets.length,
        open: tickets.filter(t => t.ticketStatus === TicketStatusEnum.OPEN).length,
        in_progress: tickets.filter(t => t.ticketStatus === TicketStatusEnum.IN_PROGRESS).length,
        resolved: tickets.filter(t => t.ticketStatus === TicketStatusEnum.RESOLVED).length,
        closed: tickets.filter(t => t.ticketStatus === TicketStatusEnum.CLOSED).length,
    };

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header with Search and Organization Dropdown */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                        Ticket Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Review and manage support requests
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Organization Dropdown (Only show if filtering logic implemented properly or needed) */}
                    {/* <div className="relative min-w-[240px]"> ... </div> */}

                    <Button onClick={handleCreate} leftIcon={<Plus className="h-4 w-4" />}>
                        Create Ticket
                    </Button>
                </div>
            </div>

            {/* Stats Dashboard */}
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="All Tickets"
                    value={statusCounts.all}
                    icon={Ticket}
                    gradient="from-indigo-500 to-violet-600"
                    iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    isActive={statusFilter === 'all'}
                    onClick={() => setStatusFilter('all')}
                    className="cursor-pointer"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Open"
                    value={statusCounts.open}
                    icon={AlertTriangle}
                    gradient="from-blue-500 to-cyan-600"
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    isActive={statusFilter === 'open'}
                    onClick={() => setStatusFilter('open')}
                    className="cursor-pointer"
                    isLoading={isLoading}
                />
                <StatCard
                    title="In Progress"
                    value={statusCounts.in_progress}
                    icon={Clock}
                    gradient="from-amber-500 to-orange-600"
                    iconBg="bg-amber-50 dark:bg-amber-900/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    isActive={statusFilter === 'in_progress'}
                    onClick={() => setStatusFilter('in_progress')}
                    className="cursor-pointer"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Resolved"
                    value={statusCounts.resolved}
                    icon={CheckCircle}
                    gradient="from-emerald-500 to-teal-600"
                    iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    isActive={statusFilter === 'resolved'}
                    onClick={() => setStatusFilter('resolved')}
                    className="cursor-pointer"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Closed"
                    value={statusCounts.closed}
                    icon={Lock}
                    gradient="from-slate-500 to-gray-600"
                    iconBg="bg-slate-50 dark:bg-slate-800"
                    iconColor="text-slate-600 dark:text-slate-400"
                    isActive={statusFilter === 'closed'}
                    onClick={() => setStatusFilter('closed')}
                    className="cursor-pointer"
                    isLoading={isLoading}
                />
            </div>



            {/* Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 flex justify-center"><PageLoader /></div>
                ) : filteredTickets.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Ticket className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Tickets Found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => {
                        const Config = CategoryConfig[ticket.categoryEnum] || CategoryConfig[TicketCategoryEnum.OTHER];
                        const Icon = Config.icon;

                        return (
                            <Card key={ticket.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                {/* Top Status Strip */}
                                <div className={`absolute top-0 inset-x-0 h-1 ${ticket.ticketStatus === TicketStatusEnum.RESOLVED ? 'bg-emerald-500' :
                                    ticket.ticketStatus === TicketStatusEnum.CLOSED ? 'bg-slate-500' :
                                        'bg-indigo-500'
                                    }`} />

                                <div className="p-6">
                                    {/* Header: Icon + Category + Date */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${Config.bg} ${Config.color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className={`text-xs font-bold uppercase tracking-wider ${Config.color}`}>
                                                    {ticket.categoryEnum}
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium flex items-center mt-0.5">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Today'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ticket.ticketStatus === TicketStatusEnum.OPEN ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                            ticket.ticketStatus === TicketStatusEnum.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                                                ticket.ticketStatus === TicketStatusEnum.RESOLVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                            }`}>
                                            {ticket.ticketStatus.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6 min-h-[4rem]">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {ticket.subject}
                                        </h3>
                                        <div className="text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 inline-block px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                            #{ticket.ticketCode || 'TKT-000'}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className={`flex items-center text-xs font-bold uppercase tracking-wider ${ticket.priorityEnum === TicketPriorityEnum.URGENT ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded' :
                                            ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded' :
                                                'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {(ticket.priorityEnum === TicketPriorityEnum.URGENT || ticket.priorityEnum === TicketPriorityEnum.HIGH) && (
                                                <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                                            )}
                                            {ticket.priorityEnum} Priority
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => router.push(`/support?ticketId=${ticket.id}&ticketTitle=${encodeURIComponent(ticket.subject)}`)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors tooltip"
                                                title="Open Chat"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(ticket)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                title="Manage Status"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ticket)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                title="Delete Ticket"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Edit Modal / Create Modal */}
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
                            {/* Read-only Information for Editing */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
                                    <div className="text-slate-900 dark:text-white font-medium">{formData.subject}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                                        <div className="text-slate-900 dark:text-white font-medium">{formData.categoryEnum}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                                        <div className="text-slate-900 dark:text-white font-medium">{formData.priorityEnum}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Editable Status */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Update Status
                                </label>
                                <select
                                    value={formData.ticketStatus}
                                    onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value as TicketStatusEnum })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                >
                                    <option value={TicketStatusEnum.OPEN}>Open</option>
                                    <option value={TicketStatusEnum.IN_PROGRESS}>In Progress</option>
                                    <option value={TicketStatusEnum.PENDING}>Pending</option>
                                    <option value={TicketStatusEnum.RESOLVED}>Resolved</option>
                                    <option value={TicketStatusEnum.CLOSED}>Closed</option>
                                </select>
                                <p className="mt-2 text-xs text-slate-500">
                                    Changing status to <strong>Resolved</strong> or <strong>Closed</strong> will notify the user.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Create Mode Inputs */}
                            <Input
                                label="Subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief summary of the issue"
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.categoryEnum}
                                        onChange={(e) => setFormData({ ...formData, categoryEnum: e.target.value as TicketCategoryEnum })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    >
                                        {Object.values(TicketCategoryEnum).map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priorityEnum}
                                        onChange={(e) => setFormData({ ...formData, priorityEnum: e.target.value as TicketPriorityEnum })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    >
                                        {Object.values(TicketPriorityEnum).map((prio) => (
                                            <option key={prio} value={prio}>{prio}</option>
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

