'use client';

import { useState, useMemo } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { useEmailInfo } from '@/hooks/useEmailInfo';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, DepartmentEnum, EmailTypeEnum } from '@adminvault/shared-models';
import {
    Mail, Building2, Plus, Trash2, Search,
    Headphones, ShieldCheck, Landmark, Settings,
    TrendingUp, Megaphone, Users2,
    User, Users, Globe
} from 'lucide-react';
import AddEmailModal from './AddEmailModal';

// Category Definitions
type EmailCategory = 'COMPANY' | 'USER' | 'GROUP';

const CategoryConfig: Record<EmailCategory, { label: string, icon: any, color: string, types: EmailTypeEnum[] }> = {
    COMPANY: {
        label: 'Enterprise Routing',
        icon: Globe,
        color: 'indigo',
        types: [EmailTypeEnum.COMPANY, EmailTypeEnum.SUPPORT, EmailTypeEnum.BILLING, EmailTypeEnum.GENERAL]
    },
    USER: {
        label: 'Individual Identities',
        icon: User,
        color: 'emerald',
        types: [EmailTypeEnum.USER, EmailTypeEnum.WORK, EmailTypeEnum.PERSONAL]
    },
    GROUP: {
        label: 'Collaboration Groups',
        icon: Users,
        color: 'amber',
        types: [EmailTypeEnum.GROUP]
    },
};

// Department Visual Configuration
const DeptConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
    [DepartmentEnum.IT]: { icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Tech Stack & Infra' },
    [DepartmentEnum.HR]: { icon: Users2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', label: 'People & Culture' },
    [DepartmentEnum.FINANCE]: { icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Capital & Accounts' },
    [DepartmentEnum.SUPPORT]: { icon: Headphones, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'Client Success' },
    [DepartmentEnum.MARKETING]: { icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Growth & Brand' },
    [DepartmentEnum.SALES]: { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Revenue Ops' },
    [DepartmentEnum.OPERATIONS]: { icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', label: 'Global Logistics' },
};

export default function InfoEmailsPage() {
    const { companies } = useCompanies();
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [activeTab, setActiveTab] = useState<EmailCategory>('COMPANY');
    const { emailInfoList, isLoading, createEmailInfo, deleteEmailInfo } = useEmailInfo(selectedOrg ? Number(selectedOrg) : undefined);

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-select first organization if none selected
    useMemo(() => {
        if (companies.length > 0 && !selectedOrg) {
            setSelectedOrg(companies[0].id.toString());
        }
    }, [companies, selectedOrg]);

    // Filtered and Grouped Data
    const filteredEmails = useMemo(() => {
        const categoryTypes = CategoryConfig[activeTab].types;
        return emailInfoList.filter(acc =>
            categoryTypes.includes(acc.emailType) && (
                acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                acc.department.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [emailInfoList, searchQuery, activeTab]);

    const groupedData = useMemo(() => {
        const groups: Record<string, typeof emailInfoList> = {};
        Object.values(DepartmentEnum).forEach(dept => {
            const emailsInDept = filteredEmails.filter(email => email.department === dept);
            if (emailsInDept.length > 0 || searchQuery === '') {
                groups[dept] = emailsInDept;
            }
        });
        return groups;
    }, [filteredEmails, searchQuery]);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950">
                {/* Clean Header */}
                <PageHeader
                    icon={Mail}
                    title="Communicator Hub"
                    subtitle="Global routing and identity management platform"
                    actions={
                        <>
                            <div className="relative min-w-[240px]">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <select
                                    value={selectedOrg}
                                    onChange={(e) => setSelectedOrg(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 transition-all font-semibold text-sm appearance-none outline-none"
                                >
                                    <option value="">Select Organization</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.companyName}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                disabled={!selectedOrg}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add New
                            </button>
                        </>
                    }
                />

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search repository..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm outline-none"
                    />
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
                    {(Object.keys(CategoryConfig) as EmailCategory[]).map((cat) => {
                        const config = CategoryConfig[cat];
                        const Icon = config.icon;
                        const isActive = activeTab === cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                                    ${isActive
                                        ? `bg-white dark:bg-slate-700 shadow-md text-${config.color}-600 scale-100`
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 scale-95'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {config.label}
                            </button>
                        );
                    })}
                </div>

                {!selectedOrg ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <Mail className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black">Authentication Required</h3>
                        <p className="text-slate-500 mt-2 max-w-sm font-medium">Please select an organization to access the communicator registry.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {Object.entries(groupedData).map(([dept, emails]) => {
                            const config = DeptConfig[dept] || DeptConfig[DepartmentEnum.IT];
                            const Icon = config.icon;

                            if (emails.length === 0 && searchQuery !== '') return null;

                            return (
                                <div key={dept} className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${config.bg} ${config.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm uppercase tracking-wider">{dept}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{config.label}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500">
                                            {emails.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3 min-h-[100px]">
                                        {isLoading ? (
                                            <div className="p-8 flex flex-col items-center justify-center space-y-3">
                                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading...</p>
                                            </div>
                                        ) : emails.length === 0 ? (
                                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">None Configured</p>
                                            </div>
                                        ) : (
                                            emails.map((acc) => (
                                                <Card key={acc.id} className="group p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition-all rounded-3xl shadow-sm">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-1.5 py-0.5 rounded bg-${CategoryConfig[activeTab].color}-50 dark:bg-${CategoryConfig[activeTab].color}-900/20 text-${CategoryConfig[activeTab].color}-600 dark:text-${CategoryConfig[activeTab].color}-400 text-[8px] font-black uppercase tracking-widest`}>
                                                                    {acc.emailType}
                                                                </span>
                                                            </div>
                                                            <p className="font-bold truncate text-sm">{acc.email}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteEmailInfo(acc.id)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <AddEmailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    companyId={Number(selectedOrg)}
                    onSuccess={createEmailInfo}
                    initialTab={activeTab}
                />
            </div>
        </RouteGuard>
    );
}
