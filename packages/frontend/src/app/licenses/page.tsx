
'use client';

import { useState, useEffect } from 'react';
import { useLicenses } from '@/hooks/useLicenses';
import { useCompanies } from '@/hooks/useCompanies';
import { useEmployees } from '@/hooks/useEmployees';
import { useMasters } from '@/hooks/useMasters';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import {
    Plus, Search, Building2, Key,
    CreditCard, AlertTriangle, CheckCircle, Smartphone
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import AddLicenseModal from './AddLicenseModal';
import { useToast } from '@/contexts/ToastContext';

import PageHeader from '@/components/ui/PageHeader';

export default function LicensesPage() {
    const { companies } = useCompanies();
    const { success, error: toastError } = useToast();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        licenses, stats, isLoading,
        createLicense
    } = useLicenses(selectedCompanyId ? Number(selectedCompanyId) : undefined);

    // Fetch employees for the dropdown
    const { employees: allEmployees } = useEmployees();

    // Fetch applications from masters
    const { applications, fetchApplications } = useMasters();

    // Set default company on load
    useEffect(() => {
        if (companies.length > 0 && !selectedCompanyId) {
            setSelectedCompanyId(companies[0].id.toString());
        }
    }, [companies, selectedCompanyId]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filteredLicenses = licenses.filter(l => {
        const matchesSearch =
            (l.application?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (l.assignedEmployee?.firstName && (l.assignedEmployee.firstName + ' ' + l.assignedEmployee.lastName).toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesSearch;
    });

    const getDaysRemaining = (date?: string) => {
        if (!date) return null;
        const diff = new Date(date).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-6 max-w-[1800px] mx-auto min-h-screen">
                <PageHeader
                    icon={Key}
                    title="Software Licenses"
                    subtitle="Manage application licenses and subscriptions"
                    actions={
                        <>
                            {/* Search */}
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search licenses..."
                                    className="w-full sm:w-56 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Org Filter */}
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                                <select
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                                    className="w-full sm:w-48 appearance-none pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                >
                                    <option value="">All Organizations</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.companyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Plus className="h-3.5 w-3.5" />}
                                onClick={() => setIsModalOpen(true)}
                                className="shadow-lg shadow-indigo-500/20"
                            >
                                Add License
                            </Button>
                        </>
                    }
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Licenses"
                        value={stats.totalLicenses}
                        icon={Key}
                        gradient="from-indigo-500 to-violet-600"
                        iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Used"
                        value={stats.usedLicenses}
                        subText={`${Math.round((stats.usedLicenses / (stats.totalLicenses || 1)) * 100)}% Utilization`}
                        icon={CheckCircle}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Expiring Soon"
                        value={stats.expiringSoon}
                        subText="Next 30 days"
                        icon={AlertTriangle}
                        gradient="from-rose-500 to-red-600"
                        iconBg="bg-rose-50 dark:bg-rose-900/20"
                        iconColor="text-rose-600 dark:text-rose-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Total Cost"
                        value={`$${stats.totalCost.toLocaleString()}`}
                        icon={CreditCard}
                        gradient="from-blue-500 to-cyan-600"
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                        isLoading={isLoading}
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                ) : filteredLicenses.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Key className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No licenses found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {filteredLicenses.map((license) => {
                            const daysLeft = getDaysRemaining(license.expiryDate);
                            const isExpiring = daysLeft !== null && daysLeft <= 30;

                            return (
                                <Card key={license.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 rounded-xl bg-white dark:bg-slate-800">
                                    <div className="p-3.5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Smartphone className="h-4.5 w-4.5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                                        {license.application?.name || 'Unknown App'}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-500 font-medium">{license.company?.companyName}</p>
                                                </div>
                                            </div>
                                            {isExpiring && (
                                                <span className="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30 uppercase tracking-wide">
                                                    Expiring
                                                </span>
                                            )}
                                        </div>

                                        {/* Assigned User Display */}
                                        <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            {license.assignedEmployee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                                                        {license.assignedEmployee.firstName[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-none">
                                                            {license.assignedEmployee.firstName} {license.assignedEmployee.lastName}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                                                            Assigned: {license.assignedDate ? new Date(license.assignedDate).toLocaleDateString() : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-slate-400 italic flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600" />
                                                    No user assigned
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                Expires
                                            </div>
                                            <div className={`text-[10px] font-mono font-semibold ${isExpiring ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                                {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <AddLicenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={async (data) => {
                        try {
                            const result = await createLicense(data);
                            if (result) {
                                success('Success', 'License created successfully');
                                return true;
                            } else {
                                toastError('Error', 'Failed to create license');
                                return false;
                            }
                        } catch (err: any) {
                            toastError('Error', err.message || 'An error occurred');
                            return false;
                        }
                    }}
                    companies={companies}
                    applications={applications}
                    employees={allEmployees}
                />
            </div>
        </RouteGuard>
    );
};

export default LicensesPage;
