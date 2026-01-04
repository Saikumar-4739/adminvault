'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { iamService } from '@/lib/api/services';

interface Session {
    id: number;
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
    deviceName: string;
    browser: string;
    os: string;
    ipAddress: string;
    location?: string;
    isCurrent: boolean;
    isActive: boolean;
    lastActivity: Date;
    createdAt: Date;
}

export const SessionsPage: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { success, error: toastError } = useToast();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const response = await iamService.getAllSessions();
            if (response.status && response.data) {
                setSessions(response.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to fetch sessions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTerminateSession = async (id: number, isCurrent: boolean) => {
        if (isCurrent) {
            toastError('Error', 'Cannot terminate current session');
            return;
        }

        if (confirm('Terminate this session? The user will be logged out.')) {
            try {
                // TODO: Replace with actual API call
                success('Success', 'Session terminated successfully');
                fetchSessions();
            } catch (error) {
                toastError('Error', 'Failed to terminate session');
            }
        }
    };

    const handleTerminateAllOther = async () => {
        if (confirm('Terminate all other sessions? This will log out all other devices.')) {
            try {
                // TODO: Replace with actual API call
                success('Success', 'All other sessions terminated successfully');
                fetchSessions();
            } catch (error) {
                toastError('Error', 'Failed to terminate sessions');
            }
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'DESKTOP':
                return <Monitor className="h-5 w-5" />;
            case 'MOBILE':
                return <Smartphone className="h-5 w-5" />;
            case 'TABLET':
                return <Tablet className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
        }
    };

    const getDeviceColor = (type: string) => {
        switch (type) {
            case 'DESKTOP':
                return 'from-blue-500 to-indigo-600';
            case 'MOBILE':
                return 'from-emerald-500 to-teal-600';
            case 'TABLET':
                return 'from-purple-500 to-pink-600';
            default:
                return 'from-slate-500 to-slate-600';
        }
    };

    const formatLastActivity = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const activeSessions = sessions.filter(s => s.isActive);
    const inactiveSessions = sessions.filter(s => !s.isActive);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER]}>
            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Active Sessions
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            Manage your active login sessions across devices
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-500">Active Sessions</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">{activeSessions.length}</div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTerminateAllOther}
                            disabled={activeSessions.length <= 1}
                        >
                            Terminate All Others
                        </Button>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        Active Sessions ({activeSessions.length})
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : activeSessions.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                            <Monitor className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No active sessions</h3>
                            <p className="text-sm text-slate-500 mt-1">You are not logged in on any device</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`bg-white dark:bg-slate-800 rounded-xl border-2 p-5 transition-all duration-300 ${session.isCurrent
                                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-indigo-500/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDeviceColor(session.deviceType)} flex items-center justify-center text-white shadow-lg`}>
                                                {getDeviceIcon(session.deviceType)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {session.deviceName}
                                                    {session.isCurrent && (
                                                        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            Current
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">{session.browser} • {session.os}</p>
                                            </div>
                                        </div>
                                        {!session.isCurrent && (
                                            <button
                                                onClick={() => handleTerminateSession(session.id, session.isCurrent)}
                                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                                title="Terminate session"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Globe className="h-4 w-4 shrink-0 opacity-70" />
                                            <span className="font-mono">{session.ipAddress}</span>
                                        </div>
                                        {session.location && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                                                <span>{session.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Clock className="h-4 w-4 shrink-0 opacity-70" />
                                            <span>Last active: {formatLastActivity(session.lastActivity)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-xs text-slate-500">
                                            Session started: {new Date(session.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inactive Sessions */}
                {inactiveSessions.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-slate-400" />
                            Recent Inactive Sessions ({inactiveSessions.length})
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {inactiveSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 opacity-60 hover:opacity-100 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDeviceColor(session.deviceType)} flex items-center justify-center text-white opacity-50`}>
                                                {getDeviceIcon(session.deviceType)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{session.deviceName}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{session.browser} • {session.os}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full dark:bg-slate-700 dark:text-slate-400">
                                            Ended
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 shrink-0 opacity-70" />
                                            <span className="font-mono">{session.ipAddress}</span>
                                        </div>
                                        {session.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                                                <span>{session.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-xs text-slate-500">
                                            Last activity: {formatLastActivity(session.lastActivity)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Security Tip</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                If you see any suspicious sessions or devices you don't recognize, terminate them immediately and change your password.
                                Consider enabling Multi-Factor Authentication for additional security.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
};

export default SessionsPage;
