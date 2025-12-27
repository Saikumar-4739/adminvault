
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
    Plus, Search, Building2, Key, Calendar,
    CreditCard, AlertTriangle, CheckCircle, Smartphone
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import AddLicenseModal from './AddLicenseModal';

export default function LicensesPage() {
    const { companies } = useCompanies();
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
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header and Stats Omitted for Brevity - Keeping Existing */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                            Software Licenses
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Manage application licenses and subscriptions
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search licenses..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Org Dropdown and Add Button */}
                        <div className="relative min-w-[240px]">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <option value="">All Organizations</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.companyName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={() => setIsModalOpen(true)}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            Add License
                        </Button>
                    </div>
                </div>

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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Key className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No licenses found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredLicenses.map((license) => {
                            const daysLeft = getDaysRemaining(license.expiryDate);
                            const isExpiring = daysLeft !== null && daysLeft <= 30;


                            return (
                                <Card key={license.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white dark:bg-slate-800">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Smartphone className="h-6 w-6" />
                                            </div>
                                            {isExpiring && (
                                                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                                    Expiring
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                                            {license.application?.name || 'Unknown App'}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-2">{license.company?.companyName}</p>

                                        {/* Assigned User Display */}
                                        {license.assignedEmployee ? (
                                            <div className="flex items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                    {license.assignedEmployee.firstName[0]}
                                                </div>
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {license.assignedEmployee.firstName} {license.assignedEmployee.lastName}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mb-4 text-xs text-slate-400 italic">No user assigned</div>
                                        )}


                                        <div className="space-y-4">
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2 text-sm">
                                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                                    <span className="text-xs font-medium">Assigned:</span>
                                                    <span className="font-mono text-slate-900 dark:text-white">
                                                        {license.assignedDate ? new Date(license.assignedDate).toLocaleDateString() : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-medium">Expires:</span>
                                                    </div>
                                                    <span className={`font-mono ${isExpiring ? 'text-rose-600 font-bold' : 'text-slate-900 dark:text-white'}`}>
                                                        {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
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
                        const success = await createLicense(data);
                        return success;
                    }}
                    companies={companies}
                    applications={applications}
                    employees={allEmployees}
                />
            </div>
        </RouteGuard>
    );
}
