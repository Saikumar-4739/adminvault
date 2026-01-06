'use client';

import { useState, useEffect, useCallback } from 'react';
import { companyService, employeeService, mastersService, licensesService } from '@/lib/api/services';
import { UserRoleEnum, CreateLicenseModel, DeleteLicenseModel } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Plus, Search, Key, CreditCard, AlertTriangle, CheckCircle, Smartphone, Trash2, Calendar } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import AddLicenseModal from './AddLicenseModal';
import { useToast } from '@/contexts/ToastContext';
import { PageLoader } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';

interface License {
    id: number;
    companyId: number;
    applicationId: number;
    expiryDate?: string;
    assignedDate?: string;
    remarks?: string;
    company?: {
        id: number;
        companyName: string;
    };
    application?: {
        id: number;
        name: string;
        logo?: string;
    };
    assignedEmployeeId?: number;
    assignedEmployee?: {
        id: number;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    createdAt: string;
}

interface LicenseStats {
    totalLicenses: number;
    usedLicenses: number;
    totalCost: number;
    expiringSoon: number;
}

interface Company {
    id: number;
    companyName: string;
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
}

interface Application {
    id: number;
    name: string;
}

export default function LicensesPage() {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<LicenseStats>({
        totalLicenses: 0,
        usedLicenses: 0,
        totalCost: 0,
        expiringSoon: 0
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchCompanies = useCallback(async () => {
        try {
            const response: any = await companyService.getAllCompanies();
            if (response.status) {
                // The API returns 'data' for companies
                setCompanies(response.data || []);
                if (response.data?.length > 0 && !selectedCompanyId) {
                    setSelectedCompanyId(response.data[0].id.toString());
                }
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        }
    }, [selectedCompanyId]);

    const fetchLicenses = useCallback(async () => {
        if (!selectedCompanyId) return;
        setIsLoading(true);
        try {
            const response: any = await licensesService.findAll(Number(selectedCompanyId));
            if (response.status) {
                const data = response.data || [];
                setLicenses(data);

                // Calculate stats locally
                const today = new Date();
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(today.getDate() + 30);

                const usedCount = data.filter((l: any) => l.assignedEmployeeId).length;
                const expiringCount = data.filter((l: any) => {
                    if (!l.expiryDate) return false;
                    const exp = new Date(l.expiryDate);
                    return exp > today && exp <= thirtyDaysLater;
                }).length;

                setStats({
                    totalLicenses: data.length,
                    usedLicenses: usedCount,
                    totalCost: 0,
                    expiringSoon: expiringCount
                });
            }
        } catch (error) {
            console.error('Failed to fetch licenses:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompanyId]);

    const fetchEmployees = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const response = await employeeService.getAllEmployees(user.companyId);
            if (response.status) {
                setAllEmployees(response.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    }, [user?.companyId]);

    const fetchApplications = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const response: any = await mastersService.getAllApplications(user.companyId as any);
            if (response.status) {
                setApplications(response.applications || []);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchCompanies();
        fetchEmployees();
        fetchApplications();
    }, [fetchCompanies, fetchEmployees, fetchApplications]);

    useEffect(() => {
        fetchLicenses();
    }, [fetchLicenses]);

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

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingId) {
            setIsLoading(true);
            try {
                // Use correct service method 'remove' and pass DeleteLicenseModel
                const model = new DeleteLicenseModel(deletingId);
                const response: any = await licensesService.remove(model);

                if (response.status) {
                    success('Success', 'License deleted successfully');
                    fetchLicenses();
                } else {
                    toastError('Error', response.message || 'Failed to delete license');
                }
            } catch (err: any) {
                toastError('Error', err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
            }
        }
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 max-w-[1800px] mx-auto min-h-screen">

                {/* Header & Stats */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Software Licenses</h1>
                            <p className="text-sm text-slate-500 font-medium">Manage organization licenses and subscriptions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search licenses..."
                                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                className="pl-4 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Organization</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>{company.companyName}</option>
                                ))}
                            </select>
                            <Button
                                variant="primary"
                                onClick={() => setIsModalOpen(true)}
                                leftIcon={<Plus className="h-4 w-4" />}
                                className="rounded-xl shadow-lg shadow-indigo-500/20"
                            >
                                Add License
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Licenses"
                            value={stats.totalLicenses}
                            icon={Key}
                            iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                            iconColor="text-indigo-600 dark:text-indigo-400"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Used"
                            value={stats.usedLicenses}
                            subText={`${Math.round((stats.usedLicenses / (stats.totalLicenses || 1)) * 100)}% Utilization`}
                            icon={CheckCircle}
                            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                            iconColor="text-emerald-600 dark:text-emerald-400"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Expiring Soon"
                            value={stats.expiringSoon}
                            subText="Next 30 days"
                            icon={AlertTriangle}
                            iconBg="bg-rose-50 dark:bg-rose-900/20"
                            iconColor="text-rose-600 dark:text-rose-400"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            isLoading={isLoading}
                        />
                        <StatCard
                            title="Available"
                            value={stats.totalLicenses - stats.usedLicenses}
                            icon={CreditCard}
                            iconBg="bg-blue-50 dark:bg-blue-900/20"
                            iconColor="text-blue-600 dark:text-blue-400"
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Grid Content */}
                {isLoading ? (
                    <PageLoader />
                ) : filteredLicenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                            <Key className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No licenses found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or add a new license.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredLicenses.map((license) => {
                            const daysLeft = getDaysRemaining(license.expiryDate);
                            const isExpiring = daysLeft !== null && daysLeft <= 30;
                            const isExpired = daysLeft !== null && daysLeft < 0;

                            return (
                                <div
                                    key={license.id}
                                    className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Action - Delete (Hidden by default, shown on hover) */}
                                    <button
                                        onClick={() => handleDeleteClick(license.id)}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                                        title="Delete License"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* App Info */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                            <Smartphone className="h-6 w-6" />
                                        </div>
                                        <div className="pt-0.5">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                                                {license.application?.name || 'Unknown App'}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">{license.company?.companyName}</p>
                                        </div>
                                    </div>

                                    {/* Assignment Card */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700/50">
                                        {license.assignedEmployee ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {license.assignedEmployee.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {license.assignedEmployee.firstName} {license.assignedEmployee.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        Since {license.assignedDate ? formatDate(license.assignedDate) : 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 text-xs italic py-1">
                                                <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800" />
                                                Unassigned License
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {license.expiryDate ? formatDate(license.expiryDate) : 'Lifetime'}
                                        </div>

                                        {isExpired ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                                Expired
                                            </span>
                                        ) : isExpiring ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide animate-pulse">
                                                Expiring
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <AddLicenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={async (data) => {
                        try {
                            // Properly instantiate the CreateLicenseModel
                            const model = new CreateLicenseModel(
                                data.companyId,
                                data.applicationId,
                                data.assignedEmployeeId || undefined,
                                undefined, // licenseKey
                                undefined, // purchaseDate
                                data.assignedDate ? new Date(data.assignedDate) : undefined,
                                data.expiryDate ? new Date(data.expiryDate) : undefined,
                                undefined, // seats
                                data.remarks || undefined
                            );

                            const response: any = await licensesService.create(model);
                            if (response.status) {
                                success('Success', 'License created successfully');
                                fetchLicenses();
                                return true;
                            } else {
                                toastError('Error', response.message || 'Failed to create license');
                                return false;
                            }
                        } catch (err: any) {
                            toastError('Error', err.message || 'An error occurred');
                            return false;
                        }
                    }}
                    companies={companies}
                    applications={applications as any}
                    employees={allEmployees}
                />

                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete License"
                    message="Are you sure you want to delete this license? This action cannot be undone."
                    variant="danger"
                />
            </div>
        </RouteGuard>
    );
}
