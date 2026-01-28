'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
        <Modal isOpen={isOpen} onClose={onClose} title="Add License" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            value={formData.companyId}
                            onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                            required
                        >
                            <option value="">Select Company</option>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Application</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            value={formData.applicationId}
                            onChange={e => setFormData({ ...formData, applicationId: e.target.value })}
                            required
                        >
                            <option value="">Select Application</option>
                            {applications.map(app => (
                                <option key={app.id} value={app.id}>{app.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assigned User (Optional)</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        value={formData.assignedEmployeeId}
                        onChange={e => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                    >
                        <option value="">No Assignment</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}{emp.managerName ? ` (Mgr: ${emp.managerName})` : ''}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Assigned Date"
                        type="date"
                        value={formData.assignedDate}
                        onChange={e => setFormData({ ...formData, assignedDate: e.target.value })}
                    />
                    <Input
                        label="Expiry Date"
                        type="date"
                        value={formData.expiryDate}
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                </div>
                <Input
                    label="Remarks"
                    value={formData.remarks}
                    onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Assign License</Button>
                </div>
            </form>
        </Modal>
    );
}
