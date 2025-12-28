'use client';

import { useEffect, useState } from 'react';
import { Calendar, User, ArrowLeft, Plus, CheckCircle, AlertTriangle, History } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { services } from '@/lib/api/services';
import { AssetTimelineEvent, AssetTimelineEventType } from '@adminvault/shared-models';
import { PageLoader } from '@/components/ui/Spinner';

interface AssetTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: any;
    companyId: number;
}

export default function AssetTimelineModal({ isOpen, onClose, asset, companyId }: AssetTimelineModalProps) {
    const [events, setEvents] = useState<AssetTimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && asset && companyId) {
            fetchTimeline();
        }
    }, [isOpen, asset, companyId]);

    const fetchTimeline = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await services.asset.getTimeline(asset.id, companyId);
            if (response.status) {
                setEvents(response.events);
            } else {
                setError(response.message || 'Failed to fetch timeline');
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching timeline');
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: AssetTimelineEventType) => {
        switch (type) {
            case AssetTimelineEventType.CREATED:
                return <Plus className="h-5 w-5 text-white" />;
            case AssetTimelineEventType.ASSIGNED:
                return <User className="h-5 w-5 text-white" />;
            case AssetTimelineEventType.RETURNED:
                return <ArrowLeft className="h-5 w-5 text-white" />;
            case AssetTimelineEventType.MAINTENANCE:
                return <AlertTriangle className="h-5 w-5 text-white" />;
            case AssetTimelineEventType.RETIRED:
                return <History className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };

    const getColor = (type: AssetTimelineEventType) => {
        switch (type) {
            case AssetTimelineEventType.CREATED:
                return 'bg-emerald-500';
            case AssetTimelineEventType.ASSIGNED:
                return 'bg-indigo-500';
            case AssetTimelineEventType.RETURNED:
                return 'bg-amber-500';
            case AssetTimelineEventType.MAINTENANCE:
                return 'bg-rose-500';
            case AssetTimelineEventType.RETIRED:
                return 'bg-slate-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Asset History - ${asset?.assetName || 'Asset'}`}
            size="md"
        >
            <div className="p-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <PageLoader />
                    </div>
                ) : error ? (
                    <div className="text-center text-rose-500 py-4">
                        {error}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        No history available for this asset.
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                        {events.map((event, index) => (
                            <div key={event.id || index} className="relative pl-8">
                                {/* Icon Bubble */}
                                <div className={`absolute -left-[11px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 ${getColor(event.type)}`}>
                                    {getIcon(event.type)}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {event.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(event.date).toLocaleDateString()}
                                            <span className="ml-1 text-[10px] opacity-70">
                                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                        {event.title}
                                    </h3>

                                    {event.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 mt-1">
                                            {event.description}
                                        </p>
                                    )}

                                    {event.metadata && (
                                        <div className="flex gap-2 mt-1">
                                            {event.metadata.condition && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    Condition: {event.metadata.condition}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
