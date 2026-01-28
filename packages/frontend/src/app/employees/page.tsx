'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { employeeService, companyService, departmentService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Plus, Users, Edit, Trash2, Mail, Phone, LayoutGrid, List, Search, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, CompanyIdRequestModel, CreateEmployeeModel, UpdateEmployeeModel, EmployeeStatusEnum } from '@adminvault/shared-models';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phNumber?: string;
    companyId: number;
    departmentId: number;
    departmentName?: string;
    empStatus: string;
    billingAmount?: number;
    remarks?: string;
    managerId?: number | null;
    managerName?: string;
    createdAt?: string;
}

interface Company {
    id: number;
    companyName: string;
}

interface Department {
    id: number;
    name: string;
    isActive: boolean;
}

const EmployeesPage: React.FC = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const EmployeeBulkImportModal = dynamic(() => import('./bulk-import').then(mod => mod.EmployeeBulkImportModal), { ssr: false });
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', companyId: '', departmentId: '', accountStatus: EmployeeStatusEnum.ACTIVE as string, billingAmount: '', remarks: '', managerId: '' });


    const fetchEmployees = useCallback(async () => {
        if (!selectedOrg) return;
        try {
            const req = new CompanyIdRequestModel(Number(selectedOrg));
            const response = await employeeService.getAllEmployees(req);
            if (response.status) {
                const data = response.data || [];
                const mappedEmployees: Employee[] = data.map((item: any) => ({
                    id: item.id,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    email: item.email,
                    phNumber: item.phNumber,
                    companyId: item.companyId,
                    departmentId: item.departmentId,
                    departmentName: item.departmentName,
                    empStatus: item.empStatus,
                    billingAmount: item.billingAmount,
                    remarks: item.remarks,
                    managerId: item.managerId,
                    managerName: item.managerName,
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                setEmployees(mappedEmployees);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    }, [selectedOrg]);

    const fetchCompanies = useCallback(async () => {
        try {
            const response = await companyService.getAllCompanies();
            if (response.status && response.data) {
                setCompanies(response.data as Company[]);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const response = await departmentService.getAllDepartments();
            if (response.status) {
                setDepartments(response.departments || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    }, []);

    useEffect(() => {
        if (user?.companyId && !selectedOrg) {
            setSelectedOrg(String(user.companyId));
        }
    }, [user?.companyId, selectedOrg]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchCompanies();
        fetchDepartments();
    }, [fetchCompanies, fetchDepartments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const companyId = Number(formData.companyId || selectedOrg);
        if (!companyId) {
            AlertMessages.getErrorMessage('Please select a company');
            return;
        }
        if (!formData.departmentId) {
            AlertMessages.getErrorMessage('Please select a department');
            return;
        }

        const managerIdValue = formData.managerId ? Number(formData.managerId) : null;

        try {
            if (editingEmployee) {
                const model = new UpdateEmployeeModel(
                    editingEmployee.id,
                    user?.id || 0,
                    companyId,
                    formData.firstName,
                    formData.lastName,
                    formData.email,
                    Number(formData.departmentId),
                    formData.accountStatus as EmployeeStatusEnum,
                    formData.phone,
                    Number(formData.billingAmount),
                    formData.remarks,
                    undefined, undefined, undefined, undefined,
                    managerIdValue
                );
                const response = await employeeService.updateEmployee(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    fetchEmployees();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreateEmployeeModel(
                    user?.id || 0,
                    companyId,
                    formData.firstName,
                    formData.lastName,
                    formData.email,
                    Number(formData.departmentId),
                    formData.accountStatus as EmployeeStatusEnum,
                    formData.phone,
                    Number(formData.billingAmount),
                    formData.remarks,
                    undefined, undefined, undefined, undefined,
                    managerIdValue
                );
                const response = await employeeService.createEmployee(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    fetchEmployees();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
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
            accountStatus: employee.empStatus || EmployeeStatusEnum.ACTIVE,
            billingAmount: (employee.billingAmount !== undefined && employee.billingAmount !== null) ? String(employee.billingAmount) : '',
            remarks: employee.remarks || '',
            managerId: employee.managerId ? String(employee.managerId) : ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (employee: any) => {
        setEditingEmployee(employee);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!editingEmployee) return;
        try {
            const response = await employeeService.deleteEmployee({ id: editingEmployee.id });
            if (response.status) {
                AlertMessages.getSuccessMessage(response.message);
                fetchEmployees();
                setIsDeleteModalOpen(false);
                setEditingEmployee(null);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({
            firstName: '', lastName: '', email: '', phone: '', companyId: '', departmentId: '',
            accountStatus: EmployeeStatusEnum.ACTIVE, billingAmount: '', remarks: '', managerId: ''
        });
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getDepartmentName = (emp: any) => {
        if (emp.departmentId && departments.length > 0) {
            const dept = departments.find(d => d.id === Number(emp.departmentId));
            if (dept) return dept.name;
        }
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
        const matchesSearch = (
            emp.firstName?.toLowerCase().includes(searchLower) ||
            emp.lastName?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower) ||
            deptName.includes(searchLower) ||
            emp.managerName?.toLowerCase().includes(searchLower)
        );

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && emp.empStatus?.toLowerCase() === 'active') ||
            (statusFilter === 'inactive' && emp.empStatus?.toLowerCase() !== 'active');

        return matchesSearch && matchesStatus;
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]} >
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
                {/* Standardized Header */}
                <div className="p-4 space-y-4">
                    <PageHeader
                        title="Employee Directory"
                        description="Manage organization members and roles"
                        icon={<Users />}
                        gradient="from-indigo-600 to-indigo-700"
                        actions={[
                            {
                                label: 'Import',
                                onClick: () => setIsImportModalOpen(true),
                                icon: <Upload className="h-4 w-4" />,
                                variant: 'outline'
                            },
                            {
                                label: 'Add Employee',
                                onClick: () => setIsModalOpen(true),
                                icon: <Plus className="h-4 w-4" />,
                                variant: 'primary'
                            }
                        ]}
                    >
                        <div className="flex justify-end w-full">
                            <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600">
                                <span className="text-xs font-semibold text-slate-500 mr-2">Total:</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{stats.total}</span>
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="text-xs font-semibold text-emerald-600 mr-2">Active:</span>
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{stats.active}</span>
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="text-xs font-semibold text-rose-600 mr-2">Inactive:</span>
                                <span className="text-sm font-bold text-rose-700 dark:text-rose-400">{stats.inactive}</span>
                            </div>
                        </div>
                    </PageHeader>
                </div>

                {/* Toolbar */}
                <div className="max-w-[1920px] mx-auto px-4 py-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px]"
                            >
                                <option value="">Select Organization</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>{company.companyName}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">Status: All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {filteredEmployees.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700"
                            >
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
                                    <Users className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No employees found</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Adjust search or filters to see results.
                                </p>
                            </motion.div>
                        ) : viewMode === 'grid' ? (
                            <motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            >
                                {filteredEmployees.map((emp) => (
                                    <motion.div
                                        key={emp.id}
                                        className="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="p-4 flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm bg-gradient-to-br ${getDepartmentBg(emp)}`}>
                                                {getInitials(emp.firstName, emp.lastName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate pr-2">
                                                        {emp.firstName} {emp.lastName}
                                                    </h3>
                                                    <span className={`inline-block w-2 h-2 rounded-full ${emp.empStatus?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                                                    {getDepartmentName(emp)}
                                                </div>
                                                <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <Mail className="h-3 w-3 opacity-70" /> {emp.email}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <Phone className="h-3 w-3 opacity-70" /> {emp.phNumber || '-'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 truncate text-indigo-600 dark:text-indigo-400 font-medium">
                                                        <Users className="h-3 w-3 opacity-70" /> Mgr: {emp.managerName || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-lg">
                                            <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(emp)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
                            >
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[280px]">Employee</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">Contact</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[150px]">Manager</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">Status</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Billing</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredEmployees.map((emp) => (
                                            <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br ${getDepartmentBg(emp)}`}>
                                                            {getInitials(emp.firstName, emp.lastName)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-white text-sm">{emp.firstName} {emp.lastName}</div>
                                                            <div className="text-xs text-slate-500">ID: {emp.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex flex-col text-xs space-y-0.5">
                                                        <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                            <Mail className="h-3 w-3 text-slate-400" />
                                                            {emp.email}
                                                        </div>
                                                        <div className="text-slate-500 flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            {emp.phNumber || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                        {getDepartmentName(emp)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{emp.managerName || '-'}</div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${emp.empStatus?.toLowerCase() === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${emp.empStatus?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {emp.empStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-medium text-slate-700 dark:text-slate-300">
                                                    ₹{Number(emp.billingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded text-slate-400 hover:text-indigo-600 transition-colors">
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(emp)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded text-slate-400 hover:text-rose-600 transition-colors">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modals */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                            <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                        </div>
                        <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

                        <div className="grid grid-cols-2 gap-5">
                            <Select
                                label="Organization"
                                value={formData.companyId}
                                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                options={[
                                    { value: '', label: 'Select Organization' },
                                    ...companies.map(c => ({ value: c.id, label: c.companyName }))
                                ]}
                                required
                                disabled={!!editingEmployee}
                            />
                            <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <Select
                                label="Department"
                                value={formData.departmentId}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                options={[
                                    { value: '', label: 'Select Department' },
                                    ...(departments?.filter(d => d.isActive).map(d => ({ value: d.id, label: d.name })) || [])
                                ]}
                                required
                            />

                            <Select
                                label="Reporting Manager"
                                value={formData.managerId}
                                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                options={[
                                    { value: '', label: 'No Manager' },
                                    ...filteredEmployees
                                        .filter(emp => !editingEmployee || emp.id !== editingEmployee.id)
                                        .map(emp => ({ value: emp.id, label: `${emp.firstName} ${emp.lastName}` }))
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <Select
                                label="Account Status"
                                value={formData.accountStatus}
                                onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                                options={[
                                    { value: EmployeeStatusEnum.ACTIVE, label: 'Active' },
                                    { value: EmployeeStatusEnum.INACTIVE, label: 'Inactive' }
                                ]}
                            />
                            <Input
                                label="Billing Amount"
                                type="number"
                                step="0.01"
                                value={formData.billingAmount}
                                onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Remarks</label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Any additional notes or comments..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={handleCloseModal} type="button" className="rounded-xl">Cancel</Button>
                            <Button variant="primary" type="submit" className="rounded-xl px-6">{editingEmployee ? 'Save Changes' : 'Create Member'}</Button>
                        </div>
                    </form>
                </Modal>
                <EmployeeBulkImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    companyId={Number(selectedOrg)}

                    onSuccess={() => fetchEmployees()}
                />
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setEditingEmployee(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Employee"
                    itemName={editingEmployee ? `${editingEmployee.firstName} ${editingEmployee.lastName}` : undefined}
                />
            </div>
        </RouteGuard >
    );
};




export default EmployeesPage;