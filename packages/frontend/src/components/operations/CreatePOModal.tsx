'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { CreatePOModel, POItemModel, Vendor, IdRequestModel } from '@adminvault/shared-models';
import { vendorService, procurementService, employeeService, companyService, assetTypeService } from '@/lib/api/services';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialPO?: any;
}

export function CreatePOModal({ isOpen, onClose, onSuccess, initialPO }: CreatePOModalProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [approvers, setApprovers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [assetTypes, setAssetTypes] = useState<any[]>([]);

    const defaultForm = {
        vendorId: 0,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: '',
        approverId: 0,
        companyId: user?.companyId || 0,
        items: [{ itemName: '', quantity: '', unitPrice: '', assetTypeId: undefined }]
    };

    const [formData, setFormData] = useState<any>(defaultForm);

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
            if (initialPO) {
                setFormData({
                    vendorId: initialPO.vendorId || 0,
                    orderDate: initialPO.orderDate ? new Date(initialPO.orderDate).toISOString().split('T')[0] : '',
                    expectedDeliveryDate: initialPO.expectedDeliveryDate ? new Date(initialPO.expectedDeliveryDate).toISOString().split('T')[0] : '',
                    notes: initialPO.notes || '',
                    approverId: initialPO.approverId || 0,
                    companyId: initialPO.companyId || user?.companyId || 0,
                    items: initialPO.items?.length > 0 ? initialPO.items : [{ itemName: '', quantity: '', unitPrice: '', assetTypeId: undefined }]
                });
            } else {
                setFormData(defaultForm);
            }
        }
    }, [isOpen, initialPO]);

    const fetchMasters = async () => {
        if (!user?.companyId) return;
        try {
            const [vRes, eRes, cRes, atRes] = await Promise.all([
                vendorService.getAllVendors(),
                employeeService.getAllEmployees(new IdRequestModel(7)),
                companyService.getAllCompaniesDropdown(),
                assetTypeService.getAllAssetTypesDropdown()
            ]);
            setVendors(vRes.vendors || []);
            const employeeList = (eRes as any)?.data || (eRes as any)?.employees || (Array.isArray(eRes) ? eRes : []);
            setApprovers(employeeList);
            setCompanies((cRes as any)?.data || (cRes as any)?.companies || []);
            setAssetTypes((atRes as any)?.data || (atRes as any)?.assetTypes || []);
        } catch (err: any) {
            console.error('Failed to fetch masters', err);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { itemName: '', quantity: '', unitPrice: '', assetTypeId: undefined }]
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: keyof POItemModel, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.vendorId === 0) {
            AlertMessages.getErrorMessage("Please select a vendor");
            return;
        }

        if (formData.items.some((i: any) => !i.itemName || i.quantity <= 0)) {
            AlertMessages.getErrorMessage("Please fill in all item details correctly");
            return;
        }

        setIsSubmitting(true);
        try {
            const model = new CreatePOModel(
                formData.vendorId,
                new Date(formData.orderDate),
                formData.items.map((i: any) => new POItemModel(i.itemName, Number(i.quantity || 0), Number(i.unitPrice || 0), undefined, i.assetTypeId ? Number(i.assetTypeId) : undefined)),
                formData.companyId,
                formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate) : undefined,
                formData.notes,
                undefined, // timeSpentMinutes
                formData.approverId || undefined // approverId
            );
            const res = initialPO
                ? await procurementService.updatePO(initialPO.id, model)
                : await procurementService.createPurchaseOrder(model);

            if (res.status) {
                AlertMessages.getSuccessMessage(`Purchase Order ${initialPO ? 'updated' : 'created'} successfully`);
                onSuccess();
                onClose();
                // Reset form
                setFormData(defaultForm);
            } else {
                AlertMessages.getErrorMessage(res.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || "Failed to create Purchase Order");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialPO ? `Update Purchase Order: ${initialPO.poNumber}` : "Create New Purchase Order"}
            size="2xl"
            footer={
                <div className="flex gap-2 w-full">
                    <div className="flex-1 flex items-center px-4">
                        <span className="text-sm font-bold text-slate-500 mr-2">Total Amount:</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                        {initialPO ? 'Update PO' : 'Create PO & Submit'}
                    </Button>
                </div>
            }
        >
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Select
                        label="Company"
                        value={formData.companyId}
                        onChange={(e) => setFormData({ ...formData, companyId: Number(e.target.value) })}
                        required
                        options={[
                            { label: 'Select Company', value: 0 },
                            ...companies.map(c => ({ label: c.name, value: Number(c.id) }))
                        ]}
                    />

                    <Select
                        label="Vendor"
                        value={formData.vendorId}
                        onChange={(e) => setFormData({ ...formData, vendorId: Number(e.target.value) })}
                        required
                        options={[
                            { label: 'Select Vendor', value: 0 },
                            ...vendors.map(v => ({ label: v.name, value: v.id }))
                        ]}
                    />

                    <Input
                        label="Order Date"
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Expected Delivery Date"
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    />

                    <Select
                        label="Approver (Optional)"
                        value={formData.approverId}
                        onChange={(e) => setFormData({ ...formData, approverId: Number(e.target.value) })}
                        options={[
                            { label: 'No Specific Approver', value: 0 },
                            ...approvers.map(a => ({ label: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email, value: Number(a.id) }))
                        ]}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <ShoppingCart size={16} className="text-indigo-500" />
                            Order Items
                        </h4>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 py-0 px-3 font-bold text-xs uppercase tracking-widest">
                            <Plus size={14} className="mr-1" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {formData.items.map((item: any, index: number) => (
                            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-12 gap-3 items-end group">
                                <div className="col-span-12 md:col-span-4">
                                    <Input
                                        label="Item Name"
                                        value={item.itemName}
                                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                        className="bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <Select
                                        label="Asset Type"
                                        value={item.assetTypeId}
                                        onChange={(e) => updateItem(index, 'assetTypeId', e.target.value)}
                                        options={[
                                            { label: 'Select Type', value: 0 },
                                            ...assetTypes.map(at => ({ label: at.name, value: Number(at.id) }))
                                        ]}
                                    />
                                </div>
                                <div className="col-span-5 md:col-span-2">
                                    <Input
                                        label="Qty"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        className="bg-white dark:bg-slate-900 text-center"
                                    />
                                </div>
                                <div className="col-span-5 md:col-span-2">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                        className="bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1 pb-1 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </form>
        </Modal>
    );
}
