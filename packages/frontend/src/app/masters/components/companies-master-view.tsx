'use client';

import { useState, useEffect, useRef } from 'react';
import { CreateCompanyModel, UpdateCompanyModel, DeleteCompanyModel, CompanyResponseModel } from '@adminvault/shared-models';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Plus, Pencil, Trash2, ArrowLeft, LayoutGrid, List, Eye, Building2, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyService, formatDate } from '@adminvault/shared-services';
import { formatPhoneNumberWithCountryCode } from '@/lib/utils';


interface CompaniesMasterViewProps {
    onAddClick?: () => void;
    onBack?: () => void;
}

export const CompaniesMasterView: React.FC<CompaniesMasterViewProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<CompanyResponseModel[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ companyName: '', location: '', email: '', phone: '', estDate: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedCompany, setSelectedCompany] = useState<CompanyResponseModel | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const initialized = useRef(false);
    const companyService = new CompanyService();

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            getAllCompanies();
        }
    }, []);

    const getAllCompanies = async (): Promise<void> => {
        try {
            const response = await companyService.getAllCompanies();
            if (response.status) {
                setCompanies(response.data);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            if (isEditMode && editingCompanyId) {
                const model = new UpdateCompanyModel(editingCompanyId, formData.companyName, formData.location, new Date(formData.estDate), formData.email, formData.phone, user?.id);
                const response = await companyService.updateCompany(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllCompanies();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreateCompanyModel(formData.companyName, formData.location, new Date(formData.estDate), formData.email, formData.phone, user?.id);
                const response = await companyService.createCompany(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllCompanies();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    };

    const handleEdit = (company: CompanyResponseModel): void => {
        setIsEditMode(true);
        setEditingCompanyId(company.id);
        const dateStr = company.estDate ? new Date(company.estDate).toISOString().split('T')[0] : '';
        setFormData({
            companyName: company.companyName,
            location: company.location,
            email: company.email,
            phone: company.phone,
            estDate: dateStr
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number): void => {
        setDeletingCompanyId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (deletingCompanyId) {
            try {
                const model = new DeleteCompanyModel(deletingCompanyId);
                const response = await companyService.deleteCompany(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    getAllCompanies();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message);
            }
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingCompanyId(null);
        setFormData({ companyName: '', location: '', email: '', phone: '', estDate: '' });
    };

    return (
        <>
            <Card className="border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Companies</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="List View"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Company
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Company Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Location</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Email</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {companies?.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No companies found</td></tr>
                                    ) : (
                                        companies?.map((company: CompanyResponseModel) => (
                                            <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{company.companyName}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{company.location || '-'}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                                    {company.email || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => { setSelectedCompany(company); setIsDetailModalOpen(true); }} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleEdit(company)} className="h-7 w-7 flex items-center justify-center rounded bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(company.id)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
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
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {companies?.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <p>No companies found</p>
                                </div>
                            ) : (
                                companies?.map((company: CompanyResponseModel) => (
                                    <div key={company.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setSelectedCompany(company); setIsDetailModalOpen(true); }} className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"><Eye className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => handleEdit(company)} className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"><Pencil className="h-3.5 w-3.5" /></button>
                                                    <button onClick={() => handleDeleteClick(company.id)} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{company.companyName}</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{company.location || 'No location'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{company.email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 p-2 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Building2 className="h-16 w-16" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Company" : "Add Company"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="h-14" required />
                    <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="h-14" required />
                    <Input label="Contact Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-14" required />
                    <PhoneInput label="Contact Phone" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} required />
                    <Input label="Establishment Date" type="date" max="2026-12-31" value={formData.estDate} onChange={(e) => setFormData({ ...formData, estDate: e.target.value })} className="h-14" required />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName="Company"
            />

            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Company Details"
                size="lg"
            >
                {selectedCompany && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                <Building2 className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCompany.companyName}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                <MapPin className="h-4 w-4" /> {selectedCompany.location || 'Location not specified'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Email</label>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-indigo-500" /> {selectedCompany.email || 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-emerald-500" /> {formatPhoneNumberWithCountryCode(selectedCompany.phone) || 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Establishment Date</label>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-amber-500" /> {formatDate(selectedCompany.estDate)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company ID</label>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="h-4 w-4 flex items-center justify-center text-[10px] font-bold bg-slate-100 dark:bg-slate-800 rounded-sm">ID</span> #{selectedCompany.id}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
