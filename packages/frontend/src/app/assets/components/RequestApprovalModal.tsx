'use client';

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { emailService } from '@/lib/api/services';
import { SendAssetApprovalEmailModel } from '@adminvault/shared-models';
import { Mail, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RequestApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    statistics?: any;
    onSuccess?: () => void;
}

export const RequestApprovalModal: React.FC<RequestApprovalModalProps> = ({ isOpen, onClose, statistics, onSuccess }) => {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        approverEmail: '',
        message: 'Please review the current asset inventory state for approval.'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.approverEmail) {
            toastError('Validation Error', 'Approver email is required');
            return;
        }

        setIsLoading(true);
        try {
            const reqModel = new SendAssetApprovalEmailModel(
                formData.approverEmail,
                Number(user?.companyId || 1),
                user?.fullName || 'Admin User',
                formData.message,
                statistics
            );

            const response = await emailService.sendAssetApprovalEmail(reqModel);

            if (response.status) {
                success('Success', 'Approval request sent successfully');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toastError('Error', response.message || 'Failed to send email');
            }
        } catch (error: any) {
            toastError('Error', error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Request Inventory Approval"
            size="md"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Send Approval Request</h3>
                            <p className="text-xs text-slate-500">Notify a manager or auditor to review the current inventory.</p>
                        </div>
                    </div>
                </div>

                <Input
                    label="Approver Email"
                    name="approverEmail"
                    type="email"
                    placeholder="manager@company.com"
                    value={formData.approverEmail}
                    onChange={handleChange}
                    required
                    leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Message (Optional)
                    </label>
                    <textarea
                        name="message"
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow resize-none"
                        placeholder="Add a note..."
                        value={formData.message}
                        onChange={handleChange}
                    />
                </div>

                {statistics && (
                    <div className="text-xs text-slate-500 mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                        <p className="font-bold mb-1">Included Summary:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span>Total Assets: {statistics.total}</span>
                            <span>Active: {statistics.inUse}</span>
                            <span>Available: {statistics.available}</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isLoading} leftIcon={<Send className="h-4 w-4" />}>
                        Send Request
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
