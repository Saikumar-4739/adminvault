'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { EmailTypeEnum, DepartmentEnum } from '@adminvault/shared-models';
import { employeeService } from '@/lib/api/services';
import { User, Mail, Shield, Building } from 'lucide-react';

interface AddEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => Promise<boolean>;
    companyId: number;
    initialTab?: 'COMPANY' | 'USER' | 'GROUP';
}

export default function AddEmailModal({ isOpen, onClose, onSuccess, companyId, initialTab }: AddEmailModalProps) {
    const [employees, setEmployees] = useState<any[]>([]);

    const getDefaultType = useCallback(() => {
        if (initialTab === 'USER') return EmailTypeEnum.USER;
        if (initialTab === 'GROUP') return EmailTypeEnum.GROUP;
        return EmailTypeEnum.COMPANY;
    }, [initialTab]);

    const [formData, setFormData] = useState({
        email: '',
        emailType: getDefaultType(),
        department: DepartmentEnum.IT,
        employeeId: '',
    });

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await employeeService.getAllEmployees({ companyId } as any);
            if (response.status) {
                setEmployees(response.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    }, [companyId]);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            setFormData(prev => ({ ...prev, emailType: getDefaultType() }));
        }
    }, [isOpen, fetchEmployees, getDefaultType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            companyId,
            employeeId: formData.employeeId ? Number(formData.employeeId) : null,
        };

        const success = await onSuccess(payload);
        if (success) {
            setFormData({ email: '', emailType: EmailTypeEnum.GENERAL, department: DepartmentEnum.IT, employeeId: '' });
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Configure Routing Point"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Address Identity</h3>
                    </div>
                    <Input
                        label="Routing Email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="it-support@company.com"
                        className="font-bold"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                            <Shield className="w-3.5 h-3.5" />
                            Routing Type
                        </label>
                        <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-all appearance-none"
                            value={formData.emailType}
                            onChange={e => setFormData({ ...formData, emailType: e.target.value as EmailTypeEnum })}
                        >
                            {Object.values(EmailTypeEnum).map(type => (
                                <option key={type} value={type}>{type.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                            <Building className="w-3.5 h-3.5" />
                            Target Department
                        </label>
                        <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-all appearance-none"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value as DepartmentEnum })}
                        >
                            {Object.values(DepartmentEnum).map(dept => (
                                <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        <User className="w-3.5 h-3.5" />
                        Primary Routing Handle (Owner)
                    </label>
                    <select
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-all appearance-none"
                        value={formData.employeeId}
                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    >
                        <option value="">Select Primary Identity...</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" type="button" onClick={onClose} className="rounded-xl px-8">Discard</Button>
                    <Button variant="primary" type="submit" className="rounded-xl px-12 font-black">Link Endpoint</Button>
                </div>
            </form>
        </Modal>
    );
}
