'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';


interface AddEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => Promise<boolean>;
    companyId: number;
}

export default function AddEmailModal({ isOpen, onClose, onSuccess, companyId }: AddEmailModalProps) {
    // We'll use local state for form or simple uncontrolled.
    // Assuming simple form for now.
    const [formData, setFormData] = useState({
        email: '',
        emailType: 'User' as any, // Default
        employeeId: '',
        status: 'Active'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            companyId,
            employeeId: formData.employeeId ? Number(formData.employeeId) : null,
            // Map string 'User' to Enum if needed, or backend handles string match.
            // Using "User" | "Group" strings for UI, assume backend accepts them or mapped.
            emailType: formData.emailType.toUpperCase() // USER | GROUP | COMPANY
        };

        const success = await onSuccess(payload);
        if (success) {
            setFormData({ email: '', emailType: 'User', employeeId: '', status: 'Active' });
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Email Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                        className="w-full border rounded p-2"
                        value={formData.emailType}
                        onChange={e => setFormData({ ...formData, emailType: e.target.value })}
                    >
                        <option value="User">User</option>
                        <option value="Group">Group</option>
                        <option value="Company">Company</option>
                    </select>
                </div>

                {formData.emailType === 'User' && (
                    <Input
                        label="Employee ID (Optional)"
                        type="number"
                        value={formData.employeeId}
                        onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    />
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Create</Button>
                </div>
            </form>
        </Modal>
    );
}
