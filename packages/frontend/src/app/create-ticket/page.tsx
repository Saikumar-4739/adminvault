'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ticketService, authService } from '@/lib/api/services';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { Button } from '@/components/ui/Button';
import { RouteGuard } from '@/components/auth/RouteGuard';
import {
    IdRequestModel, TicketCategoryEnum, TicketPriorityEnum,
    TicketStatusEnum, CreateTicketModel, UpdateTicketModel, DeleteTicketModel
} from '@adminvault/shared-models';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import {
    Ticket, Plus, Search, Monitor, Cpu, Wifi, Mail, Lock, Building2, HelpCircle,
    MessageSquare, Edit, Trash2
} from 'lucide-react';

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
    employeeId?: number;
    employeeName?: string;
    employeeEmail?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    slaDeadline?: string | Date;
    timeSpentMinutes?: number;
    assignAdminId?: number;
}

const SupportHubPage: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [admins, setAdmins] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<TicketData | null>(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        categoryEnum: TicketCategoryEnum.OTHER,
        priorityEnum: TicketPriorityEnum.MEDIUM,
        assignAdminId: ''
    });

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await ticketService.getMyTickets();
            if (response.status && response.tickets) {
                setTickets(response.tickets);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAdmins = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const response = await authService.getAllUsers(new IdRequestModel(user.companyId));
            if (response.status && response.users) {
                setAdmins(response.users);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchTickets();
        fetchAdmins();
    }, [fetchTickets, fetchAdmins]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = () => {
        setEditingTicket(null);
        setFormData({
            subject: '',
            description: '',
            categoryEnum: TicketCategoryEnum.OTHER,
            priorityEnum: TicketPriorityEnum.MEDIUM,
            assignAdminId: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (ticket: TicketData) => {
        setEditingTicket(ticket);
        setFormData({
            subject: ticket.subject,
            description: ticket.description || '',
            categoryEnum: ticket.categoryEnum,
            priorityEnum: ticket.priorityEnum,
            assignAdminId: ticket.assignAdminId ? String(ticket.assignAdminId) : ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (ticket: TicketData) => {
        setTicketToDelete(ticket);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;
        setIsSubmitting(true);
        try {
            const response = await ticketService.deleteTicket(new DeleteTicketModel(ticketToDelete.id));
            if (response.status) {
                AlertMessages.getSuccessMessage('Ticket deleted successfully');
                setDeleteConfirmOpen(false);
                fetchTickets();
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to delete ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingTicket) {
                const model = new UpdateTicketModel(
                    editingTicket.id,
                    editingTicket.ticketCode,
                    formData.categoryEnum,
                    formData.priorityEnum,
                    formData.subject,
                    editingTicket.ticketStatus,
                    editingTicket.employeeId,
                    formData.assignAdminId ? Number(formData.assignAdminId) : undefined,
                    undefined,
                    undefined,
                    undefined,
                    formData.description
                );
                const response = await ticketService.updateTicket(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Ticket updated successfully');
                    setIsModalOpen(false);
                    fetchTickets();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreateTicketModel(
                    '',
                    formData.categoryEnum,
                    formData.priorityEnum,
                    formData.subject,
                    TicketStatusEnum.OPEN,
                    user?.id,
                    formData.assignAdminId ? Number(formData.assignAdminId) : undefined,
                    undefined,
                    undefined,
                    undefined,
                    formData.description
                );

                const response = await ticketService.createTicket(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Ticket created successfully');
                    setIsModalOpen(false);
                    fetchTickets();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to process ticket');
        } finally {
            setIsSubmitting(false);
        }
    };


    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <RouteGuard>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
                <PageHeader
                    icon={<Ticket />}
                    title={`Support Hub`}
                    gradient="from-indigo-500 to-purple-600"
                >
                    <div className="flex items-center gap-3 w-full">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search your tickets..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            leftIcon={<Plus className="h-4 w-4" />}
                            className="whitespace-nowrap shadow-lg shadow-indigo-500/20"
                        >
                            Create New Ticket
                        </Button>
                    </div>
                </PageHeader>


                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse border border-slate-200 dark:border-slate-700">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Code</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Subject</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Category</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Status</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Assigned To</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Priority</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-center">Date</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center border border-slate-200 dark:border-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-500">Loading your tickets...</td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                                                <Ticket className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Tickets Found</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't submitted any support requests yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => {
                                        const Config = CategoryConfig[ticket.categoryEnum] || CategoryConfig[TicketCategoryEnum.OTHER];
                                        const CategoryIcon = Config.icon;

                                        return (
                                            <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center">
                                                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                                        {ticket.ticketCode}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center">
                                                    <div className="font-bold text-slate-900 dark:text-white truncate max-w-[300px] mx-auto" title={ticket.subject}>
                                                        {ticket.subject}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${Config.gradient} text-white shadow-sm`}>
                                                            <CategoryIcon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            {ticket.categoryEnum.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${ticket.ticketStatus === TicketStatusEnum.OPEN ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                                        ticket.ticketStatus === TicketStatusEnum.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' :
                                                            ticket.ticketStatus === TicketStatusEnum.RESOLVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' :
                                                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                        }`}>
                                                        {ticket.ticketStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-300 font-bold">
                                                    {ticket.assignAdminId ? (
                                                        admins.length > 0 ? (
                                                            admins.find(a => a.id === ticket.assignAdminId)?.fullName || 'Admin'
                                                        ) : 'Loading...'
                                                    ) : 'Unassigned'}
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center">
                                                    <div className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider ${ticket.priorityEnum === TicketPriorityEnum.URGENT ? 'text-rose-600 dark:text-rose-400' :
                                                        ticket.priorityEnum === TicketPriorityEnum.HIGH ? 'text-orange-600 dark:text-orange-400' :
                                                            'text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                        {ticket.priorityEnum}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                                                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="py-4 px-6 border border-slate-200 dark:border-slate-700 text-center">
                                                    <div className="flex items-center justify-center gap-1 opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => router.push(`/support?ticketId=${ticket.id}&ticketTitle=${encodeURIComponent(ticket.subject)}`)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                            title="Chat & Details"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                        </button>
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
                    onClose={() => setIsModalOpen(false)}
                    title={editingTicket ? "Edit Support Request" : "Submit Support Request"}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />

                        <TextArea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Category"
                                name="categoryEnum"
                                value={formData.categoryEnum}
                                onChange={handleChange}
                                options={Object.values(TicketCategoryEnum).map(cat => ({
                                    value: cat,
                                    label: cat.replace(/_/g, ' ')
                                }))}
                                required
                            />

                            <Select
                                label="Priority"
                                name="priorityEnum"
                                value={formData.priorityEnum}
                                onChange={handleChange}
                                options={Object.values(TicketPriorityEnum).map(p => ({
                                    value: p,
                                    label: p
                                }))}
                                required
                            />
                        </div>

                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPPORT_ADMIN' || user?.role === 'MANAGER') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Assign To (Optional)"
                                    name="assignAdminId"
                                    value={formData.assignAdminId}
                                    onChange={handleChange}
                                    options={[
                                        { value: '', label: 'Select Admin' },
                                        ...admins.map(admin => ({
                                            value: String(admin.id),
                                            label: admin.fullName
                                        }))
                                    ]}
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                leftIcon={<Ticket className="h-4 w-4" />}
                            >
                                {editingTicket ? 'Update Request' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <DeleteConfirmDialog
                    isOpen={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    itemName="Ticket"
                    message={ticketToDelete ? `Are you sure you want to delete ticket "${ticketToDelete.subject}"?` : undefined}
                    isDeleting={isSubmitting}
                />
            </div>
        </RouteGuard>
    );
};

export default SupportHubPage;