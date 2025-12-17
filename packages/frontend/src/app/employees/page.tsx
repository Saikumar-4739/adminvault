'use client';

import { useState } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Plus, Building2, Users, Edit, Trash2 } from 'lucide-react';

export default function EmployeesPage() {
    const { companies } = useCompanies();
    // Default to first company if available, or empty
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees(selectedOrg ? Number(selectedOrg) : undefined);

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
            department: formData.department as any, // Cast for now
            empStatus: formData.accountStatus as any, // Cast for now
            billingAmount: Number(formData.billingAmount),
            remarks: formData.remarks
        };

        if (editingEmployee) {
            await updateEmployee({
                id: editingEmployee.id,
                ...payload
            } as any);
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
        if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
            await deleteEmployee({ id: employee.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            department: '',
            accountStatus: 'Active',
            billingAmount: '',
            remarks: ''
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Employees</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Manage your organization's workforce
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Organization Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedOrg}
                            onChange={(e) => setSelectedOrg(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium h-9"
                        >
                            <option value="">Select Organization</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.companyName}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <Building2 className="h-4 w-4" />
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="sm"
                        className="shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
                        leftIcon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsModalOpen(true)}
                        disabled={!selectedOrg} // Disable if no org selected
                    >
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Employees Table */}
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">First Name</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Last Name</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Email Id</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Created Date</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Account Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Billing Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Department</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center border border-slate-200 dark:border-slate-700">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Users className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No employees found for this organization</p>
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp, index) => (
                                    <tr key={emp.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{emp.firstName}</td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white">{emp.lastName}</td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{emp.email}</td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                                            {emp.createdDate ? new Date(emp.createdDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                                    <input type="checkbox" checked={emp.accountStatus === 'Active'} readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-indigo-500 transition-transform duration-200 ease-in-out translate-x-5" />
                                                    <label className="toggle-label block overflow-hidden h-5 rounded-full bg-indigo-500 cursor-pointer"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white">
                                            {emp.billingAmount ? `$${Number(emp.billingAmount).toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium">
                                                {emp.department || 'None'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleEdit(emp)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleDelete(emp)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                            {editingEmployee ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Input
                            label="Phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Department
                        </label>
                        <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Select Department</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Input
                            label="Billing Amount"
                            type="number"
                            value={formData.billingAmount}
                            onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Account Status
                        </label>
                        <select
                            value={formData.accountStatus}
                            onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <Input
                            label="Remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
