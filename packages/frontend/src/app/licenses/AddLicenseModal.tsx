'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Building, Shield, User, Calendar, MessageSquare, Plus, Key } from 'lucide-react';

interface AddLicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => Promise<boolean>;
    companies: any[];
    applications: any[];
    employees: any[];
    initialLicense?: any;
}



export const AddLicenseModal: React.FC<AddLicenseModalProps> = ({ isOpen, onClose, onSuccess, companies, applications, employees, initialLicense }: AddLicenseModalProps) => {
    const [formData, setFormData] = useState({
        applicationId: '',
        companyId: '',
        expiryDate: '',
        assignedDate: '',
        remarks: '',
        assignedEmployeeId: ''
    });

    useEffect(() => {
        if (isOpen && initialLicense) {
            setFormData({
                applicationId: initialLicense.applicationId?.toString() || '',
                companyId: initialLicense.companyId?.toString() || '',
                expiryDate: initialLicense.expiryDate ? new Date(initialLicense.expiryDate).toISOString().split('T')[0] : '',
                assignedDate: initialLicense.assignedDate ? new Date(initialLicense.assignedDate).toISOString().split('T')[0] : '',
                remarks: initialLicense.remarks || '',
                assignedEmployeeId: initialLicense.assignedEmployeeId?.toString() || ''
            });
        } else if (!isOpen) {
            setFormData({
                applicationId: '', companyId: '',
                expiryDate: '', assignedDate: '', remarks: '', assignedEmployeeId: ''
            });
        }
    }, [isOpen, initialLicense]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSuccess({
            ...formData,
            companyId: Number(formData.companyId),
            applicationId: Number(formData.applicationId),
            assignedDate: formData.assignedDate || null,
            expiryDate: formData.expiryDate || null,
            remarks: formData.remarks || null,
            assignedEmployeeId: formData.assignedEmployeeId ? Number(formData.assignedEmployeeId) : null
        });

        if (success) {
            setFormData({
                applicationId: '', companyId: '',
                expiryDate: '', assignedDate: '', remarks: '', assignedEmployeeId: ''
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialLicense ? "Update Software License" : "Add Software License"}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization context */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-1">
                            <Building className="w-3.5 h-3.5" />
                            Company
                        </label>
                        <div className="relative group/select">
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                value={formData.companyId}
                                onChange={e => setFormData({ ...formData, companyId: e.target.value, assignedEmployeeId: '' })}
                                required
                            >
                                <option value="">Select Company</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* App Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-1">
                            <Shield className="w-3.5 h-3.5" />
                            Software Product
                        </label>
                        <div className="relative group/select">
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                value={formData.applicationId}
                                onChange={e => setFormData({ ...formData, applicationId: e.target.value })}
                                required
                            >
                                <option value="">Select Software Product</option>
                                {applications.map(app => (
                                    <option key={app.id} value={app.id}>{app.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personnel Assignment */}
                <div className="space-y-2">
                    <label className="flex items-center justify-between px-1">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <User className="w-3.5 h-3.5" />
                            Assign To Employee
                        </span>
                        {formData.companyId && (
                            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                Company Selected
                            </span>
                        )}
                    </label>
                    <div className="relative group/select">
                        <select
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            value={formData.assignedEmployeeId}
                            onChange={e => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                            disabled={!formData.companyId}
                        >
                            <option value="">{formData.companyId ? 'Leave blank for company-wide license' : 'Select a company first'}</option>
                            {employees
                                .filter(emp => !formData.companyId || Number(emp.companyId) === Number(formData.companyId))
                                .map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                ))
                            }
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Starting Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Allocation Date
                        </label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={formData.assignedDate}
                            onChange={e => setFormData({ ...formData, assignedDate: e.target.value })}
                        />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={formData.expiryDate}
                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Notes
                    </label>
                    <textarea
                        placeholder="Add notes, serial numbers, or license keys here..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        {initialLicense ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
