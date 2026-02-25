'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmailTypeEnum, IdRequestModel } from '@adminvault/shared-models';
import { employeeService, departmentService } from '@/lib/api/services';
import { User, Mail, Shield, Building } from 'lucide-react';

interface AddEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => Promise<boolean>;
    companyId: number;
    initialTab?: 'COMPANY' | 'USER' | 'GROUP';
}

interface AddEmailModalProps {
    children?: React.ReactNode;
}

export const AddEmailModal: React.FC<AddEmailModalProps> = ({ isOpen, onClose, onSuccess, companyId, initialTab }: AddEmailModalProps) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const getDefaultType = useCallback(() => {
        if (initialTab === 'USER') return EmailTypeEnum.USER;
        if (initialTab === 'GROUP') return EmailTypeEnum.GROUP;
        return EmailTypeEnum.COMPANY;
    }, [initialTab]);

    const [formData, setFormData] = useState({
        email: '',
        emailType: getDefaultType(),
        department: '',
        employeeId: '',
    });

    const fetchEmployees = useCallback(async () => {
        try {
            const req = new IdRequestModel(Number(companyId) || 0);
            const response = await employeeService.getAllEmployees(req);
            if (response.status) {
                const data = response.data || [];
                setEmployees(data);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    }, [companyId]);

    const fetchDepartments = useCallback(async () => {
        try {
            const response = await departmentService.getAllDepartments();
            if (response.status) {
                setDepartments(response.departments || []);
                if (response.departments?.length > 0 && !formData.department) {
                    setFormData(prev => ({ ...prev, department: response.departments[0].name }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    }, [companyId, formData.department]);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            fetchDepartments();
            setFormData(prev => ({ ...prev, emailType: getDefaultType() }));
        }
    }, [isOpen, fetchEmployees, fetchDepartments, getDefaultType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            companyId,
            employeeId: formData.employeeId ? Number(formData.employeeId) : null,
        };

        const success = await onSuccess(payload);
        if (success) {
            setFormData({ email: '', emailType: EmailTypeEnum.GENERAL, department: '', employeeId: '' });
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Allocate Email Address"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">Email Details</h3>
                    </div>
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                            required
                        >
                            <option value="">Choose Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center justify-between gap-2 px-1">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            Employee Name
                        </span>
                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                            {employees.length} Identities
                        </span>
                    </label>
                    <div className="relative group/select">
                        <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-500 transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 px-1">Select the employee to assign this email to.</p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" type="button" onClick={onClose} className="rounded-xl px-8">Cancel</Button>
                    <Button variant="primary" type="submit" className="rounded-xl px-12 font-black">Save</Button>
                </div>
            </form>
        </Modal>
    );
}
