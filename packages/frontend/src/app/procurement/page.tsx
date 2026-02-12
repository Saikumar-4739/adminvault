'use client';

import { useState, useEffect, useCallback } from 'react';
import { procurementService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { PageHeader } from '@/components/ui/PageHeader';
import {
    ShoppingCart, Plus, Search,
    Calendar, User, Building,
    DollarSign, Clock, FileText, AlertCircle,
    CheckCircle2, XCircle
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
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const filteredPOs = pos.filter(po =>
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search POs, vendors, or items..."
                            className="w-full pl-10 pr-4 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </PageHeader>

                <CreatePOModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchPOs}
                />

                {filteredPOs.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                            <ShoppingCart className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Purchase Orders Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">Start by creating your first purchase order to track IT asset procurement.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPOs.map((po) => (
                            <Card key={po.id} className="group hover:border-indigo-500/50 transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                            <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 dark:text-white">{po.poNumber}</h3>
                                                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(po.status)}`}>
                                                    {getStatusIcon(po.status)}
                                                    {po.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Building size={12} />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{po.vendorName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <User size={12} />
                                                    <span>{po.requesterName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Calendar size={12} />
                                                    <span>{new Date(po.orderDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold text-indigo-600 dark:text-indigo-400">
                                                    <DollarSign size={12} />
                                                    <span>{po.totalAmount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:border-l dark:border-slate-800 md:pl-6">
                                        <Button variant="outline" size="sm" className="font-bold text-xs">View Details</Button>
                                        <Button variant="primary" size="sm" className="font-bold text-xs px-4">Track</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}

export default ProcurementPage;