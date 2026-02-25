'use client';

import { useState, useEffect, useCallback } from 'react';
import { procurementService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

import { PageHeader } from '@/components/ui/PageHeader';
import {
    ShoppingCart, Plus, Search,
    Calendar, User, Building,
    DollarSign, Clock, FileText, AlertCircle,
    CheckCircle2, XCircle, Filter, Eye, Activity, Pen
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, POStatusEnum, GetAllPOsRequestModel } from '@adminvault/shared-models';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { CreatePOModal } from '@/components/operations/CreatePOModal';

const ProcurementPage: React.FC = () => {
    const { user } = useAuth();
    const [pos, setPos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any | null>(null);
    const [editPO, setEditPO] = useState<any | null>(null);

    // Derived Metrics
    const totalPOs = pos.length;
    const totalSpend = pos.reduce((sum, po) => sum + (po.status === POStatusEnum.APPROVED || po.status === POStatusEnum.ORDERED || po.status === POStatusEnum.RECEIVED ? po.totalAmount : 0), 0);
    const pendingApprovals = pos.filter(po => po.status === POStatusEnum.PENDING_APPROVAL).length;
    const activeVendors = new Set(pos.map(po => po.vendorId)).size;

    const filteredPOs = pos.filter(po => {
        const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const fetchPOs = useCallback(async () => {
        if (!user?.companyId) return;
        setIsLoading(true);
        try {
            const req = new GetAllPOsRequestModel(user.companyId);
            const response = await procurementService.getAllPOs(req);
            if (response.status) {
                setPos(response.pos || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch Purchase Orders');
        } finally {
            setIsLoading(false);
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchPOs();
    }, [fetchPOs]);

    const getStatusStyle = (status: POStatusEnum) => {
        switch (status) {
            case POStatusEnum.PENDING_APPROVAL:
                return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case POStatusEnum.APPROVED:
                return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
            case POStatusEnum.REJECTED:
                return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
            case POStatusEnum.ORDERED:
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case POStatusEnum.RECEIVED:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: POStatusEnum) => {
        switch (status) {
            case POStatusEnum.PENDING_APPROVAL: return <Clock size={14} />;
            case POStatusEnum.APPROVED: return <CheckCircle2 size={14} />;
            case POStatusEnum.REJECTED: return <XCircle size={14} />;
            case POStatusEnum.ORDERED: return <ShoppingCart size={14} />;
            case POStatusEnum.RECEIVED: return <Building size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };



    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
                <PageHeader
                    icon={<ShoppingCart className="text-white" />}
                    title="Procurement"
                    description="Manage purchase orders and vendor interactions"
                    gradient="from-blue-600 to-indigo-700"
                    actions={[
                        {
                            label: 'New Purchase Order',
                            onClick: () => setIsModalOpen(true),
                            icon: <Plus className="h-4 w-4" />,
                            variant: 'primary'
                        }
                    ]}
                >
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search POs or vendors..."
                                className="w-full pl-10 pr-4 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative shrink-0 min-w-[160px]">
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <select
                                className="w-full pl-10 pr-8 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value={POStatusEnum.PENDING_APPROVAL}>Pending</option>
                                <option value={POStatusEnum.APPROVED}>Approved</option>
                                <option value={POStatusEnum.ORDERED}>Ordered</option>
                                <option value={POStatusEnum.RECEIVED}>Received</option>
                                <option value={POStatusEnum.REJECTED}>Rejected</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </PageHeader>

                {/* Metrics Dashboard Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total POs</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalPOs}</h3>
                        </div>
                    </Card>
                    <Card className="p-5 flex items-center gap-4 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                            <DollarSign className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spend</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        </div>
                    </Card>
                    <Card className="p-5 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                            <Activity className="text-amber-600 dark:text-amber-400" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Approval</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingApprovals}</h3>
                        </div>
                    </Card>
                    <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                            <Building className="text-emerald-600 dark:text-emerald-400" size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Vendors</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeVendors}</h3>
                        </div>
                    </Card>
                </div>

                <CreatePOModal
                    isOpen={isModalOpen || !!editPO}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditPO(null);
                    }}
                    onSuccess={fetchPOs}
                    initialPO={editPO}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
                    </div>
                ) : filteredPOs.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                            <ShoppingCart className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Purchase Orders Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">Start by creating your first purchase order to track IT asset procurement.</p>
                    </Card>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Purchase Order</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider hidden md:table-cell">Requester</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Total Amount</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {filteredPOs.map((po) => (
                                        <tr key={po.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                                                        <FileText className="text-indigo-600 dark:text-indigo-400" size={18} />
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{po.poNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                    <Building size={14} className="text-slate-400" />
                                                    {po.vendorName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-slate-400" />
                                                    {po.requesterName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell text-sm text-slate-500">
                                                {new Date(po.orderDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-slate-900 dark:text-white">
                                                ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(po.status)}`}>
                                                    {getStatusIcon(po.status)}
                                                    {po.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedPO(po)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                        title="View PO Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditPO(po)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Edit PO"
                                                    >
                                                        <Pen size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View Details Modal */}
                {selectedPO && (
                    <Modal
                        isOpen={!!selectedPO}
                        onClose={() => setSelectedPO(null)}
                        title={`Purchase Order: ${selectedPO.poNumber}`}
                        size="2xl"
                        footer={
                            <div className="flex gap-2 w-full justify-end">
                                <Button variant="outline" onClick={() => setSelectedPO(null)}>Close</Button>
                            </div>
                        }
                    >
                        <div className="space-y-6">
                            {/* Summary info */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(selectedPO.status)}`}>
                                        {getStatusIcon(selectedPO.status)}
                                        {selectedPO.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vendor</p>
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <Building size={14} className="text-slate-400" />
                                        <span className="truncate">{selectedPO.vendorName}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requester</p>
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <User size={14} className="text-slate-400" />
                                        <span className="truncate">{selectedPO.requesterName}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Date</p>
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(selectedPO.orderDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <ShoppingCart size={16} className="text-indigo-500" />
                                    Order Items
                                </h4>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <table className="w-full text-left bg-white dark:bg-slate-900">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {selectedPO.items?.length ? selectedPO.items.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{item.itemName}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-500 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-500 text-right">${(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 text-right">${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No items available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Total Amount:</td>
                                                <td className="px-4 py-3 text-lg font-black text-indigo-600 dark:text-indigo-400 text-right">${(selectedPO.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Notes & Additional info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Delivery Date</p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <Calendar size={14} className="text-slate-400" />
                                        {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : 'Not Specified'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Notes / Ref</p>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 min-h-[46px] whitespace-pre-wrap">
                                        {selectedPO.notes || 'No notes provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </RouteGuard>
    );
}

export default ProcurementPage;