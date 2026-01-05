'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
    Plus, Users, Edit, Trash2, Mail, Phone,
    LayoutGrid, List, Search, Building2, Upload
} from 'lucide-react';
import dynamic from 'next/dynamic';
const EmployeeBulkImportModal = dynamic(() => import('./components/EmployeeBulkImportModal'), { ssr: false });
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { useMasters } from '@/hooks/useMasters';
import { useToast } from '@/contexts/ToastContext';

export default function EmployeesPage() {
    const { companies } = useCompanies();
    const { departments, fetchDepartments } = useMasters();
    const { success, error: toastError } = useToast();

    const getDefaultCompanyId = (): string => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId ? String(user.companyId) : '';
    };

    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee, fetchEmployees } = useEmployees(selectedOrg ? Number(selectedOrg) : undefined);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyId: '',
        departmentId: '',
        accountStatus: 'Active',
        billingAmount: '',
        remarks: ''
    });

    useEffect(() => {
        const defaultCompany = getDefaultCompanyId();
        if (defaultCompany && !selectedOrg) {
            setSelectedOrg(defaultCompany);
        }
    }, [selectedOrg]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const companyId = Number(formData.companyId || selectedOrg);
        if (!companyId) {
            toastError('Validation Error', 'Please select a company');
            return;
        }
        if (!formData.departmentId) {
            toastError('Validation Error', 'Please select a department');
            return;
        }

        const payload = {
            companyId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phNumber: formData.phone,
            departmentId: Number(formData.departmentId),
            empStatus: formData.accountStatus as any,
            billingAmount: Number(formData.billingAmount),
            remarks: formData.remarks
        };

        try {
            if (editingEmployee) {
                const result = await updateEmployee({ id: editingEmployee.id, ...payload } as any);
                if (result.success) {
                    success('Success', result.message);
                    handleCloseModal();
                } else {
                    toastError('Error', result.message);
                }
            } else {
                const result = await createEmployee(payload as any);
                if (result.success) {
                    success('Success', result.message);
                    handleCloseModal();
                } else {
                    toastError('Error', result.message);
                }
            }
        } catch (err: any) {
            toastError('Error', err.message || 'An error occurred');
        }
    };

    const handleEdit = (employee: any) => {
        setEditingEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phNumber || '',
            companyId: String(employee.companyId || ''),
            departmentId: String(employee.departmentId || ''),
            accountStatus: employee.empStatus || 'Active',
            billingAmount: employee.billingAmount ? String(employee.billingAmount) : '',
            remarks: employee.remarks || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (employee: any) => {
        if (confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) {
            try {
                const result = await deleteEmployee({ id: employee.id });
                if (result.success) {
                    success('Success', result.message);
                } else {
                    toastError('Error', result.message);
                }
            } catch (err: any) {
                toastError('Error', err.message || 'Failed to delete employee');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({
            firstName: '', lastName: '', email: '', phone: '', companyId: '', departmentId: '',
            accountStatus: 'Active', billingAmount: '', remarks: ''
        });
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getStatusColor = (status?: string) => {
        const s = status?.toLowerCase();
        if (s === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
        if (s === 'inactive') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
    };

    const getDepartmentName = (emp: any) => {
        if (emp.departmentId && departments.length > 0) {
            const dept = departments.find(d => d.id === Number(emp.departmentId));
            if (dept) return dept.name;
        }
        // Fallback to the string if it looks like a name, or parse if it's "Dept ID: X"
        if (emp.departmentName && !emp.departmentName.startsWith('Dept ID:')) {
            return emp.departmentName;
        }
        return 'Unknown Dept';
    };

    const getDepartmentBg = (emp: any) => {
        const deptName = getDepartmentName(emp);
        if (!deptName || deptName === 'Unknown Dept') return 'from-slate-500 to-slate-600';

        const deptLower = deptName.toLowerCase();
        // Simple keyword matching for colors
        if (deptLower.includes('it') || deptLower.includes('tech') || deptLower.includes('dev')) return 'from-blue-500 to-indigo-600';
        if (deptLower.includes('hr') || deptLower.includes('human')) return 'from-pink-500 to-rose-500';
        if (deptLower.includes('finance') || deptLower.includes('account')) return 'from-emerald-500 to-teal-600';
        if (deptLower.includes('admin')) return 'from-orange-400 to-amber-500';
        if (deptLower.includes('sale')) return 'from-violet-500 to-purple-600';
        if (deptLower.includes('operation')) return 'from-cyan-500 to-blue-600';
        if (deptLower.includes('market')) return 'from-fuchsia-500 to-pink-600';
        if (deptLower.includes('support')) return 'from-amber-500 to-orange-600';

        return 'from-slate-500 to-slate-600';
    };

    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchQuery.toLowerCase();
        const deptName = getDepartmentName(emp).toLowerCase();
        return (
            emp.firstName?.toLowerCase().includes(searchLower) ||
            emp.lastName?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower) ||
            deptName.includes(searchLower)
        );
    });

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.empStatus?.toLowerCase() === 'active').length,
        inactive: employees.filter(e => e.empStatus?.toLowerCase() !== 'active').length,
        newThisMonth: employees.filter(e => {
            const date = new Date(e.createdAt || '');
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
                {/* Header & Controls */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {stats.total} total employees Â· {stats.active} active
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm mr-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Upload className="h-3.5 w-3.5" />}
                                onClick={() => setIsImportModalOpen(true)}
                                disabled={!selectedOrg}
                                className="h-9"
                            >
                                Import
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Plus className="h-3.5 w-3.5" />}
                                onClick={() => setIsModalOpen(true)}
                                disabled={!selectedOrg}
                                className="h-9 shadow-sm shadow-indigo-500/20"
                            >
                                Add Employee
                            </Button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or department..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="relative min-w-[220px]">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full appearance-none pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                            >
                                <option value="">Select Organization</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.companyName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
                                <Users className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No employees found</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
                                Try adjusting your search query or select a different organization.
                            </p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredEmployees.map((emp) => (
                                <div key={emp.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300 relative flex gap-4 items-start">
                                    {/* Action Menu (Always Visible) */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(emp)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Avatar with Status Dot */}
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm bg-gradient-to-br ${getDepartmentBg(emp)}`}>
                                            {getInitials(emp.firstName, emp.lastName)}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-800 rounded-full ${emp.empStatus?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-[15px]">
                                            {emp.firstName} {emp.lastName}
                                        </h3>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                                            {getDepartmentName(emp)}
                                        </div>

                                        <div className="mt-3 space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                                                <Mail className="h-3 w-3 shrink-0 opacity-70" />
                                                <span className="truncate">{emp.email}</span>
                                            </div>
                                            {emp.phNumber && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    <Phone className="h-3 w-3 shrink-0 opacity-70" />
                                                    <span className="truncate">{emp.phNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 pl-6">Name</th>
                                        <th className="px-4 py-3">Details</th>
                                        <th className="px-4 py-3">Department</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right pr-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 group transition-colors">
                                            <td className="px-4 py-3 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br ${getDepartmentBg(emp)}`}>
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-xs text-slate-500">{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {emp.phNumber ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3" /> {emp.phNumber}
                                                    </div>
                                                ) : <span className="text-slate-400">-</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {getDepartmentName(emp) || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(emp.empStatus)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${emp.empStatus?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {emp.empStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right pr-6">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-slate-200"><Edit className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => handleDelete(emp)} className="p-1.5 hover:bg-white dark:hover:bg-rose-900/20 rounded-md text-slate-400 hover:text-rose-600 shadow-sm border border-transparent hover:border-rose-200"><Trash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployee ? 'Edit Employee' : 'Add Employee'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required placeholder="e.g. John" />
                            <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required placeholder="e.g. Doe" />
                        </div>
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="john.doe@company.com" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company</label>
                                <select
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                    required
                                    disabled={!!editingEmployee}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.companyName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments?.filter(d => d.isActive).map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                                <select value={formData.accountStatus} onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <Input label="Remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Any additional notes..." />

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={handleCloseModal} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingEmployee ? 'Update Employee' : 'Create Employee'}</Button>
                        </div>
                    </form>
                </Modal>
                <EmployeeBulkImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    companyId={Number(selectedOrg)}
                    onSuccess={() => fetchEmployees()}
                />
            </div>
        </RouteGuard >
    );
};


