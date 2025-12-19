'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Plus, Users, Edit, Trash2, Mail, Phone, Briefcase, LayoutGrid, List, Search, Building2 } from 'lucide-react';
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
    }, []);

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
        return status === 'Active'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
    };

    const getDepartmentColor = (dept?: string) => {
        const colors: Record<string, string> = {
            'IT': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
            'HR': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
            'Finance': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',
            'Admin': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
        };
        return dept ? (colors[dept] || 'bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400 border border-slate-200 dark:border-slate-800') : 'bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
    };

    const filteredEmployees = employees.filter(emp => {
        const searchLower = searchQuery.toLowerCase();
        return (
            emp.firstName?.toLowerCase().includes(searchLower) ||
            emp.lastName?.toLowerCase().includes(searchLower) ||
            emp.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white"> Employees</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Manage your organization's workforce
                        </p>
                    </div>
                </div>

                {/* Controls Bar - Separate Section for Tools */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm sticky top-4 z-10 shadow-sm">

                    {/* Search & Filter */}
                    <div className="flex flex-1 w-full md:w-auto gap-3 items-center">
                        <div className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-shadow shadow-sm"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                        {/* Organization Select - Subtle */}
                        <div className="relative min-w-[180px]">
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                            >
                                <option value="">Select Organization</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.companyName}</option>
                                ))}
                            </select>
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>

                        <Button
                            variant="primary"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={() => setIsModalOpen(true)}
                            disabled={!selectedOrg}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            Add Employee
                        </Button>
                    </div>
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600"></div>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <Card className="border-slate-200 dark:border-slate-700 shadow-sm border-dashed">
                        <div className="py-20 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No employees found</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                {selectedOrg ? 'Try adjusting your search or add a new employee' : 'Please select an organization first'}
                            </p>
                        </div>
                    </Card>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEmployees.map((emp) => (
                            <Card key={emp.id} className="group hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer">
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white dark:ring-slate-800">
                                            {getInitials(emp.firstName, emp.lastName)}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(emp.accountStatus)}`}>
                                            {emp.accountStatus}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {emp.firstName} {emp.lastName}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                            {emp.department ? (
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getDepartmentColor(emp.department)}`}>
                                                    {emp.department}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-500">No Dept</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="truncate">{emp.email}</span>
                                        </div>
                                        {emp.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="truncate">{emp.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleEdit(emp); }}>Edit</Button>
                                        <Button variant="outline" size="sm" className="flex-1 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleDelete(emp); }}>Delete</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Employee</th>
                                        <th className="px-6 py-4 font-bold">Details</th>
                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                        <th className="px-6 py-4 font-bold text-center">Billing</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-white dark:ring-slate-700">
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </div>
                                                    <div>
                                                        <div>{emp.firstName} {emp.lastName}</div>
                                                        <div className="text-xs text-slate-500 font-normal">{emp.department || 'No Dept'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3" /> {emp.email}
                                                    </div>
                                                    {emp.phone && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3" /> {emp.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(emp.accountStatus)}`}>
                                                    {emp.accountStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono text-emerald-600 dark:text-emerald-400">
                                                {emp.billingAmount ? `$${Number(emp.billingAmount).toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-indigo-600 transition-colors"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(emp)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-500 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Modal remains the same */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployee ? 'Edit Employee' : 'Add Employee'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                            <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                        </div>
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            <div><label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Department</label><select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600"><option value="">Select</option><option value="IT">IT</option><option value="HR">HR</option><option value="Finance">Finance</option><option value="Admin">Admin</option></select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Billing Amount" type="number" value={formData.billingAmount} onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })} />
                            <div><label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Status</label><select value={formData.accountStatus} onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-600"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                        </div>
                        <Input label="Remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
                        <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={handleCloseModal}>Cancel</Button><Button variant="primary" type="submit">{editingEmployee ? 'Update' : 'Create'}</Button></div>
                    </form>
                </Modal>

            </div>
        </RouteGuard>
    );
}
