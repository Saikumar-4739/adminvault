'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

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
        <Modal isOpen={isOpen} onClose={onClose} title="Register Software License" size="md">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</label>
                        <select
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none"
                            value={formData.companyId}
                            onChange={e => setFormData({ ...formData, companyId: e.target.value, assignedEmployeeId: '' })}
                            required
                        >
                            <option value="">Select Entity</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Software Asset</label>
                        <select
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none"
                            value={formData.applicationId}
                            onChange={e => setFormData({ ...formData, applicationId: e.target.value })}
                            required
                        >
                            <option value="">Select Suite</option>
                            {applications.map(app => (
                                <option key={app.id} value={app.id}>{app.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Personnel (Optional)</label>
                    <select
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={formData.assignedEmployeeId}
                        onChange={e => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                        disabled={!formData.companyId}
                    >
                        <option value="">{formData.companyId ? 'Vacant Assignment' : 'Select Organization first'}</option>
                        {employees
                            .filter(emp =>
                                (!formData.companyId || Number(emp.companyId) === Number(formData.companyId)) &&
                                emp.empStatus !== 'INACTIVE' // Assuming INACTIVE is the value
                            )
                            .map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                            ))
                        }
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting Date</label>
                        <input
                            type="date"
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            value={formData.assignedDate}
                            onChange={e => setFormData({ ...formData, assignedDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</label>
                        <input
                            type="date"
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            value={formData.expiryDate}
                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Remarks</label>
                    <input
                        placeholder="Additional intelligence..."
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" onClick={onClose} type="button" className="h-8 px-4 text-[9px] font-black tracking-widest uppercase">Abort</Button>
                    <Button variant="primary" type="submit" className="h-8 px-6 text-[9px] font-black tracking-widest uppercase shadow-lg shadow-indigo-500/20">Authorize</Button>
                </div>
            </form>
        </Modal>
    );
}
