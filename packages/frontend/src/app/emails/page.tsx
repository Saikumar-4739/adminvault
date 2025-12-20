'use client';

import { useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { Mail, Building2, Users, Plus } from 'lucide-react';

// --- Mock Data ---
const MOCK_USER_EMAILS = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    createdOn: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    status: Math.random() > 0.2 ? 'Active' : 'Inactive'
}));

const MOCK_COMPANY_EMAILS = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: `Company Email ${i + 1}`,
    email: `info${i + 1}@company.com`,
    purpose: i % 2 === 0 ? 'Support' : 'Sales',
    createdOn: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    status: Math.random() > 0.1 ? 'Active' : 'Suspended',
    billingAmount: Math.floor(Math.random() * 500),
    remarks: 'Standard plan'
}));

const MOCK_GROUP_EMAILS = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Group ${i + 1}`,
    email: `group${i + 1}@org.com`,
    members: Math.floor(Math.random() * 20) + 5,
    status: 'Active',
    department: ['IT', 'HR', 'Finance', 'Admin'][Math.floor(Math.random() * 4)]
}));

type EmailType = 'user' | 'company' | 'group';

export default function EmailsConfigurationPage() {
    const { companies } = useCompanies();

    // State
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [emailType, setEmailType] = useState<EmailType>('user');
    const [selectedDept, setSelectedDept] = useState<string>('');

    // Derived Data
    const getFilteredData = () => {
        if (!selectedOrg) return [];

        // In a real app, we would fetch based on Org ID
        // Here we just return mock data, and filter group emails by Dept if selected

        switch (emailType) {
            case 'user':
                return MOCK_USER_EMAILS;
            case 'company':
                return MOCK_COMPANY_EMAILS;
            case 'group':
                if (selectedDept) {
                    return MOCK_GROUP_EMAILS.filter(e => e.department === selectedDept);
                }
                return MOCK_GROUP_EMAILS;
            default:
                return [];
        }
    };

    const tableData = getFilteredData();

    // Helper for Status Color
    const getStatusColor = (status: string) => {
        return status === 'Active'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="h-screen flex flex-col overflow-hidden">
                {/* Fixed Header */}
                <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Info Emails Section</h1>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Configure and manage email accounts for your organization
                        </p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="space-y-6">

                        {/* Filter Toolbar */}
                        <Card className="p-4 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">

                                {/* 1. Organization Select */}
                                <div className="flex-1 w-full md:w-auto">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                        Organization
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedOrg}
                                            onChange={(e) => setSelectedOrg(e.target.value)}
                                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                                        >
                                            <option value="">Select Organization</option>
                                            {companies.map(c => (
                                                <option key={c.id} value={c.id}>{c.companyName}</option>
                                            ))}
                                        </select>
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* 2. Email Type Select */}
                                <div className="flex-1 w-full md:w-auto">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                        Email Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={emailType}
                                            onChange={(e) => setEmailType(e.target.value as EmailType)}
                                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                                        >
                                            <option value="user">User Emails</option>
                                            <option value="company">Company Emails</option>
                                            <option value="group">Group Emails</option>
                                        </select>
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* 3. Department Select (Conditional) */}
                                {emailType === 'group' && (
                                    <div className="flex-1 w-full md:w-auto animate-in fade-in slide-in-from-left-4 duration-300">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedDept}
                                                onChange={(e) => setSelectedDept(e.target.value)}
                                                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                                            >
                                                <option value="">All Departments</option>
                                                <option value="IT">IT</option>
                                                <option value="HR">HR</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className="w-full md:w-auto pb-0.5">
                                    <Button
                                        variant="primary"
                                        className="w-full md:w-auto h-[42px]"
                                        leftIcon={<Plus className="h-4 w-4" />}
                                        disabled={!selectedOrg}
                                    >
                                        Create {emailType === 'group' ? 'Group' : 'Email'}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Data Table Area */}
                        {!selectedOrg ? (
                            <Card className="border-slate-200 dark:border-slate-700 border-dashed p-12 flex flex-col items-center justify-center text-center bg-transparent shadow-none">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Building2 className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select an Organization</h3>
                                <p className="text-slate-500 mt-1 max-w-sm">Please select an organization from the dropdown above to view and configure emails.</p>
                            </Card>
                        ) : (
                            <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-6 py-4 font-bold w-16">S.No</th>

                                                {/* Dynamic Headers based on Type */}
                                                {emailType === 'group' && (
                                                    <>
                                                        <th className="px-6 py-4 font-bold">Group Name</th>
                                                        <th className="px-6 py-4 font-bold">Email Address</th>
                                                        <th className="px-6 py-4 font-bold text-center">Members</th>
                                                        <th className="px-6 py-4 font-bold text-center">Department</th>
                                                    </>
                                                )}

                                                {emailType === 'company' && (
                                                    <>
                                                        <th className="px-6 py-4 font-bold">Name</th>
                                                        <th className="px-6 py-4 font-bold">Email</th>
                                                        <th className="px-6 py-4 font-bold">Purpose</th>
                                                        <th className="px-6 py-4 font-bold">Created On</th>
                                                        <th className="px-6 py-4 font-bold text-right">Billing</th>
                                                        <th className="px-6 py-4 font-bold">Remarks</th>
                                                    </>
                                                )}

                                                {emailType === 'user' && (
                                                    <>
                                                        <th className="px-6 py-4 font-bold">Name</th>
                                                        <th className="px-6 py-4 font-bold">Email</th>
                                                        <th className="px-6 py-4 font-bold">Created On</th>
                                                    </>
                                                )}

                                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                            {tableData.map((row: any, index) => (
                                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>

                                                    {/* Group Columns */}
                                                    {emailType === 'group' && (
                                                        <>
                                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{row.email}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs">
                                                                    <Users className="h-3 w-3" /> {row.members}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-slate-500">{row.department}</td>
                                                        </>
                                                    )}

                                                    {/* Company Columns */}
                                                    {emailType === 'company' && (
                                                        <>
                                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{row.email}</td>
                                                            <td className="px-6 py-4 text-slate-500">{row.purpose}</td>
                                                            <td className="px-6 py-4 text-slate-500">{formatDate(row.createdOn)}</td>
                                                            <td className="px-6 py-4 text-right font-mono text-emerald-600 font-medium">${row.billingAmount}</td>
                                                            <td className="px-6 py-4 text-slate-400 text-xs">{row.remarks}</td>
                                                        </>
                                                    )}

                                                    {/* User Columns */}
                                                    {emailType === 'user' && (
                                                        <>
                                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{row.email}</td>
                                                            <td className="px-6 py-4 text-slate-500">{formatDate(row.createdOn)}</td>
                                                        </>
                                                    )}

                                                    {/* Common Status Column */}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {tableData.length === 0 && (
                                        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                                            No records found for this selection.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
