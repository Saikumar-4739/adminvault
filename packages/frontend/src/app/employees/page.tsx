'use client';

import { useState } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Building2 } from 'lucide-react';

export default function EmployeesPage() {
    const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
    const { companies } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyId: '',
        department: '',
        position: '',
    });

    const filteredEmployees = employees.filter((employee) =>
        employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            companyId: parseInt(formData.companyId),
        };

        if (editingEmployee) {
            await updateEmployee({ ...data, id: editingEmployee.id } as any);
        } else {
            await createEmployee(data as any);
        }

        handleCloseModal();
    };

    const handleEdit = (employee: any) => {
        setEditingEmployee(employee);
        setFormData({
            fullName: employee.fullName,
            email: employee.email,
            phone: employee.phone || '',
            companyId: employee.companyId.toString(),
            department: employee.department || '',
            position: employee.position || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (employee: any) => {
        if (confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
            await deleteEmployee({ id: employee.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
        setFormData({ fullName: '', email: '', phone: '', companyId: '', department: '', position: '' });
    };

    const getCompanyName = (companyId: number) => {
        const company = companies.find(c => c.id === companyId);
        return company?.name || 'Unknown';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your organization's employees
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Employee
                </Button>
            </div>

            {/* Search */}
            <Card>
                <div className="p-4">
                    <Input
                        placeholder="Search employees by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-5 w-5" />}
                    />
                </div>
            </Card>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : filteredEmployees.length === 0 ? (
                    <div className="col-span-full">
                        <Card className="p-12">
                            <div className="text-center">
                                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchQuery ? 'No employees found' : 'No employees yet'}
                                </p>
                            </div>
                        </Card>
                    </div>
                ) : (
                    filteredEmployees.map((employee) => (
                        <Card key={employee.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-lg">
                                        {employee.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {employee.fullName}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {employee.position || 'Employee'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{employee.email}</span>
                                </div>
                                {employee.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="h-4 w-4" />
                                        <span>{employee.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Building2 className="h-4 w-4" />
                                    <span>{getCompanyName(employee.companyId)}</span>
                                </div>
                            </div>

                            {employee.department && (
                                <div className="mb-4">
                                    <Badge variant="secondary">{employee.department}</Badge>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Edit className="h-4 w-4" />}
                                    onClick={() => handleEdit(employee)}
                                    className="flex-1"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                    onClick={() => handleDelete(employee)}
                                    className="flex-1"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                size="md"
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="john@example.com"
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Company <span className="text-error-500">*</span>
                        </label>
                        <select
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Select a company</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Engineering"
                    />
                    <Input
                        label="Position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="Software Engineer"
                    />
                </form>
            </Modal>
        </div>
    );
}
