'use client';

import { useState, useEffect, useCallback } from 'react';
import { companyService, employeeService, applicationService, licensesService } from '@/lib/api/services';
import { UserRoleEnum, CreateLicenseModel, DeleteLicenseModel } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, Search, Key, Trash2, Calendar, Shield, Pencil } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { AddLicenseModal } from './AddLicenseModal';

import { PageLoader } from '@/components/ui/Spinner';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { CompanyIdRequestModel } from '@adminvault/shared-models';

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

const LicensesPage: React.FC = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
            const req = new CompanyIdRequestModel(Number(selectedCompanyId));
            const response: any = await licensesService.getAllLicenses(req);
            if (response.status) {
                const data = response.data || [];
                setLicenses(data);

            } else {
                AlertMessages.getErrorMessage(response.message || 'Failed to fetch licenses');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch licenses');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCompanyId]);

    const fetchEmployees = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await employeeService.getAllEmployees(req as any);
            if (response.status) {
                setAllEmployees(response.data || []);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch employees');
        }
    }, [user?.companyId]);

    const fetchApplications = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const response: any = await applicationService.getAllApplications();
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
                const response: any = await licensesService.deleteLicense(model);

                if (response.status) {
                    AlertMessages.getSuccessMessage('License deleted successfully');
                    fetchLicenses();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to delete license');
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
                setIsDeleteDialogOpen(false);
                setDeletingId(null);
            }
        }
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-4 space-y-4">
                {/* Page Header with Filters */}
                <PageHeader
                    icon={<Key />}
                    title="Software Licenses"
                    description="Subscription Registry"
                    gradient="from-indigo-500 to-purple-600"
                >
                    <div className="flex flex-wrap items-center gap-2 w-full justify-end">
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Locate..."
                                className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm h-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                className="pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-sm min-w-[140px] h-8"
                            >
                                <option value="">Organization</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>{company.companyName}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setIsModalOpen(true);
                            }}
                            leftIcon={<Plus className="h-3.5 w-3.5" />}
                            className="h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest"
                        >
                            Add License
                        </Button>
                    </div>
                </PageHeader>

                {/* Table Content */}
                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-12">
                                <PageLoader />
                            </div>
                        ) : filteredLicenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                                    <Key className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No licenses found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or add a new license.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Asset</th>
                                            <th className="px-6 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Context</th>
                                            <th className="px-6 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                                            <th className="px-6 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                                            <th className="px-6 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-6 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredLicenses.map((license) => {
                                            const daysLeft = getDaysRemaining(license.expiryDate);
                                            const isExpiring = daysLeft !== null && daysLeft <= 30;
                                            const isExpired = daysLeft !== null && daysLeft < 0;

                                            return (
                                                <tr key={license.id} className="group hover:bg-slate-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                                <Shield className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{license.application?.name || 'Unknown App'}</p>
                                                                <p className="text-xs text-slate-500">{license.company?.companyName}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {license.assignedEmployee ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                                    {license.assignedEmployee.firstName[0]}
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                                    {license.assignedEmployee.firstName} {license.assignedEmployee.lastName}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {license.assignedDate ? formatDate(license.assignedDate) : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {license.expiryDate ? formatDate(license.expiryDate) : 'Lifetime'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {isExpired ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                                                                Expired
                                                            </span>
                                                        ) : isExpiring ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide">
                                                                Expiring
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                                                                Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors"
                                                                title="Edit License"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(license.id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                                                                title="Delete License"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <AddLicenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={async (data) => {
                        try {
                            const model = new CreateLicenseModel(
                                data.companyId,
                                data.applicationId,
                                data.assignedEmployeeId || undefined,
                                undefined,
                                undefined,
                                data.assignedDate || undefined,
                                data.expiryDate || undefined,
                                undefined,
                                data.remarks || undefined
                            );

                            const response: any = await licensesService.createLicense(model);
                            if (response.status) {
                                AlertMessages.getSuccessMessage('License created successfully');
                                fetchLicenses();
                                return true;
                            } else {
                                AlertMessages.getErrorMessage(response.message || 'Failed to create license');
                                return false;
                            }
                        } catch (err: any) {
                            AlertMessages.getErrorMessage(err.message || 'An error occurred');
                            return false;
                        }
                    }}
                    companies={companies}
                    applications={applications as any}
                    employees={allEmployees}
                />

                <DeleteConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    itemName="License"
                />
            </div>
        </RouteGuard>
    );
}


export default LicensesPage;