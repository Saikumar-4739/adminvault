'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { CreatePOModel, POItemModel, Vendor, AssetType } from '@adminvault/shared-models';
import { vendorService, assetTypeService, procurementService } from '@/lib/api/services';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreatePOModal({ isOpen, onClose, onSuccess }: CreatePOModalProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);

    const [formData, setFormData] = useState<any>({
        vendorId: 0,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: '',
        items: [{ itemName: '', quantity: 1, unitPrice: 0, sku: '', assetTypeId: undefined }]
    });

    useEffect(() => {
        if (isOpen) {
            fetchMasters();
        }
    }, [isOpen]);

    const fetchMasters = async () => {
        if (!user?.companyId) return;
        try {
            const vRes = await vendorService.getAllVendors();
            const aRes = await assetTypeService.getAllAssetTypes();
            setVendors(vRes.vendors || []);
            setAssetTypes(aRes.assetTypes || []);
        } catch (err: any) {
            console.error('Failed to fetch masters', err);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { itemName: '', quantity: 1, unitPrice: 0, sku: '', assetTypeId: undefined }]
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
                formData.items.map((i: any) => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate) : undefined,
                formData.notes
            );
            const res = await procurementService.createPO(model);
            if (res.status) {
                AlertMessages.getSuccessMessage("Purchase Order created successfully");
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    vendorId: 0,
                    orderDate: new Date().toISOString().split('T')[0],
                    expectedDeliveryDate: '',
                    notes: '',
                    items: [{ itemName: '', quantity: 1, unitPrice: 0, sku: '', assetTypeId: undefined }]
                });
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
            title="Create New Purchase Order"
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
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>Create PO & Submit</Button>
                </div>
            }
        >
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <Input
                        label="Expected Delivery Date"
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                    />

                    <Input
                        label="Reference / SKU Prefix"
                        placeholder="Optional"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <ShoppingCart size={16} className="text-indigo-500" />
                            Order Items
                        </h4>
                        <Button variant="outline" size="sm" onClick={addItem} className="h-8 py-0 px-3 font-bold text-xs uppercase tracking-widest">
                            <Plus size={14} className="mr-1" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {formData.items.map((item: any, index: number) => (
                            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-12 gap-3 items-end group">
                                <div className="col-span-12 md:col-span-4">
                                    <Input
                                        label="Item Name"
                                        placeholder="e.g. Dell Latitude 5420"
                                        value={item.itemName}
                                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                        className="bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <Input
                                        label="Qty"
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                        className="bg-white dark:bg-slate-900 text-center"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <Input
                                        label="Price"
                                        type="number"
                                        min={0}
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                        className="bg-white dark:bg-slate-900"
                                    />
                                </div>
                                <div className="col-span-10 md:col-span-3">
                                    <Select
                                        label="Asset Type"
                                        value={item.assetTypeId || 0}
                                        onChange={(e) => updateItem(index, 'assetTypeId', Number(e.target.value))}
                                        className="bg-white dark:bg-slate-900"
                                        options={[
                                            { label: 'Assign Later', value: 0 },
                                            ...assetTypes.map(at => ({ label: at.name, value: at.id }))
                                        ]}
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

                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Additional Notes</label>
                    <textarea
                        className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px]"
                        placeholder="Add any specific instructions for the vendor or internal team..."
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
            </form>
        </Modal>
    );
}
