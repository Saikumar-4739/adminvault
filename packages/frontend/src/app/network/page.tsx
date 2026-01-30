'use client';

import React from 'react';
import { Network, Globe, Cpu, Zap, Activity } from 'lucide-react';

export default function NetworkPage() {
    return (
        <div className="p-8 lg:p-12 min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            <Network className="w-4 h-4" />
                            <span>Global Network Mesh</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter">Connectivity <span className="text-slate-400">Hub</span></h1>
                        <p className="text-slate-500 max-w-xl font-medium">Real-time visualization and management of the AdminVault global substrate connectivity and node health.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-sm">
                            System Status: Optimized
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Active Nodes', value: '1,284', change: '+12.4%', icon: Globe, color: 'emerald' },
                        { label: 'Neural Load', value: '42.8%', change: '-3.2%', icon: Cpu, color: 'blue' },
                        { label: 'Latency', value: '14ms', change: 'Stable', icon: Zap, color: 'amber' },
                        { label: 'Throughput', value: '852 GB/s', change: '+5.7%', icon: Activity, color: 'indigo' },
                    ].map((stat, i) => (
                        <div key={i} className="p-8 rounded-[32px] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.change}</span>
                            </div>
                            <h3 className="text-3xl font-black tracking-tight mb-1">{stat.value}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Connectivity Map Placeholder */}
                <div className="relative aspect-[21/9] rounded-[40px] bg-slate-200 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto animate-pulse">
                                <Network className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Interactive Mesh Map</h2>
                                <p className="text-slate-500 font-medium">Initializing neural node visualization...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
