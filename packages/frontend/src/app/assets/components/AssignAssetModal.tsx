import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
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
            size="sm"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block ml-1">Remarks</label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm min-h-[80px] focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Optional remarks..."
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        className="flex-1 py-2"
                    >
                        Confirm Assignment
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
