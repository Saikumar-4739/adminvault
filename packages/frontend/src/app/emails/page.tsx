'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { companyService, emailService, departmentService } from '@/lib/api/services';
import { PageHeader } from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, DepartmentEnum, EmailTypeEnum, EmailInfoResponseModel, CreateEmailInfoModel, DeleteEmailInfoModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import {
    Mail, Building2, Plus, Trash2, Search,
    Headphones, ShieldCheck, Landmark, Settings,
    TrendingUp, Megaphone, Users2,
    User, Users, Globe
} from 'lucide-react';
import { AddEmailModal } from './AddEmailModal';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';


// Category Definitions
type EmailCategory = 'COMPANY' | 'USER' | 'GROUP';

const CategoryConfig: Record<EmailCategory, { label: string, icon: any, color: string, types: EmailTypeEnum[] }> = {
    COMPANY: {
        label: 'Global Routing',
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
    'Unassigned': { icon: Globe, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20', label: 'Legacy / Unmapped' },
    'Default': { icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20', label: 'Functional Registry' },
};

const InfoEmailsPage: React.FC = () => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [emailInfoList, setEmailInfoList] = useState<EmailInfoResponseModel[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [activeTab, setActiveTab] = useState<EmailCategory>('USER');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const fetchCompanies = useCallback(async () => {
        try {
            const response = await companyService.getAllCompanies();
            if (response.status && response.data) {
                setCompanies(response.data as any[]);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to fetch companies');
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        if (!selectedOrg) return;
        try {
            // const req = new CompanyIdRequestModel(Number(selectedOrg));
            const response = await departmentService.getAllDepartments();
            if (response.status) {
                setDepartments(response.departments || []);
            }
        } catch (err: any) {
            console.error('Failed to fetch departments:', err);
        }
    }, [selectedOrg]);

    const fetchEmailInfo = useCallback(async () => {
        if (!selectedOrg) return;
        setIsLoading(true);
        try {
            const req = new CompanyIdRequestModel(Number(selectedOrg));
            const response = await emailService.getAllEmailInfo(req);
            if (response.status) {
                setEmailInfoList(response.data || []);
            } else {
                AlertMessages.getErrorMessage(response.message || 'Failed to fetch email info');
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'An error occurred while fetching email info');
        } finally {
            setIsLoading(false);
        }
    }, [selectedOrg]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        if (selectedOrg) {
            fetchEmailInfo();
            fetchDepartments();
        } else {
            setEmailInfoList([]);
            setDepartments([]);
        }
    }, [selectedOrg, fetchEmailInfo, fetchDepartments]);

    // Auto-select first organization if none selected
    useEffect(() => {
        if (companies.length > 0 && !selectedOrg) {
            setSelectedOrg(companies[0].id.toString());
        }
    }, [companies, selectedOrg]);

    const handleCreateEmailInfo = async (data: CreateEmailInfoModel) => {
        setIsLoading(true);
        try {
            const response = await emailService.createEmailInfo(data);
            if (response.status) {
                AlertMessages.getSuccessMessage(response.message || 'Email info record created successfully');
                await fetchEmailInfo();
                return true;
            } else {
                AlertMessages.getErrorMessage(response.message || 'Failed to create email info');
                return false;
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to create email info');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEmailInfo = (id: number) => {
        const item = emailInfoList.find(e => e.id === id);
        if (item) {
            setItemToDelete(item);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsLoading(true);
        try {
            const response = await emailService.deleteEmailInfo({ id: itemToDelete.id } as DeleteEmailInfoModel);
            if (response.status) {
                AlertMessages.getSuccessMessage(response.message || 'Email info record removed');
                await fetchEmailInfo();
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            } else {
                AlertMessages.getErrorMessage(response.message || 'Failed to delete record');
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to delete record');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEmails = useMemo(() => {
        const categoryTypes = CategoryConfig[activeTab].types;
        return emailInfoList.filter(acc =>
            categoryTypes.includes(acc.emailType) && (
                acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (acc.department?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            )
        );
    }, [emailInfoList, searchQuery, activeTab]);

    const groupedData = useMemo(() => {
        const groups: Record<string, typeof emailInfoList> = {};
        const emailDepts = [...new Set(filteredEmails.map(e => e.department || 'Unassigned'))];
        const masterDepts = departments.map(d => d.name);

        // Combine all departments present in either the master list or the actual email data
        const allPossibleDepts = [...new Set([...masterDepts, ...emailDepts])];
        if (!allPossibleDepts.includes('Unassigned')) allPossibleDepts.push('Unassigned');

        allPossibleDepts.forEach(dept => {
            const emailsInDept = filteredEmails.filter(email => {
                const emailDept = email.department || 'Unassigned';
                return emailDept === dept;
            });

            // Only show groups that have emails or show master groups when not searching
            if (emailsInDept.length > 0) {
                groups[dept] = emailsInDept;
            } else if (searchQuery === '' && masterDepts.includes(dept)) {
                groups[dept] = [];
            }
        });

        return groups;
    }, [filteredEmails, departments, searchQuery]);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
                {/* Header */}
                <PageHeader
                    icon={<Mail />}
                    title="Emails"
                    description="Global Routing and Identity Management"
                    gradient="from-indigo-600 to-violet-700"
                    actions={[
                        {
                            label: 'Add New',
                            onClick: () => setIsModalOpen(true),
                            icon: <Plus className="w-4 h-4" />,
                            variant: 'primary'
                        }
                    ]}
                >
                    <div className="flex items-center gap-2 w-full justify-end">
                        <div className="relative w-48">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-500" />
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all font-bold text-[11px] appearance-none outline-none shadow-sm h-8"
                            >
                                <option value="">Target Org...</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search registry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-[11px] outline-none shadow-sm h-8"
                            />
                        </div>
                    </div>
                </PageHeader>

                {/* Tab Switcher & Stats Summary */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        {(Object.keys(CategoryConfig) as EmailCategory[]).map((cat) => {
                            const config = CategoryConfig[cat];
                            const Icon = config.icon;
                            const isActive = activeTab === cat;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`
                                        flex items-center gap-1.5 px-4 py-1.5 rounded-md font-bold text-[11px] transition-all duration-300
                                        ${isActive
                                            ? `bg-white dark:bg-slate-800 shadow-md text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-700`
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }
                                    `}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : ''}`} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-800">
                            <span className="text-sm text-slate-900 dark:text-white">{emailInfoList.length}</span>
                            Total
                        </div>
                        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-800">
                            <span className="text-sm text-indigo-600 dark:text-indigo-400">
                                {emailInfoList.filter(e => e.emailType === EmailTypeEnum.SUPPORT).length}
                            </span>
                            Support
                        </div>
                        <div className="flex items-center gap-2 px-3">
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">
                                {emailInfoList.filter(e => e.emailType === EmailTypeEnum.USER).length}
                            </span>
                            Users
                        </div>
                    </div>
                </div>

                {!selectedOrg ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl flex items-center justify-center mb-5 shadow-lg border border-white dark:border-slate-800 animate-pulse">
                            <Mail className="h-8 w-8 text-indigo-300 dark:text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Authentication Required</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium">Select an organization to access the secure identity routing registry.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {Object.entries(groupedData).map(([dept, emails]) => {
                            const config = DeptConfig[dept] || DeptConfig['Default'];
                            const Icon = config.icon;

                            if (emails.length === 0 && searchQuery !== '') return null;

                            return (
                                <div key={dept} className="flex flex-col h-full bg-white dark:bg-slate-900/40 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-500 group/dept">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shadow-md transition-transform group-hover/dept:rotate-6`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-[12px] uppercase tracking-wider text-slate-900 dark:text-white">{dept}</h3>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{config.label}</p>
                                            </div>
                                        </div>
                                        <div className="px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                                            {emails.length}
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        {isLoading ? (
                                            <div className="h-32 flex flex-col items-center justify-center space-y-3">
                                                <div className="w-6 h-6 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
                                            </div>
                                        ) : emails.length === 0 ? (
                                            <div className="h-32 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-colors group-hover/dept:border-slate-200 dark:group-hover/dept:border-slate-700">
                                                <Plus className="w-5 h-5 text-slate-200 dark:text-slate-800 mb-1" />
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">None Configured</p>
                                            </div>
                                        ) : (
                                            emails.map((acc) => (
                                                <div key={acc.id} className="group/card p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 rounded-xl shadow-none hover:shadow-md relative overflow-hidden">
                                                    <div className="flex items-center justify-between gap-3 relative z-10">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <span className={`px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-wider`}>
                                                                    {acc.emailType}
                                                                </span>
                                                            </div>
                                                            <p className="font-bold truncate text-[13px] text-slate-800 dark:text-slate-200">{acc.email}</p>
                                                            {acc.emailType === EmailTypeEnum.USER && acc.employeeName && (
                                                                <div className="mt-2 flex items-center gap-1.5 py-1 px-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 w-fit">
                                                                    <User className="w-3 h-3 text-indigo-500" />
                                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                                                        {acc.employeeName}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteEmailInfo(acc.id)}
                                                            className="p-2 opacity-0 group-hover/card:opacity-100 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all translate-x-3 group-hover/card:translate-x-0"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
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
                    onSuccess={handleCreateEmailInfo}
                    initialTab={activeTab}
                />
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setItemToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Email"
                    itemName={itemToDelete ? itemToDelete.email : undefined}
                />
            </div>
        </RouteGuard>
    );
}


export default InfoEmailsPage;