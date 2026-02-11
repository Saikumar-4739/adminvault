'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Building, Shield, User, Calendar, MessageSquare, Plus, Key } from 'lucide-react';

interface AddLicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => Promise<boolean>;
    companies: any[];
    applications: any[];
    employees: any[];
}



export const AddLicenseModal: React.FC<AddLicenseModalProps> = ({ isOpen, onClose, onSuccess, companies, applications, employees }: AddLicenseModalProps) => {
    const [formData, setFormData] = useState({
        applicationId: '',
        companyId: '',
        expiryDate: '',
        assignedDate: '',
        remarks: '',
        assignedEmployeeId: ''
    });

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
            title="New Asset Registration"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Header info / Context */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-indigo-500">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Software Asset Allocation</h3>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Register new software allocation details for your organisation.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Organization context */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                            <Building className="w-3.5 h-3.5" />
                            Organisation / Company
                        </label>
                        <div className="relative group/select">
                            <select
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-bold text-[13px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                value={formData.companyId}
                                onChange={e => setFormData({ ...formData, companyId: e.target.value, assignedEmployeeId: '' })}
                                required
                            >
                                <option value="">Select Organisation</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.companyName.toUpperCase()}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* App Selection */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                            <Shield className="w-3.5 h-3.5" />
                            Software Product
                        </label>
                        <div className="relative group/select">
                            <select
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-bold text-[13px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                value={formData.applicationId}
                                onChange={e => setFormData({ ...formData, applicationId: e.target.value })}
                                required
                            >
                                <option value="">Select Software Product</option>
                                {applications.map(app => (
                                    <option key={app.id} value={app.id}>{app.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personnel Assignment */}
                <div className="space-y-3">
                    <label className="flex items-center justify-between px-1">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            Allocate To Employee
                        </span>
                        {formData.companyId && (
                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase">
                                Remote Access Link Available
                            </span>
                        )}
                    </label>
                    <div className="relative group/select">
                        <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-bold text-[13px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:grayscale"
                            value={formData.assignedEmployeeId}
                            onChange={e => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                            disabled={!formData.companyId}
                        >
                            <option value="">{formData.companyId ? 'OPEN ALLOCATION (SYSTEM WIDE)' : 'SELECT ORGANISATION TO UNLOCK PERSONNEL'}</option>
                            {employees
                                .filter(emp => !formData.companyId || Number(emp.companyId) === Number(formData.companyId))
                                .map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName.toUpperCase()} {emp.lastName.toUpperCase()}</option>
                                ))
                            }
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Starting Date */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Date of Allocation
                        </label>
                        <input
                            type="date"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-bold text-[13px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all uppercase"
                            value={formData.assignedDate}
                            onChange={e => setFormData({ ...formData, assignedDate: e.target.value })}
                        />
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Date of Expiry
                        </label>
                        <input
                            type="date"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 font-bold text-[13px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all uppercase"
                            value={formData.expiryDate}
                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* Remarks */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Remarks / Notes
                    </label>
                    <textarea
                        placeholder="Mention any specific details or notes here... (e.g., Serial Number, Bill No., License Key)"
                        rows={3}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[24px] p-4 font-bold text-[13px] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        className="px-12 py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Save Details
                    </button>
                </div>
            </form>
        </Modal>
    );
}
