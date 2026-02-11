'use client';

import { useState, useEffect, useCallback } from 'react';
import { companyService, employeeService, applicationService, licensesService } from '@/lib/api/services';
import { UserRoleEnum, CreateLicenseModel, DeleteLicenseModel } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, Key, Trash2, Shield, Pencil, Clock } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { AddLicenseModal } from './AddLicenseModal';

import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
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
            <div className="p-4 min-h-screen bg-slate-50 dark:bg-slate-950/50 space-y-4">
                {/* Page Header with Filters */}
                <PageHeader
                    icon={<Key className="h-4 w-4" />}
                    title="Software Assets"
                    description="Software Allocation Registry"
                    gradient="from-indigo-500 to-purple-600"
                >
                    <div className="flex flex-wrap items-center gap-2 w-full justify-end">
                        <div className="relative">
                            <select
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                className="pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-sm min-w-[120px] h-8"
                            >
                                <option value="">Organization</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>{company.companyName}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-2.5 w-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setIsModalOpen(true);
                            }}
                            leftIcon={<Plus className="h-3 w-3" />}
                            className="h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                        >
                            Register
                        </Button>
                    </div>
                </PageHeader>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Loading Asset Records...</p>
                    </div>
                ) : licenses.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white dark:border-slate-800 rotate-6 group hover:rotate-0 transition-transform duration-500">
                            <Key className="h-8 w-8 text-indigo-400 dark:text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Assets Found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">
                            No software allocation records found for this unit. Add your first asset to begin tracking.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-24">
                        {licenses.map((license) => {
                            const daysLeft = getDaysRemaining(license.expiryDate);
                            const isExpiring = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
                            const isExpired = daysLeft !== null && daysLeft < 0;
                            const isLifetime = !license.expiryDate;

                            return (
                                <div
                                    key={license.id}
                                    className="group relative bg-white dark:bg-slate-900/40 rounded-[20px] p-3 border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                                >
                                    <div className="relative z-10 flex flex-col h-full">
                                        {/* Header: Icon and status */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105
                                                ${isExpired ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' :
                                                    isExpiring ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                                        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}`}
                                            >
                                                <Shield className="w-4 h-4" />
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-slate-400' : isExpiring ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                            </div>
                                        </div>

                                        {/* App Title */}
                                        <div className="mb-3">
                                            <h3 className="font-black text-[11px] text-slate-900 dark:text-white tracking-tight uppercase leading-tight truncate">
                                                {license.application?.name || 'Unknown Hub'}
                                            </h3>
                                            <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter truncate">
                                                {license.company?.companyName}
                                            </p>
                                        </div>

                                        {/* Deployment Context - Mini */}
                                        <div className="flex-grow space-y-2 mb-3">
                                            <div className="flex items-center gap-2 px-1.5 py-1.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800/40">
                                                {license.assignedEmployee ? (
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <div className="w-5 h-5 rounded-md bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-black text-[7px]">
                                                            {license.assignedEmployee.firstName[0]}{license.assignedEmployee.lastName[0]}
                                                        </div>
                                                        <p className="font-bold text-[9px] text-slate-700 dark:text-slate-200 truncate leading-none">
                                                            {license.assignedEmployee.firstName}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <div className="w-5 h-5 rounded-md border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                                            <Plus className="w-2.5 h-2.5" />
                                                        </div>
                                                        <span className="text-[8px] font-bold uppercase tracking-tight">VACANT</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expiry Mini */}
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5 text-indigo-500" />
                                                <span className={`text-[9px] font-black ${isExpired ? 'text-rose-500' :
                                                    isExpiring ? 'text-amber-500' :
                                                        'text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {isLifetime ? 'EVER' : isExpired ? 'OFF' : daysLeft + 'D'}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 tracking-widest">
                                                #{license.id.toString().padStart(3, '0')}
                                            </span>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/40 pt-2 gap-1">
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 transition-all"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(license.id)}
                                                className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-all"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
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
                    itemName="Asset Record"
                />
            </div>
        </RouteGuard>
    );
}


export default LicensesPage;