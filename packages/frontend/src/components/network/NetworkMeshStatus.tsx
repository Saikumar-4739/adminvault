'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocketEvent, useWebSocketStatus, useWebSocketEmit } from '@/hooks/useWebSocket';
import {
    Wifi,
    WifiOff,
    Users,
    Activity,
    Clock,
    Signal,
    Zap,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { WebSocketEvent } from '@adminvault/shared-models';
import { configVariables } from '@adminvault/shared-services';

interface ConnectedUser {
    userId: number;
    username: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
    connectionTime?: Date;
}

export const NetworkMeshStatus: React.FC = () => {
    const { isConnected, connectionStatus, error } = useWebSocketStatus();
    const { emit } = useWebSocketEmit();
    const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
    const [connectionTime, setConnectionTime] = useState<Date | null>(null);
    const [latency, setLatency] = useState<number | null>(null);

    // Track connection time
    useEffect(() => {
        if (isConnected) {
            setConnectionTime(new Date());
        } else {
            setConnectionTime(null);
            setLatency(null);
        }
    }, [isConnected]);

    // Listen for user status updates
    useWebSocketEvent(WebSocketEvent.USER_ONLINE, (data: any) => {
        console.log('[NetworkMesh] User online:', data);
        setConnectedUsers(prev => {
            const existing = prev.find(u => u.userId === data.userId);
            if (existing) {
                return prev.map(u =>
                    u.userId === data.userId
                        ? { ...u, status: 'online', lastSeen: new Date() }
                        : u
                );
            }
            return [...prev, {
                userId: data.userId,
                username: data.username || `User ${data.userId}`,
                status: 'online',
                connectionTime: new Date(),
            }];
        });
    });

    useWebSocketEvent(WebSocketEvent.USER_OFFLINE, (data: any) => {
        console.log('[NetworkMesh] User offline:', data);
        setConnectedUsers(prev =>
            prev.map(u =>
                u.userId === data.userId
                    ? { ...u, status: 'offline', lastSeen: new Date() }
                    : u
            )
        );
    });

    // Listen for pong response to calculate latency
    useWebSocketEvent('pong', (data: any) => {
        if (data.sentAt) {
            const roundTripTime = Date.now() - data.sentAt;
            setLatency(roundTripTime);
            console.log('[NetworkMesh] Latency:', roundTripTime, 'ms');
        }
    });

    // Send ping every 5 seconds to measure latency
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            emit('ping', { sentAt: Date.now() });
        }, 5000);

        return () => clearInterval(interval);
    }, [isConnected, emit]);

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'reconnecting':
                return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            case 'error':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'reconnecting':
                return <Activity className="h-4 w-4 animate-pulse" />;
            case 'error':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <WifiOff className="h-4 w-4" />;
        }
    };

    const formatUptime = () => {
        if (!connectionTime) return '0s';
        const diff = Date.now() - connectionTime.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Network Mesh Status
                    </h3>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="text-sm font-semibold capitalize">
                        {connectionStatus}
                    </span>
                </div>
            </div>

            {/* Connection Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Status */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Signal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Status
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {isConnected ? 'Online' : 'Offline'}
                    </p>
                </div>

                {/* Latency */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Latency
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {latency ? `${latency.toFixed(0)}ms` : 'N/A'}
                    </p>
                </div>

                {/* Uptime */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Uptime
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatUptime()}
                    </p>
                </div>

                {/* Connected Users */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Users Online
                        </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {connectedUsers.filter(u => u.status === 'online').length}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                                Connection Error
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Details */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Connection Details
                </h4>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Protocol:</span>
                        <span className="font-medium text-gray-900 dark:text-white">WebSocket</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Endpoint:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {configVariables.APP_AVS_SERVICE_URL.replace(/\/api$/, '')}/ws
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Transport:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {isConnected ? 'WebSocket' : 'Disconnected'}
                        </span>
                    </div>
                    {connectionTime && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Connected Since:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {connectionTime.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Connected Users List */}
            {connectedUsers.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Active Connections ({connectedUsers.filter(u => u.status === 'online').length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {connectedUsers
                            .filter(u => u.status === 'online')
                            .map(user => (
                                <div
                                    key={user.userId}
                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.username}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {user.connectionTime?.toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};
