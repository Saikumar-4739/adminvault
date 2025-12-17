'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Edit, Trash2, Ticket, AlertCircle, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function TicketsPage() {
    const { tickets, isLoading, createTicket, updateTicket, deleteTicket } = useTickets();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
    });

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTicket) {
            await updateTicket({ ...formData, id: editingTicket.id } as any);
        } else {
            await createTicket(formData as any);
        }

        handleCloseModal();
    };

    const handleEdit = (ticket: any) => {
        setEditingTicket(ticket);
        setFormData({
            title: ticket.title,
            description: ticket.description || '',
            status: ticket.status || 'Open',
            priority: ticket.priority || 'Medium',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (ticket: any) => {
        if (confirm(`Are you sure you want to delete ticket "${ticket.title}"?`)) {
            await deleteTicket({ id: ticket.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTicket(null);
        setFormData({ title: '', description: '', status: 'Open', priority: 'Medium' });
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'primary';
            case 'in progress': return 'warning';
            case 'resolved': return 'success';
            case 'closed': return 'secondary';
            default: return 'secondary';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'secondary';
        }
    };

    const statusCounts = {
        all: tickets.length,
        Open: tickets.filter(t => t.status === 'Open').length,
        'In Progress': tickets.filter(t => t.status === 'In Progress').length,
        Resolved: tickets.filter(t => t.status === 'Resolved').length,
        Closed: tickets.filter(t => t.status === 'Closed').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track and manage support requests
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Create Ticket
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <Card
                        key={status}
                        className={`p-4 cursor-pointer transition-all ${statusFilter === status.toLowerCase() ? 'ring-2 ring-primary-500' : ''
                            }`}
                        onClick={() => setStatusFilter(status.toLowerCase())}
                    >
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{status}</div>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card>
                <div className="p-4">
                    <Input
                        placeholder="Search tickets by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-5 w-5" />}
                    />
                </div>
            </Card>

            {/* Tickets List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </Card>
                    ))
                ) : filteredTickets.length === 0 ? (
                    <Card className="p-12">
                        <div className="text-center">
                            <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery || statusFilter !== 'all' ? 'No tickets found' : 'No tickets yet'}
                            </p>
                        </div>
                    </Card>
                ) : (
                    filteredTickets.map((ticket) => (
                        <Card key={ticket.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {ticket.title}
                                        </h3>
                                        <Badge variant={getStatusColor(ticket.status) as any}>
                                            {ticket.status || 'Open'}
                                        </Badge>
                                        <Badge variant={getPriorityColor(ticket.priority) as any}>
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {ticket.priority || 'Medium'}
                                        </Badge>
                                    </div>
                                    {ticket.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                                            {ticket.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {ticket.createdAt ? formatDateTime(ticket.createdAt) : 'Just now'}
                                        </div>
                                        {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                                            <div>Updated: {formatDateTime(ticket.updatedAt)}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Edit className="h-4 w-4" />}
                                        onClick={() => handleEdit(ticket)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                        onClick={() => handleDelete(ticket)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                            {editingTicket ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Brief description of the issue"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Detailed description of the issue..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
