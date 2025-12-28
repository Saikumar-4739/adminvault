'use client';

import { useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Modal } from '@/components/ui/modal';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';

export default function CompaniesPage() {
    const { companies, isLoading, createCompany, updateCompany, deleteCompany } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ companyName: '', location: '', estDate: '', phone: '', email: '', });
    const filteredCompanies = companies.filter((company) => (company.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCompany) {
            await updateCompany({
                id: editingCompany.id,
                ...formData,
                estDate: new Date(formData.estDate).toISOString()
            } as any);
        } else {
            await createCompany({
                ...formData,
                estDate: new Date(formData.estDate).toISOString()
            } as any);
        }

        handleCloseModal();
    };

    const handleEdit = (company: any) => {
        setEditingCompany(company);
        setFormData({
            companyName: company.companyName,
            location: company.location || '',
            estDate: company.estDate ? new Date(company.estDate).toISOString().split('T')[0] : '',
            phone: company.phone || '',
            email: company.email || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (company: any) => {
        if (confirm(`Are you sure you want to delete ${company.companyName}?`)) {
            await deleteCompany({ id: company.id });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
        setFormData({ companyName: '', location: '', estDate: '', phone: '', email: '' });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <PageHeader
                icon={Building2}
                title="Companies"
                subtitle="Manage your organization's companies"
                actions={
                    <>
                        <div className="w-56">
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 text-xs border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white dark:bg-slate-800 shadow-sm"
                                leftIcon={<Search className="h-3.5 w-3.5 text-slate-400" />}
                            />
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            className="shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add Company
                        </Button>
                    </>
                }
            />

            {/* Companies Table */}
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                    Company Name
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                    Location
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                    Est. Date
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                    Contact
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center border border-slate-200 dark:border-slate-700">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Building2 className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                                            {searchQuery ? 'No companies found' : 'No companies yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-center border border-slate-200 dark:border-slate-700">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors">
                                                {company.companyName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700">
                                            <div className="text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate mx-auto">
                                                {company.location || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center border border-slate-200 dark:border-slate-700">
                                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                                {company.estDate ? new Date(company.estDate).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center border border-slate-200 dark:border-slate-700">
                                            <div className="text-sm text-slate-900 dark:text-white font-medium">{company.email || '-'}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{company.phone || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleEdit(company)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => handleDelete(company)}
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
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                    <Input
                        label="Establishment Date"
                        type="date"
                        value={formData.estDate}
                        onChange={(e) => setFormData({ ...formData, estDate: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </form>
            </Modal>
        </div>
    );
}
