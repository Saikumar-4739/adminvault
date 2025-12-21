'use client';

import { useEffect, useState } from 'react';
import { TicketCategory, CreateTicketCategoryModel, UpdateTicketCategoryModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { ticketCategoryService, companyService } from '@/lib/api/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Plus, Edit2, Trash2, Building2, FileText } from 'lucide-react';

export default function TicketCategoriesMasterView({ onBack }: { onBack?: () => void }) {
    const { user } = useAuth();
    const { success: showSuccess, error: showError } = useToast();

    // Data state
    const [data, setData] = useState<TicketCategory[]>([]);
    const [companies, setCompanies] = useState<{ id: number; companyName: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TicketCategory | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        companyId: user?.companyId || 0,
        name: '',
        description: '',
        status: 'Active',
        defaultPriority: 'Low' as 'Low' | 'Medium' | 'High',
        isActive: true
    });

    // Fetch companies for dropdown
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyService.getAllCompanies();
                if (response.status && response.data) {
                    setCompanies(response.data.map((c: any) => ({ id: c.id, companyName: c.companyName })));
                }
            } catch (error) {
                console.error("Failed to fetch companies", error);
            }
        };
        fetchCompanies();
    }, []);

    // Fetch ticket categories
    const fetchData = async () => {
        if (!user?.companyId) return;

        setIsLoading(true);
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const res = await ticketCategoryService.getAllTicketCategories(req);
            if (res.status && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch ticket categories", error);
            showError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.companyId]);

    const handleOpenModal = (item?: TicketCategory) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                companyId: item.companyId,
                name: item.name,
                description: item.description || '',
                status: item.status || 'Active',
                defaultPriority: (item.defaultPriority as 'Low' | 'Medium' | 'High') || 'Low',
                isActive: item.isActive
            });
        } else {
            setEditingItem(null);
            setFormData({
                companyId: user?.companyId || 0,
                name: '',
                description: '',
                status: 'Active',
                defaultPriority: 'Low',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            companyId: user?.companyId || 0,
            name: '',
            description: '',
            status: 'Active',
            defaultPriority: 'Low',
            isActive: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) {
            showError('User not identified');
            return;
        }

        if (!formData.name.trim()) {
            showError('Name is required');
            return;
        }

        setIsLoading(true);
        try {
            if (editingItem) {
                // Update
                const updateModel = new UpdateTicketCategoryModel(
                    editingItem.id,
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.defaultPriority
                );

                const res = await ticketCategoryService.updateTicketCategory(updateModel);
                if (res.status) {
                    showSuccess('Ticket Category Updated');
                    fetchData();
                    handleCloseModal();
                } else {
                    showError(res.message || 'Update failed');
                }
            } else {
                // Create
                const createModel = new CreateTicketCategoryModel(
                    user.id,
                    formData.companyId,
                    formData.name,
                    formData.description,
                    formData.isActive,
                    formData.defaultPriority
                );

                const res = await ticketCategoryService.createTicketCategory(createModel);
                if (res.status) {
                    showSuccess('Ticket Category Created');
                    fetchData();
                    handleCloseModal();
                } else {
                    showError(res.message || 'Creation failed');
                }
            }
        } catch (error: any) {
            showError(error.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item: TicketCategory) => {
        if (!confirm(`Delete "${item.name}"? This action cannot be undone.`)) return;

        try {
            const res = await ticketCategoryService.deleteTicketCategory(new IdRequestModel(item.id));
            if (res.status) {
                showSuccess('Category Deleted');
                fetchData();
            } else {
                showError(res.message || 'Delete failed');
            }
        } catch (error) {
            showError('Operation failed');
        }
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Ticket Categories</h3>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="sm" variant="outline" onClick={onBack}>
                                ← Back to Masters
                            </Button>
                        )}
                        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>
                            Add Category
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-4">
                    {isLoading && data.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-slate-500">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-sm">Loading...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto h-full">
                            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Description</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Priority</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                No ticket categories found
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                                                    {item.description || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.defaultPriority === 'High'
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                                        : item.defaultPriority === 'Medium'
                                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        }`}>
                                                        {item.defaultPriority || 'Low'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleOpenModal(item)} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(item)} className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingItem ? 'Edit Ticket Category' : 'Add Ticket Category'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Company Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> Company
                        </label>
                        <select
                            value={formData.companyId}
                            onChange={(e) => setFormData({ ...formData, companyId: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                        >
                            <option value={0}>Select Company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.companyName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description..."
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Default Priority */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Priority</label>
                            <select
                                value={formData.defaultPriority}
                                onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
