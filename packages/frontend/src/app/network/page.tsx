'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Globe, Activity, RefreshCcw, TrendingUp, Zap } from 'lucide-react';
import { networkService } from '@/lib/api/services';
import { useWebSocketEvent, useWebSocketStatus } from '@/hooks/useWebSocket';
import { NetworkStatsResponse, WebSocketEvent } from '@adminvault/shared-models';
import { NetworkMeshStatus, ActiveConnectionsTable } from '@/components/network';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NetworkPage() {
    const { isConnected } = useWebSocketStatus();
    const [stats, setStats] = useState<NetworkStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial stats
    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const response = await networkService.getNetworkStats();
            if (response.status && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch network stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Listen for real-time network stats updates
    useWebSocketEvent(WebSocketEvent.NETWORK_STATS_UPDATE, (data: NetworkStatsResponse) => {
        console.log('[NetworkPage] Stats update received:', data);
        setStats(data);
    });

    const statCards = [
        {
            label: 'Active Nodes',
            value: stats?.activeNodes || 0,
            change: isConnected ? 'Online' : 'Offline',
            icon: Globe,
            color: 'emerald',
        },
        {
            label: 'Connected Users',
            value: stats?.connectedUsers || 0,
            change: '+Real-time',
            icon: Activity,
            color: 'blue',
        },
        {
            label: 'Avg Latency',
            value: `${stats?.averageLatency || 0}ms`,
            change: stats?.averageLatency && stats.averageLatency < 50 ? 'Excellent' : 'Normal',
            icon: Zap,
            color: 'amber',
        },
        {
            label: 'Throughput',
            value: `${stats?.throughput?.toFixed(1) || 0} GB/s`,
            change: '+Live',
            icon: TrendingUp,
            color: 'indigo',
        },
    ];

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white space-y-6">
            {/* Header */}
            <PageHeader
                icon={<Network />}
                title="Network Monitoring"
                description="Real-time visualization and management of the AdminVault global substrate connectivity and node health."
                actions={[
                    {
                        label: `${stats?.status || 'Loading...'}`.toUpperCase(),
                        variant: 'outline' as const,
                        onClick: () => { }
                    },
                    {
                        label: 'Refresh',
                        variant: 'outline' as const,
                        icon: <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />,
                        onClick: fetchStats
                    }
                ]}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-lg transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-1">
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Network Mesh Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <NetworkMeshStatus />
            </motion.div>

            {/* Active Connections Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <ActiveConnectionsTable />
            </motion.div>
        </div>
    );
}
