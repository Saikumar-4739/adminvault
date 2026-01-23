'use client';

import { useState, useEffect, useCallback } from 'react';
import { maintenanceService } from '@/lib/api/services';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import {
    Calendar, Plus, Hammer,
    Settings, Clock, CheckCircle2,
    Info, Layers
} from 'lucide-react';
import { MaintenanceStatusEnum, MaintenanceTypeEnum, GetMaintenanceSchedulesRequestModel } from '@adminvault/shared-models';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { CreateMaintenanceModal } from '@/components/operations/CreateMaintenanceModal';

const MaintenancePage: React.FC = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSchedules = useCallback(async () => {
        if (!user?.companyId) return;
        setIsLoading(true);
        try {
            const req = new GetMaintenanceSchedulesRequestModel();
            req.companyId = user.companyId;
            const response = await maintenanceService.getSchedules(req);
            if (response.status) {
                setSchedules(response.data || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch maintenance schedules');
        } finally {
            setIsLoading(false);
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const getStatusStyle = (status: MaintenanceStatusEnum) => {
        switch (status) {
            case MaintenanceStatusEnum.SCHEDULED:
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case MaintenanceStatusEnum.IN_PROGRESS:
                return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
            case MaintenanceStatusEnum.COMPLETED:
                return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
            case MaintenanceStatusEnum.OVERDUE:
                return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTypeIcon = (type: MaintenanceTypeEnum) => {
        switch (type) {
            case MaintenanceTypeEnum.PREVENTIVE: return <Settings size={14} />;
            case MaintenanceTypeEnum.REPAIR: return <Hammer size={14} />;
            case MaintenanceTypeEnum.UPGRADE: return <Layers size={14} />;
            case MaintenanceTypeEnum.PATCHING: return <Settings size={14} />;
            default: return <Info size={14} />;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950">
            <PageHeader
                icon={<Calendar className="text-white" />}
                title="Maintenance Schedules"
                description="Manage preventive maintenance and asset repairs"
                gradient="from-emerald-600 to-teal-700"
                actions={[
                    {
                        label: 'Schedule Maintenance',
                        onClick: () => setIsModalOpen(true),
                        icon: <Plus className="h-4 w-4" />,
                        variant: 'primary'
                    }
                ]}
            />

            <CreateMaintenanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSchedules}
            />

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <PageLoader />
                </div>
            ) : schedules.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                        <Calendar className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Schedules Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">Keep your IT infrastructure healthy by scheduling regular maintenance.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules.map((s) => (
                        <Card key={s.id} className="relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest border-l border-b rounded-bl-xl ${getStatusStyle(s.status)}`}>
                                {s.status}
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Settings className="text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                        {getTypeIcon(s.maintenanceType)}
                                        {s.maintenanceType}
                                    </div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight uppercase tracking-tighter shadow-sm">{s.assetSerial}</h4>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Clock size={16} />
                                    <span>Scheduled: <strong>{new Date(s.scheduledDate).toLocaleDateString()}</strong></span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                                    "{s.description || 'No additional details provided for this maintenance task.'}"
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                {s.status === MaintenanceStatusEnum.SCHEDULED && (
                                    <Button variant="outline" size="sm" className="w-full font-bold">Start Work</Button>
                                )}
                                {s.status === MaintenanceStatusEnum.IN_PROGRESS && (
                                    <Button variant="primary" size="sm" className="w-full font-bold">Complete & Close</Button>
                                )}
                                {s.status === MaintenanceStatusEnum.COMPLETED && (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                        <CheckCircle2 size={16} />
                                        Completed on {new Date(s.completedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


export default MaintenancePage;