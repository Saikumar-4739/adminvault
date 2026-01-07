'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ticketService } from '@/lib/api/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';
import { Building2, CheckCircle, Ticket, Monitor, Cpu, Wifi, Mail, Lock, HelpCircle, AlertTriangle, Send, MessageSquare, List, Plus, Clock, ChevronRight, Hash, Layers, Zap } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { getSocket } from '@/lib/socket';

const CategoryIcons: Record<string, any> = {
    [TicketCategoryEnum.HARDWARE]: Monitor,
    [TicketCategoryEnum.SOFTWARE]: Cpu,
    [TicketCategoryEnum.NETWORK]: Wifi,
    [TicketCategoryEnum.EMAIL]: Mail,
    [TicketCategoryEnum.ACCESS]: Lock,
    [TicketCategoryEnum.OTHER]: HelpCircle,
};

const CategoryStyles: Record<string, { bg: string, text: string, iconBg: string }> = {
    [TicketCategoryEnum.HARDWARE]: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', iconBg: 'bg-blue-500' },
    [TicketCategoryEnum.SOFTWARE]: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', iconBg: 'bg-purple-500' },
    [TicketCategoryEnum.NETWORK]: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400', iconBg: 'bg-cyan-500' },
    [TicketCategoryEnum.EMAIL]: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', iconBg: 'bg-indigo-500' },
    [TicketCategoryEnum.ACCESS]: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', iconBg: 'bg-rose-500' },
    [TicketCategoryEnum.OTHER]: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', iconBg: 'bg-slate-500' },
};

const PriorityConfig: Record<string, { bg: string, text: string, border: string, dot: string }> = {
    [TicketPriorityEnum.LOW]: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
    [TicketPriorityEnum.MEDIUM]: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', dot: 'bg-blue-500' },
    [TicketPriorityEnum.HIGH]: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50', dot: 'bg-orange-500' },
    [TicketPriorityEnum.URGENT]: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50', dot: 'bg-rose-500' },
};

const StatusStyles: Record<string, { bg: string, text: string, animate: boolean }> = {
    [TicketStatusEnum.OPEN]: { bg: 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', text: 'Open', animate: true },
    [TicketStatusEnum.IN_PROGRESS]: { bg: 'bg-amber-50/50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800', text: 'In Progress', animate: true },
    [TicketStatusEnum.RESOLVED]: { bg: 'bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', text: 'Resolved', animate: false },
    [TicketStatusEnum.CLOSED]: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700', text: 'Closed', animate: false },
};

interface TicketData {
    id: number;
    subject: string;
    ticketCode: string;
    priorityEnum: TicketPriorityEnum;
    categoryEnum: TicketCategoryEnum;
    ticketStatus: TicketStatusEnum;
    createdAt?: string;
}

export default function CreateTicketPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { success, error: toastError } = useToast();

    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'tickets' | 'create'>('tickets');
    const [formData, setFormData] = useState({
        subject: '',
        categoryEnum: TicketCategoryEnum.OTHER,
        priorityEnum: TicketPriorityEnum.MEDIUM,
        ticketStatus: TicketStatusEnum.OPEN,
        ticketCode: ''
    });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'create' || tab === 'tickets') {
            setActiveTab(tab as 'tickets' | 'create');
        }
    }, [searchParams]);

    const fetchMyTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await ticketService.getMyTickets();
            if (response.status) {
                // Support both standard 'data' and explicit 'tickets' fields for robustness
                const ticketData = (response as any).tickets || response.data || [];
                setTickets(ticketData);
            }
        } catch (error: any) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyTickets();
    }, [fetchMyTickets]);

    // WebSocket for real-time ticket updates (User status changes)
    useEffect(() => {
        const socket = getSocket();

        socket.on('ticketUpdated', (updatedTicket: any) => {
            // Refresh to get latest data if one of our tickets was updated
            fetchMyTickets();
        });

        return () => {
            socket.off('ticketUpdated');
        };
    }, [fetchMyTickets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await ticketService.createTicket({
                subject: formData.subject,
                categoryEnum: formData.categoryEnum,
                priorityEnum: formData.priorityEnum,
                ticketStatus: TicketStatusEnum.OPEN,
            } as any);

            if (response.status) {
                setIsSuccess(true);
                success(response.message || 'Ticket created successfully');
                setFormData({
                    subject: '',
                    categoryEnum: TicketCategoryEnum.OTHER,
                    priorityEnum: TicketPriorityEnum.MEDIUM,
                    ticketStatus: TicketStatusEnum.OPEN,
                    ticketCode: '',
                });

                setTimeout(() => {
                    fetchMyTickets();
                    setIsSuccess(false);
                    setActiveTab('tickets');
                    router.push('/create-ticket?tab=tickets');
                }, 1500);
            } else {
                toastError(response.message || 'Failed to create ticket');
            }
        } catch (error: any) {
            toastError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (isSuccess) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-center border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                        <CheckCircle className="h-10 w-10 text-white" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Submitted!</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Your request is being processed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-slate-50/50 dark:bg-slate-950/50">
            <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Compact Premium Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">Support Hub</h1>
                            <p className="text-[11px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                                <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                                Enterprise Assistance
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'tickets'
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <List className="h-3.5 w-3.5" />
                            My Tickets
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === 'create'
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New Request
                        </button>
                    </div>
                </div>

                {/* Main Content - Full Width */}
                <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {activeTab === 'tickets' ? (
                        /* Compact Table View */
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Recent Activity</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    Total: {tickets.length} Records
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/30">
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Reference</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Subject & Inquiry</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Category</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Priority</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Status</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Logged At</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {isLoading && tickets.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-12 text-center">
                                                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : tickets.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-5 py-20 text-center">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                        <Ticket className="h-6 w-6 text-slate-300" />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Records Found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            tickets.map((ticket) => {
                                                const cat = CategoryStyles[ticket.categoryEnum] || CategoryStyles[TicketCategoryEnum.OTHER];
                                                const prio = PriorityConfig[ticket.priorityEnum] || PriorityConfig[TicketPriorityEnum.MEDIUM];
                                                const stat = StatusStyles[ticket.ticketStatus] || StatusStyles[TicketStatusEnum.OPEN];
                                                const Icon = CategoryIcons[ticket.categoryEnum] || HelpCircle;

                                                return (
                                                    <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-500/5 transition-colors">
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                                                <span className="text-indigo-500 opacity-50">#</span>
                                                                {ticket.ticketCode}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-sm">
                                                                {ticket.subject}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${cat.bg} border border-transparent`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${cat.iconBg}`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${cat.text}`}>
                                                                    {ticket.categoryEnum}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${prio.bg} border ${prio.border}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${prio.text}`}>
                                                                    {ticket.priorityEnum}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${stat.bg}`}>
                                                                {stat.animate && <div className="w-1 h-1 rounded-full bg-current animate-pulse" />}
                                                                {stat.text}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                                <Clock className="h-3 w-3 opacity-50" />
                                                                {getTimeAgo(ticket.createdAt)}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <button
                                                                onClick={() => router.push(`/support?ticketId=${ticket.id}&ticketTitle=${encodeURIComponent(ticket.subject)}`)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all text-[10px] font-black uppercase tracking-wider shadow-sm border border-indigo-100 dark:border-indigo-800/50"
                                                            >
                                                                <MessageSquare className="h-3 w-3" />
                                                                Open
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Compact Professional Form */
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
                            {/* Form Column */}
                            <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                                    <Layers className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">Submission Portal</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Formal Support Request</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                    {/* Subject */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <ChevronRight className="h-3 w-3 text-indigo-500" />
                                            Issue Description
                                        </label>
                                        <Input
                                            value={formData.subject}
                                            onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Clearly state the primary concern (e.g. Workstation Hardware Failure)"
                                            required
                                            className="h-14 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold focus:ring-0 focus:border-indigo-500 transition-all rounded-2xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Category Selection */}
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                                <ChevronRight className="h-3 w-3 text-indigo-500" />
                                                Classification
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.values(TicketCategoryEnum).map((cat) => {
                                                    const Icon = CategoryIcons[cat];
                                                    const isSelected = formData.categoryEnum === cat;
                                                    const style = CategoryStyles[cat];
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, categoryEnum: cat })}
                                                            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all group ${isSelected
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]'
                                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                                                                }`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40'}`}>
                                                                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600'}`} />
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase tracking-tighter">{cat}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Priority Selection */}
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                                <ChevronRight className="h-3 w-3 text-indigo-500" />
                                                Impact Level
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.values(TicketPriorityEnum).map((prio) => {
                                                    const isSelected = formData.priorityEnum === prio;
                                                    const config = PriorityConfig[prio];
                                                    return (
                                                        <button
                                                            key={prio}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, priorityEnum: prio })}
                                                            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isSelected
                                                                ? `${config.bg} ${config.border} ${config.text} ring-2 ring-indigo-500/20 scale-[1.02]`
                                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                                                }`}
                                                        >
                                                            <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                                                            <span className="text-[11px] font-black uppercase tracking-tighter">{prio}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footnote */}
                                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-3 text-slate-400 group">
                                            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                                <AlertTriangle className="h-4 w-4 opacity-50" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px]">
                                                Request will be routed to the respective department immediately.
                                            </p>
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="w-full sm:w-auto px-12 h-11 rounded-xl text-[11px] font-black tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 border-0 active:scale-95 transition-all"
                                            isLoading={isLoading}
                                        >
                                            <Send className="h-3.5 w-3.5 mr-2" />
                                            SUBMIT NOW
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {/* Informational Column */}
                            <div className="xl:col-span-4 space-y-6">
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-500/30">
                                    <h4 className="text-base font-black uppercase tracking-[0.2em] mb-4">Portal Metrics</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Mean Response</span>
                                            <span className="text-xl font-black">1.2 hrs</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">Resolution Rate</span>
                                            <span className="text-xl font-black">94.8%</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-indigo-600" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">+14 Active Technicians</span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Guidelines</h4>
                                    <ul className="space-y-4">
                                        {[
                                            'Explicitly state the hardware serial if applicable.',
                                            'Mention any error codes specifically displayed.',
                                            'Screenshot uploads available in the chat view later.'
                                        ].map((text, i) => (
                                            <li key={i} className="flex gap-3 items-start">
                                                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight">{text}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
