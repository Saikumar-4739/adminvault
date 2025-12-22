'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';
import { Building2, CheckCircle, LogOut } from 'lucide-react';

export default function CreateTicketPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { createTicket, isLoading } = useTickets();
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        categoryEnum: TicketCategoryEnum.OTHER,
        priorityEnum: TicketPriorityEnum.MEDIUM,
        ticketStatus: TicketStatusEnum.OPEN,
        ticketCode: '',
    });

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
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ticket Submitted!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Your support ticket has been created successfully. Our team will review it shortly.
                    </p>
                    <div className="space-y-3">
                        <Button
                            variant="primary"
                            className="w-full justify-center"
                            onClick={() => setIsSuccess(false)}
                        >
                            Submit Another Ticket
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-center"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AdminVault Support</h1>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Ticket</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Describe your issue below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <Input
                            label="Subject"
                            value={formData.subject}
                            onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Brief summary of the issue"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.categoryEnum}
                                    onChange={(e) => setFormData({ ...formData, categoryEnum: e.target.value as TicketCategoryEnum })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
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
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow appearance-none"
                                >
                                    {Object.values(TicketPriorityEnum).map((prio) => (
                                        <option key={prio} value={prio}>{prio}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 justify-center"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Cancel & Logout
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1 justify-center"
                                isLoading={isLoading}
                            >
                                Submit Ticket
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
