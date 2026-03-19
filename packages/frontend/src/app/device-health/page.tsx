'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Monitor,
    Activity,
    ShieldCheck,
    AlertTriangle,
    XCircle,
    Search,
    RefreshCcw,
    Smartphone,
    Laptop,
    Tablet,
    Clock,
    User,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function DeviceHealthPage() {
    const { isDarkMode } = useTheme();
    const [devices, setDevices] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ total: 0, healthy: 0, warning: 0, critical: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Simulated API calls to the endpoints I just created
            const [listRes, statsRes] = await Promise.all([
                fetch('/api/device-health/list', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()).catch(() => ({ success: false })),
                fetch('/api/device-health/stats', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()).catch(() => ({ success: false }))
            ]);

            if (listRes.success) {
                setDevices(listRes.data || []);
            }
            if (statsRes.success) {
                setStats(statsRes.stats);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Healthy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Healthy': return ShieldCheck;
            case 'Warning': return AlertTriangle;
            case 'Critical': return XCircle;
            default: return Activity;
        }
    };

    const filtered = devices.filter(d => {
        const matchesSearch = d.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.assetTag.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                            <Monitor className="h-6 w-6" />
                        </div>
                        Device Health (MDM)
                    </h1>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Real-time system performance and security monitoring for all managed endpoints.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchData}
                    className={`rounded-xl border h-11 px-5 ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-300' : 'border-slate-200 bg-white'}`}
                >
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Sync MDM
                </Button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Managed', value: stats.total, color: 'blue', icon: Monitor },
                    { label: 'Healthy Devices', value: stats.healthy, color: 'emerald', icon: ShieldCheck },
                    { label: 'Attention Required', value: stats.warning, color: 'amber', icon: AlertTriangle },
                    { label: 'Critical Errors', value: stats.critical, color: 'rose', icon: XCircle }
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-xl bg-${stat.color}-500/10`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                        <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Resource Distribution */}
                <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Resource Distribution</h2>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase text-blue-500">CPU</div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase text-indigo-500">RAM</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {filtered.slice(0, 3).map((device) => (
                            <div key={device.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{device.deviceName}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">({device.assetTag})</span>
                                    </div>
                                    <span className={`text-[10px] font-bold ${device.cpuUsage > 80 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {device.cpuUsage > 80 ? <ArrowUpRight className="h-3 w-3 inline mr-1 transition-transform" /> : <ArrowDownRight className="h-3 w-3 inline mr-1" />}
                                        {device.cpuUsage}% CPU
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <div className={`h-full transition-all duration-1000 ${device.cpuUsage > 80 ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${device.cpuUsage}%` }}></div>
                                    </div>
                                    <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <div className={`h-full transition-all duration-1000 ${device.ramUsage > 80 ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${device.ramUsage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Filter Component */}
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="space-y-4">
                        <h2 className={`font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quick Filter</h2>
                        <div className="space-y-2">
                            {['all', 'Healthy', 'Warning', 'Critical'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold text-sm ${filterStatus === status
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                                        : isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white' : 'bg-white text-slate-600 hover:bg-white shadow-sm'}`}
                                >
                                    <span className="capitalize">{status === 'all' ? 'All Devices' : status}</span>
                                    {status !== 'all' && <div className={`w-2 h-2 rounded-full ${status === 'Healthy' ? 'bg-emerald-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="relative group">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-slate-600 group-focus-within:text-blue-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none transition-all ${isDarkMode
                                    ? 'bg-slate-800/50 border border-slate-700 text-white focus:border-blue-500'
                                    : 'bg-white border border-slate-200'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${isDarkMode ? 'bg-slate-800/30 text-slate-500' : 'bg-slate-50/50 text-slate-400'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Device Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Health Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">OS / Platform</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Performance</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Last User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filtered.map((device) => {
                                const StatusIcon = getStatusIcon(device.status);
                                return (
                                    <tr key={device.id} className="group hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                    {device.type === 'Laptop' ? <Laptop className="h-5 w-5" /> : device.type === 'Mobile' ? <Smartphone className="h-5 w-5" /> : <Tablet className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900 group-hover:text-blue-500'} transition-colors`}>{device.deviceName}</p>
                                                    <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{device.assetTag}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight ${getStatusColor(device.status)}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {device.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{device.operatingSystem}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    Sync: {new Date(device.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase">CPU</p>
                                                    <span className={`text-xs font-mono font-bold ${device.cpuUsage > 80 ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{device.cpuUsage}%</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase">RAM</p>
                                                    <span className={`text-xs font-mono font-bold ${device.ramUsage > 80 ? 'text-rose-500' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{device.ramUsage}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                    <User className="h-3 w-3 text-slate-500" />
                                                </div>
                                                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{device.lastUser || 'System'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
