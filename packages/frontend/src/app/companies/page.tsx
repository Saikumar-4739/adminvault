'use client';

import { useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';

export default function CompaniesPage() {
    const { companies, isLoading, createCompany, updateCompany, deleteCompany } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
    });

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCompany) {
            await updateCompany({ ...formData, id: editingCompany.id });
        } else {
            await createCompany(formData as any);
        }

        handleCloseModal();
    };

    const handleEdit = (company: any) => {
        setEditingCompany(company);
        setFormData({
            name: company.name,
            address: company.address || '',
            phone: company.phone || '',
            email: company.email || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (company: any) => {
        if (confirm(`Are you sure you want to delete ${company.name}?`)) {
            await deleteCompany({ id: company.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
        setFormData({ name: '', address: '', phone: '', email: '' });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Companies</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your organization's companies
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Company
                </Button>
            </div>

            {/* Search */}
            <Card>
                <div className="p-4">
                    <Input
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-5 w-5" />}
                    />
                </div>
            </Card>

            {/* Companies Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Address
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchQuery ? 'No companies found' : 'No companies yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {company.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{company.email || '-'}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{company.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                {company.address || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    leftIcon={<Edit className="h-4 w-4" />}
                                                    onClick={() => handleEdit(company)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                                    onClick={() => handleDelete(company)}
                                                >
                                                    Delete
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
                title={editingCompany ? 'Edit Company' : 'Add New Company'}
                size="md"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                            {editingCompany ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Company Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter company name"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="company@example.com"
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                    />
                    <Input
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter company address"
                    />
                </form>
            </Modal>
        </div>
    );
}
