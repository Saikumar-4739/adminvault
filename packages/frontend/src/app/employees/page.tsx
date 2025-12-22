'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import {
    Plus, Users, Edit, Trash2, Mail, Phone, Briefcase,
    LayoutGrid, List, Search, Building2, UserCheck, UserX,
    Calendar
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

export default function EmployeesPage() {
    const { companies } = useCompanies();

    const getDefaultCompanyId = (): string => {
        const storedUser = localStorage.getItem('auth_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        return user?.companyId ? String(user.companyId) : '';
    };

    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees(selectedOrg ? Number(selectedOrg) : undefined);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const companyId = Number(selectedOrg);
        if (!companyId) {
            alert('Please select an organization first');
            return;
        }

        const payload = {
            companyId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phNumber: formData.phone,
            department: formData.department as any,
            empStatus: formData.accountStatus as any,
            billingAmount: Number(formData.billingAmount),
            remarks: formData.remarks
        };

        if (editingEmployee) {
            await updateEmployee({ id: editingEmployee.id, ...payload } as any);
        } else {
            await createEmployee(payload as any);
        }
        handleCloseModal();
    };

    const handleEdit = (employee: any) => {
        setEditingEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone || '',
            department: employee.department || '',
            accountStatus: employee.accountStatus || 'Active',
            billingAmount: employee.billingAmount ? String(employee.billingAmount) : '',
            remarks: employee.remarks || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (employee: any) => {
        if (confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) {
            await deleteEmployee({ id: employee.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({
            firstName: '', lastName: '', email: '', phone: '', department: '',
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

    const getDepartmentBg = (dept?: string) => {
        const colors: Record<string, string> = {
            'IT': 'from-blue-500 to-indigo-600',
            'HR': 'from-pink-500 to-rose-500',
            'Finance': 'from-emerald-500 to-teal-600',
            'Admin': 'from-orange-400 to-amber-500',
            'Sales': 'from-violet-500 to-purple-600',
        };
        return colors[dept || ''] || 'from-slate-500 to-slate-600';
    };

    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchQuery.toLowerCase();
        return (
            emp.firstName?.toLowerCase().includes(searchLower) ||
            emp.lastName?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower)
        );
    });

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.accountStatus === 'Active').length,
        inactive: employees.filter(e => e.accountStatus !== 'Active').length,
        newThisMonth: employees.filter(e => {
            const date = new Date(e.createdDate || '');
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header Row: Title | Search | Org */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                            Employees
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Manage your workforce
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Organization Dropdown */}
                        <div className="relative min-w-[240px]">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <option value="">Select Organization</option>
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
                            disabled={!selectedOrg}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.active}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                                <UserX className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Inactive</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.inactive}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New (Mon)</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.newThisMonth}</div>
                    </div>
                </div>

                {/* View Toggles & Content */}
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Users className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No employees found</h3>
                            <p className="text-slate-500 text-sm mt-1">Select an organization or adjust your filters.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEmployees.map((emp) => (
                                <Card key={emp.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white dark:bg-slate-800">
                                    {/* Top Pattern Header */}
                                    <div className={`h-24 bg-gradient-to-r ${getDepartmentBg(emp.department)} opacity-90 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/10"></div>
                                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                                    </div>

                                    <div className="px-6 pb-6 relative">
                                        {/* Avatar overlaps header */}
                                        <div className="-mt-12 mb-4 flex justify-between items-end">
                                            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                                                <div className={`w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br ${getDepartmentBg(emp.department)}`}>
                                                    {getInitials(emp.firstName, emp.lastName)}
                                                </div>
                                            </div>
                                            <span className={`transform -translate-y-1 mb-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(emp.accountStatus)}`}>
                                                {emp.accountStatus}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {emp.firstName} {emp.lastName}
                                            </h3>
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {emp.department || 'No Dept'}
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-400">
                                                    <Mail className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="truncate">{emp.email}</span>
                                            </div>
                                            {emp.phone && (
                                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                    <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-400">
                                                        <Phone className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="truncate">{emp.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                                <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 hover:text-indigo-600 transition-colors">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-600 hover:text-rose-600 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br ${getDepartmentBg(emp.department)}`}>
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-xs text-slate-500">{emp.department}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {emp.email}</span>
                                                    {emp.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {emp.phone}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(emp.accountStatus)}`}>
                                                    {emp.accountStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(emp)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployee ? 'Edit Employee' : 'Add Employee'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required placeholder="e.g. John" />
                            <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required placeholder="e.g. Doe" />
                        </div>
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="john.doe@company.com" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Sales">Sales</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Billing Amount" type="number" value={formData.billingAmount} onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })} placeholder="0.00" />
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
            </div>
        </RouteGuard>
    );
}
