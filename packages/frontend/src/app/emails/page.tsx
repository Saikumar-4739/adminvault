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
    User, Users, Globe, ChevronDown, ChevronRight
} from 'lucide-react';
import { AddEmailModal } from './AddEmailModal';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';


// Category Definitions
type EmailCategory = 'COMPANY' | 'USER' | 'GROUP';

const CategoryConfig: Record<EmailCategory, { label: string, icon: any, color: string, types: EmailTypeEnum[] }> = {
    COMPANY: {
        label: 'Company Emails',
        icon: Globe,
        color: 'indigo',
        types: [EmailTypeEnum.COMPANY, EmailTypeEnum.SUPPORT, EmailTypeEnum.BILLING, EmailTypeEnum.GENERAL]
    },
    USER: {
        label: 'Employee Emails',
        icon: User,
        color: 'emerald',
        types: [EmailTypeEnum.USER, EmailTypeEnum.WORK, EmailTypeEnum.PERSONAL]
    },
    GROUP: {
        label: 'Group Emails',
        icon: Users,
        color: 'amber',
        types: [EmailTypeEnum.GROUP]
    },
};

// Department Visual Configuration
const DeptConfig: Record<string, { icon: any, color: string, bg: string, border: string, label: string }> = {
    [DepartmentEnum.IT]: { icon: Settings, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-100 dark:border-indigo-900/30', label: 'IT & Infrastructure' },
    [DepartmentEnum.HR]: { icon: Users2, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', border: 'border-fuchsia-100 dark:border-fuchsia-900/30', label: 'Human Resources' },
    [DepartmentEnum.FINANCE]: { icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-100 dark:border-emerald-900/30', label: 'Accounts & Finance' },
    [DepartmentEnum.SUPPORT]: { icon: Headphones, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-100 dark:border-rose-900/30', label: 'Customer Support' },
    [DepartmentEnum.MARKETING]: { icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-100 dark:border-amber-900/30', label: 'Marketing & Sales' },
    [DepartmentEnum.SALES]: { icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-100 dark:border-violet-900/30', label: 'Sales & Partnerships' },
    [DepartmentEnum.OPERATIONS]: { icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-100 dark:border-cyan-900/30', label: 'Operations & Logistics' },
    'Unassigned': { icon: Globe, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-950/40', border: 'border-slate-100 dark:border-slate-900/30', label: 'General' },
    'Default': { icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-100 dark:border-indigo-900/30', label: 'Department' },
};

const InfoEmailsPage: React.FC = () => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [emailInfoList, setEmailInfoList] = useState<EmailInfoResponseModel[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [activeTab, setActiveTab] = useState<EmailCategory>('USER');
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
        }
    };

    const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

    const toggleDept = (dept: string) => {
        setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
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

        const allPossibleDepts = [...new Set([...masterDepts, ...emailDepts])];
        if (!allPossibleDepts.includes('Unassigned')) allPossibleDepts.push('Unassigned');

        allPossibleDepts.forEach(dept => {
            const emailsInDept = filteredEmails.filter(email => {
                const emailDept = email.department || 'Unassigned';
                return emailDept === dept;
            });

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
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/40 space-y-8 pb-32">
                {/* Header Section */}
                <PageHeader
                    icon={<Mail className="h-4 w-4" />}
                    title="Email Management"
                    description="Manage company and employee email addresses"
                    gradient="from-indigo-600 via-indigo-700 to-violet-800"
                    actions={[
                        {
                            label: 'Add Email',
                            onClick: () => setIsModalOpen(true),
                            icon: <Plus className="w-3.5 h-3.5" />,
                            variant: 'primary'
                        }
                    ]}
                >
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-end max-w-2xl ml-auto">
                        <div className="relative w-full sm:w-48 group">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full pl-9 pr-8 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-xs appearance-none outline-none shadow-sm cursor-pointer"
                            >
                                <option value="">Select Company...</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Search className="h-3 w-3" />
                            </div>
                        </div>

                        <div className="relative w-full sm:w-72 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-xs outline-none shadow-sm"
                            />
                        </div>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Concepts */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm space-y-1">
                            {(Object.keys(CategoryConfig) as EmailCategory[]).map((cat) => {
                                const config = CategoryConfig[cat];
                                const Icon = config.icon;
                                const isActive = activeTab === cat;

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveTab(cat)}
                                        className={`
                                            w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group
                                            ${isActive
                                                ? `bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1`
                                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20'} transition-colors`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[11px] font-black uppercase tracking-tight">{config.label}</div>
                                                <div className={`text-[9px] font-medium opacity-70 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                    {cat === 'COMPANY' ? 'Company' : cat === 'USER' ? 'Employees' : 'Groups'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Hubs</div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{emailInfoList.length}</div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Active Records</div>
                                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{filteredEmails.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Collapsible Panel List */}
                    <div className="lg:col-span-3 space-y-3">
                        {!selectedOrg ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                                <Mail className="h-8 w-8 text-indigo-400 mb-6 animate-pulse" />
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Select a Company</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs font-medium leading-relaxed uppercase tracking-widest">
                                    Please select a company to view records
                                </p>
                            </div>
                        ) : (
                            Object.entries(groupedData).map(([dept, emails]) => {
                                const config = DeptConfig[dept] || DeptConfig['Default'];
                                const Icon = config.icon;
                                const isExpanded = !!expandedDepts[dept];

                                if (emails.length === 0 && searchQuery !== '') return null;

                                return (
                                    <div key={dept} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                                        <button
                                            onClick={() => toggleDept(dept)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-xl ${config.bg} ${config.color} border ${config.border} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white leading-none mb-1">{dept}</h3>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{config.label}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/10">
                                                    {emails.length} Records
                                                </div>
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t border-slate-50 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
                                                {emails.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400 opacity-50">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No records found for this department</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-50 dark:border-white/5">
                                                                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                                                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                                                                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                                    <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {emails.map((acc, idx) => (
                                                                    <tr key={acc.id} className={`group/row border-b last:border-0 border-slate-50 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-indigo-500/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/[0.01]'}`}>
                                                                        <td className="p-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                                                    {acc.emailType}
                                                                                </span>
                                                                                {acc.emailType === EmailTypeEnum.USER && acc.employeeName && (
                                                                                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight truncate max-w-[100px]">
                                                                                        {acc.employeeName}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors uppercase tracking-tight">
                                                                                {acc.email}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4 text-right">
                                                                            <button
                                                                                onClick={() => handleDeleteEmailInfo(acc.id)}
                                                                                className="h-8 w-8 inline-flex items-center justify-center opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all shadow-sm"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

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
