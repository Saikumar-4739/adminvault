'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Modal } from '@/components/ui/modal';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Search, Edit, Trash2, Ticket, AlertCircle, Clock } from 'lucide-react';

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
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Support Tickets</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
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
                        className={`p-4 cursor-pointer transition-all border-none shadow-sm hover:shadow-md ${statusFilter === status.toLowerCase()
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                        onClick={() => setStatusFilter(status.toLowerCase())}
                    >
                        <div className={`text-2xl font-bold ${statusFilter === status.toLowerCase() ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'
                            }`}>{count}</div>
                        <div className={`text-sm font-medium ${statusFilter === status.toLowerCase() ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                            }`}>{status}</div>
                    </Card>
                ))}
            </div>

            {/* Search and Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="relative flex-1 w-full md:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                        <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <Search className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        className="block w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === 'All' ? 'all' : status)} // Assuming state uses 'all' lowercase for All
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === (status === 'All' ? 'all' : status)
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20'
                                : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full"><PageLoader /></div>
                ) : filteredTickets.length === 0 ? (
                    <div className="col-span-full">
                        <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-transparent shadow-none">
                            <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Ticket className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {searchQuery || statusFilter !== 'all' ? 'No tickets found matching your criteria' : 'No tickets have been created yet'}
                            </p>
                        </Card>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <Card key={ticket.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden relative flex flex-col h-full">
                            {/* Priority Stripe */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${ticket.priority === 'High' ? 'bg-rose-500' :
                                ticket.priority === 'Medium' ? 'bg-amber-500' :
                                    'bg-emerald-500'
                                }`} />

                            <div className="p-6 flex-1 flex flex-col">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'Open' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                        ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                    <div className="flex items-center text-xs text-slate-400 font-medium">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Today'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-6 flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1" title={ticket.title}>
                                        {ticket.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                        {ticket.description || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className={`flex items-center text-xs font-bold uppercase tracking-wider ${ticket.priority === 'High' ? 'text-rose-600 dark:text-rose-400' :
                                        ticket.priority === 'Medium' ? 'text-amber-600 dark:text-amber-400' :
                                            'text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                        <AlertCircle className="h-4 w-4 mr-1.5" />
                                        {ticket.priority} Priority
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(ticket)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ticket)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
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
