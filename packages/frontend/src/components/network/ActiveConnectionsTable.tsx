'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, Signal } from 'lucide-react';
import { networkService } from '@/lib/api/services';
import { useWebSocketEvent } from '@/hooks/useWebSocket';
import { ConnectionMetrics, WebSocketEvent, ConnectionEventPayload } from '@adminvault/shared-models';

export const ActiveConnectionsTable: React.FC = () => {
    const [connections, setConnections] = useState<ConnectionMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial connections
    const fetchConnections = async () => {
        try {
            setIsLoading(true);
            const response = await networkService.getActiveConnections();
            if (response.status && response.data) {
                setConnections(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    // Listen for connection events
    useWebSocketEvent(WebSocketEvent.CONNECTION_EVENT, (data: ConnectionEventPayload) => {
        console.log('[ActiveConnectionsTable] Connection event:', data);
        if (data.eventType === 'connected') {
            // Refresh connections when someone connects
            fetchConnections();
        } else if (data.eventType === 'disconnected') {
            // Remove disconnected user
            setConnections(prev => prev.filter(c => c.socketId !== data.socketId));
        }
    });

    const formatDuration = (connectedAt: Date) => {
        const diff = Date.now() - new Date(connectedAt).getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    };

    return (
        <div className="bg-white dark:bg-white/[0.02] rounded-[32px] border border-slate-200 dark:border-white/5 p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            Active Connections
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            {connections.length} user{connections.length !== 1 ? 's' : ''} online
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5">
                            <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                User
                            </th>
                            <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Email
                            </th>
                            <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Status
                            </th>
                            <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Latency
                            </th>
                            <th className="py-3 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Duration
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-400">
                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-medium">Loading connections...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : connections.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm font-medium">
                                    No active connections
                                </td>
                            </tr>
                        ) : (
                            connections.map((connection) => (
                                <tr
                                    key={connection.socketId}
                                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                {connection.username[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {connection.username}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                                        {connection.email}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                                {connection.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Signal className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                                {connection.latency}ms
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                                {formatDuration(connection.connectedAt)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
