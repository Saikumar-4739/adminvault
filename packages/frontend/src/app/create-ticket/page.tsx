'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';
import { Building2, CheckCircle, LogOut, Ticket, Monitor, Cpu, Wifi, Mail, Lock, HelpCircle, AlertTriangle, Send, Clock, MessageSquare, List, Plus } from 'lucide-react';

const CategoryIcons: Record<string, any> = {
    [TicketCategoryEnum.HARDWARE]: Monitor,
    [TicketCategoryEnum.SOFTWARE]: Cpu,
    [TicketCategoryEnum.NETWORK]: Wifi,
    [TicketCategoryEnum.EMAIL]: Mail,
    [TicketCategoryEnum.ACCESS]: Lock,
    [TicketCategoryEnum.OTHER]: HelpCircle,
};

const CategoryConfig: Record<string, { gradient: string, color: string }> = {
    [TicketCategoryEnum.HARDWARE]: { gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-600 dark:text-blue-400' },
    [TicketCategoryEnum.SOFTWARE]: { gradient: 'from-purple-500 to-pink-500', color: 'text-purple-600 dark:text-purple-400' },
    [TicketCategoryEnum.NETWORK]: { gradient: 'from-cyan-500 to-teal-500', color: 'text-cyan-600 dark:text-cyan-400' },
    [TicketCategoryEnum.EMAIL]: { gradient: 'from-indigo-500 to-blue-500', color: 'text-indigo-600 dark:text-indigo-400' },
    [TicketCategoryEnum.ACCESS]: { gradient: 'from-rose-500 to-pink-500', color: 'text-rose-600 dark:text-rose-400' },
    [TicketCategoryEnum.OTHER]: { gradient: 'from-slate-500 to-gray-500', color: 'text-slate-600 dark:text-slate-400' },
};

const PriorityColors: Record<string, { bg: string, text: string, border: string }> = {
    [TicketPriorityEnum.LOW]: {
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700'
    },
    [TicketPriorityEnum.MEDIUM]: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
    },
    [TicketPriorityEnum.HIGH]: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
    },
    [TicketPriorityEnum.URGENT]: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800'
    },
};

export default function CreateTicketPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { tickets, createTicket, isLoading, fetchMyTickets } = useTickets();
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'tickets' | 'create'>('tickets');
    const [formData, setFormData] = useState({ subject: '', categoryEnum: TicketCategoryEnum.OTHER, priorityEnum: TicketPriorityEnum.MEDIUM, ticketStatus: TicketStatusEnum.OPEN, ticketCode: '' });

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await createTicket({
                subject: formData.subject,
                categoryEnum: formData.categoryEnum,
                priorityEnum: formData.priorityEnum,
                ticketStatus: TicketStatusEnum.OPEN,
            } as any);

            if (success) {
                setIsSuccess(true);
                setFormData({
                    subject: '',
                    categoryEnum: TicketCategoryEnum.OTHER,
                    priorityEnum: TicketPriorityEnum.MEDIUM,
                    ticketStatus: TicketStatusEnum.OPEN,
                    ticketCode: '',
                });
                // Refresh tickets list
                setTimeout(() => {
                    fetchMyTickets();
                    setIsSuccess(false);
                    setActiveTab('tickets');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

    const SelectedCategoryIcon = CategoryIcons[formData.categoryEnum];
    const selectedPriorityColor = PriorityColors[formData.priorityEnum];

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center border-2 border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10"></div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 animate-bounce">
                                <CheckCircle className="h-12 w-12 text-white" strokeWidth={3} />
                            </div>

                            <div className="mb-6">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                    Ticket Submitted!
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                    Your support ticket has been created successfully. Redirecting to your tickets...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950">
            {/* Clean Header */}
            <PageHeader
                icon={Building2}
                title="Support Portal"
                subtitle="Welcome back! Manage your support tickets here"
                actions={
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        leftIcon={<LogOut className="h-4 w-4" />}
                    >
                        Logout
                    </Button>
                }
            />

            {/* Tab Navigation */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'tickets'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl border-2 border-indigo-200 dark:border-indigo-800'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                >
                    <List className="h-6 w-6" />
                    My Tickets ({tickets.length})
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${activeTab === 'create'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl border-2 border-indigo-200 dark:border-indigo-800'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                >
                    <Plus className="h-6 w-6" />
                    Create New Ticket
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'tickets' ? (
                /* My Tickets Table */
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b-2 border-slate-200 dark:border-slate-700">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Ticket className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                            Your Support Tickets
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                            Track and manage all your support requests
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Loading your tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ticket className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Tickets Yet</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">You haven't created any support tickets yet</p>
                            <Button
                                variant="primary"
                                onClick={() => setActiveTab('create')}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b-2 border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Ticket
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700">
                                    {tickets.map((ticket) => {
                                        const Config = CategoryConfig[ticket.categoryEnum];
                                        const Icon = CategoryIcons[ticket.categoryEnum];
                                        const priorityColor = PriorityColors[ticket.priorityEnum];

                                        return (
                                            <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${Config.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                                            <Icon className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                                                                {ticket.subject}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                                                                #{ticket.ticketCode}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${Config.color} bg-slate-100 dark:bg-slate-900`}>
                                                        {ticket.categoryEnum.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                                                        {ticket.priorityEnum === TicketPriorityEnum.URGENT || ticket.priorityEnum === TicketPriorityEnum.HIGH ? (
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                        ) : null}
                                                        {ticket.priorityEnum.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${ticket.ticketStatus === TicketStatusEnum.OPEN ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                                        ticket.ticketStatus === TicketStatusEnum.IN_PROGRESS ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                                                            ticket.ticketStatus === TicketStatusEnum.RESOLVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                                                'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                        }`}>
                                                        {ticket.ticketStatus.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                        <Clock className="h-4 w-4" />
                                                        {getTimeAgo(ticket.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => router.push(`/support?ticketId=${ticket.id}&ticketTitle=${encodeURIComponent(ticket.subject)}`)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-bold text-sm transition-colors"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Create New Ticket Form */
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="relative px-8 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <Ticket className="h-6 w-6 text-white" />
                                <h2 className="text-2xl font-black text-white">Create New Ticket</h2>
                            </div>
                            <p className="text-white/90 font-medium">
                                Describe your issue and we'll get back to you as soon as possible
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Subject Input */}
                        <div>
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                                What's the issue?
                            </label>
                            <Input
                                value={formData.subject}
                                onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="e.g., Unable to access email account, Network connectivity issues..."
                                required
                                className="text-base py-4"
                            />
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Provide a clear, concise description of your problem
                            </p>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                                Select Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.values(TicketCategoryEnum).map((cat) => {
                                    const Icon = CategoryIcons[cat];
                                    const isSelected = formData.categoryEnum === cat;
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, categoryEnum: cat })}
                                            className={`p-4 rounded-2xl border-2 transition-all transform hover:scale-105 ${isSelected
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-600 shadow-lg shadow-indigo-500/30'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                }`}
                                        >
                                            <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                                                }`} />
                                            <div className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                {cat}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Priority Selection */}
                        <div>
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                                Priority Level
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.values(TicketPriorityEnum).map((prio) => {
                                    const isSelected = formData.priorityEnum === prio;
                                    const colors = PriorityColors[prio];
                                    return (
                                        <button
                                            key={prio}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priorityEnum: prio })}
                                            className={`p-4 rounded-2xl border-2 transition-all transform hover:scale-105 ${isSelected
                                                ? `${colors.bg} ${colors.border} shadow-lg ring-2 ring-offset-2 ${colors.border}`
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {(prio === TicketPriorityEnum.HIGH || prio === TicketPriorityEnum.URGENT) && (
                                                <AlertTriangle className={`h-5 w-5 mx-auto mb-2 ${isSelected ? colors.text : 'text-slate-400'
                                                    }`} />
                                            )}
                                            <div className={`text-sm font-black uppercase tracking-wider ${isSelected ? colors.text : 'text-slate-600 dark:text-slate-400'
                                                }`}>
                                                {prio}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <SelectedCategoryIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                        Preview
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate">
                                        {formData.subject || 'Your ticket subject will appear here'}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                            {formData.categoryEnum.toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${selectedPriorityColor.bg} ${selectedPriorityColor.text} border ${selectedPriorityColor.border}`}>
                                            {formData.priorityEnum.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full justify-center text-base font-bold py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                                isLoading={isLoading}
                            >
                                <Send className="h-5 w-5 mr-2" />
                                Submit Ticket
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreateTicketPage;
