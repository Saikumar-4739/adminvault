'use client';

import { useState, useEffect, useCallback } from 'react';
import { workflowService } from '@/lib/api/services';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, ApprovalTypeEnum, GetPendingApprovalsRequestModel } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { Check, Clock, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { PageHeader } from '@/components/ui/PageHeader';


const ApprovalsPage: React.FC = () => {
    const { user } = useAuth();
    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

    const fetchPendingApprovals = useCallback(async () => {
        try {
            const req = new GetPendingApprovalsRequestModel(user!.companyId);
            const res = await workflowService.getPendingApprovals(req);
            if (res.status) {
                setPendingApprovals(res.approvals || []);
            } else {
                AlertMessages.getErrorMessage(res.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to fetch pending approvals');
        }
    }, [user]);

    useEffect(() => {
        if (user?.companyId) {
            fetchPendingApprovals();
        }
    }, [user?.companyId, fetchPendingApprovals]);

    const handleApprove = async (id: number) => {
        try {
            const res = await workflowService.approveRequest({
                requestId: id,
                actionByUserId: user!.id,
                remarks: 'Approved via Portal'
            });
            if (res.status) {
                AlertMessages.getSuccessMessage(res.message);
                fetchPendingApprovals();
            } else {
                AlertMessages.getErrorMessage(res.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to approve');
        }
    };

    const handleReject = async (id: number) => {
        try {
            const res = await workflowService.rejectRequest({
                requestId: id,
                actionByUserId: user!.id,
                remarks: 'Rejected via Portal'
            });
            if (res.status) {
                AlertMessages.getSuccessMessage(res.message);
                fetchPendingApprovals();
            } else {
                AlertMessages.getErrorMessage(res.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to reject');
        }
    };

    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');


    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-4 lg:p-8 min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 space-y-6">
                {/* Header Section */}
                <PageHeader
                    icon={<Check />}
                    title="Approval Center"
                    description="Workflow Management"
                    gradient="from-indigo-500 to-purple-600"
                />

                {/* Tabs */}
                <div>
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-1 rounded-xl inline-flex gap-1 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'pending'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            Pending
                            <span className={`inline-flex items-center justify-center text-[9px] h-4 min-w-[16px] px-1 rounded-full bg-white/20 text-current ${pendingApprovals.length === 0 ? 'opacity-50' : ''}`}>
                                {pendingApprovals.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'history'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            History
                            <Clock className="w-3.5 h-3.5 ml-1 opacity-60" />
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                {activeTab === 'pending' ? (
                    pendingApprovals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
                                <Check className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You're All Caught Up</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm text-center leading-relaxed">
                                No pending approvals in your queue.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {pendingApprovals.map((item) => (
                                <div key={item.id} className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300">
                                    {/* Status Bar */}
                                    <div className={`h-1 w-full ${item.referenceType === ApprovalTypeEnum.TICKET
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                        : item.referenceType === ApprovalTypeEnum.ASSET_ALLOCATION
                                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                                            : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                                        }`}></div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        {/* Header */}
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.referenceType === ApprovalTypeEnum.TICKET
                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                : item.referenceType === ApprovalTypeEnum.ASSET_ALLOCATION
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                }`}>
                                                {item.referenceType === ApprovalTypeEnum.TICKET ? <AlertCircle className="w-3 h-3" />
                                                    : item.referenceType === ApprovalTypeEnum.ASSET_ALLOCATION ? <Package className="w-3 h-3" />
                                                        : <Clock className="w-3 h-3" />}
                                                {item.referenceType}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-500">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Title & Desc */}
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            Request #{item.referenceId}
                                        </h3>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                                            <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requester</p>
                                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {item.requesterName?.trim() || 'Unknown'} {item.managerName?.trim() ? `(Mgr: ${item.managerName.trim()})` : ''}
                                                </p>
                                            </div>
                                            <p className="line-clamp-2">{item.description || 'No description provided.'}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-8 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                                                onClick={() => handleReject(item.id)}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm shadow-indigo-500/20"
                                                onClick={() => handleApprove(item.id)}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Clock className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">History Archive</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center">
                            Your past approval actions will appear here.
                        </p>
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}

export default ApprovalsPage;