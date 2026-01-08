import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { administrationService, employeeService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface AssignAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: any;
    onSuccess: () => void;
}

export default function AssignAssetModal({ isOpen, onClose, asset, onSuccess }: AssignAssetModalProps) {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        employeeId: '',
        assignedDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const fetchEmployees = useCallback(async () => {
        if (!user?.companyId) return;
        try {
            const response = await employeeService.getAllEmployees(user.companyId);
            if (response.status) {
                setEmployees(response.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    }, [user?.companyId]);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            setFormData({
                employeeId: '',
                assignedDate: new Date().toISOString().split('T')[0],
                remarks: ''
            });
        }
    }, [isOpen, fetchEmployees]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!user?.id) {
            toastError('Error', 'User session not found');
            setIsLoading(false);
            return;
        }

        try {
            const response = await administrationService.assignAssetOp(
                asset.id,
                Number(formData.employeeId),
                formData.remarks
            );

            if (response.status) {
                success('Success', 'Asset assigned successfully');
                onSuccess();
                onClose();
            } else {
                toastError('Error', response.message || 'Failed to assign asset');
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
            title={`Assign Asset: ${asset?.assetName || ''}`}
            size="md"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Employee Selection */}
                <div>
                    <Select
                        label="Assign To Employee"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select Employee' },
                            ...employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName} (${e.employeeId})` }))
                        ]}
                        required
                    />
                </div>

                {/* Assignment Date */}
                <div>
                    <Input
                        label="Assignment Date"
                        name="assignedDate"
                        type="date"
                        value={formData.assignedDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Remarks */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Remarks (Optional)
                    </label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        className="flex-1 h-11"
                    >
                        Confirm
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
