'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Calendar, Hammer, Info, Clock, RefreshCw } from 'lucide-react';
import { CreateMaintenanceModel, MaintenanceTypeEnum, AssetResponseModel } from '@adminvault/shared-models';
import { maintenanceService, assetService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface CreateMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateMaintenanceModal({ isOpen, onClose, onSuccess }: CreateMaintenanceModalProps) {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assets, setAssets] = useState<AssetResponseModel[]>([]);

    const [formData, setFormData] = useState<CreateMaintenanceModel>({
        assetId: 0,
        maintenanceType: MaintenanceTypeEnum.PREVENTIVE,
        scheduledDate: new Date(),
        description: '',
        isRecurring: false,
        frequencyDays: 30
    });

    // Handle string to Date conversion for input field
    const [dateString, setDateString] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen]);

    const fetchAssets = async () => {
        try {
            const res = await assetService.getAllAssets(user?.companyId || 0);
            setAssets(res.data || []);
        } catch (err: any) {
            console.error('Failed to fetch assets', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.assetId === 0) {
            toastError("Please select an asset");
            return;
        }

        if (!formData.description) {
            toastError("Please provide a description of the maintenance");
            return;
        }

        setIsSubmitting(true);
        try {
            // Ensure date is set correctly
            const submissionData = {
                ...formData,
                scheduledDate: new Date(dateString)
            };

            const res = await maintenanceService.createSchedule(submissionData);
            if (res.status) {
                success("Maintenance scheduled successfully");
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    assetId: 0,
                    maintenanceType: MaintenanceTypeEnum.PREVENTIVE,
                    scheduledDate: new Date(),
                    description: '',
                    isRecurring: false,
                    frequencyDays: 30
                });
            } else {
                toastError(res.message);
            }
        } catch (err: any) {
            toastError(err.message || "Failed to schedule maintenance");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Schedule Asset Maintenance"
            size="lg"
            footer={
                <div className="flex gap-2 justify-end w-full">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                        Schedule Task
                    </Button>
                </div>
            }
        >
            <form className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <Select
                        label="Target Asset"
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: Number(e.target.value) })}
                        required
                    >
                        <option value={0}>Select Asset to maintain</option>
                        {assets.map(a => (
                            <option key={a.id} value={a.id}>{a.serialNumber} - {a.assetName}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Maintenance Type"
                            value={formData.maintenanceType}
                            onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as MaintenanceTypeEnum })}
                            required
                        >
                            {Object.values(MaintenanceTypeEnum).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>

                        <Input
                            label="Scheduled Date"
                            type="date"
                            value={dateString}
                            onChange={(e) => setDateString(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Info size={14} className="text-emerald-500" /> Maintenance Description
                        </label>
                        <textarea
                            className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[120px]"
                            placeholder="Describe what needs to be done (e.g. Annual physical cleaning, firmware update, or specific repair details...)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                    <RefreshCw className={formData.isRecurring ? "text-emerald-500 animate-spin-slow" : "text-slate-400"} size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recurring Maintenance</h4>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">Automatically schedule next task upon completion</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                                checked={formData.isRecurring}
                                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                            />
                        </div>

                        {formData.isRecurring && (
                            <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                                <Input
                                    label="Frequency (Days)"
                                    type="number"
                                    min={1}
                                    placeholder="e.g. 30 for monthly, 90 for quarterly"
                                    value={formData.frequencyDays}
                                    onChange={(e) => setFormData({ ...formData, frequencyDays: Number(e.target.value) })}
                                    className="bg-white dark:bg-slate-900"
                                />
                                <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                                    <Clock size={10} /> Next task will be scheduled {formData.frequencyDays} days after this one completes.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
