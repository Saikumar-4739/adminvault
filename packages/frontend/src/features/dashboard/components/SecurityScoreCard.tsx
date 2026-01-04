'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Shield, ShieldCheck, ShieldAlert, Info } from 'lucide-react';

interface SecurityScoreCardProps {
    score: number;
    metrics: {
        identity: number;
        devices: number;
        compliance: number;
    };
}

export default function SecurityScoreCard({ score, metrics }: SecurityScoreCardProps) {
    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-emerald-500';
        if (s >= 70) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreIcon = (s: number) => {
        if (s >= 90) return <ShieldCheck className="h-8 w-8 text-emerald-500" />;
        if (s >= 70) return <Shield className="h-8 w-8 text-amber-500" />;
        return <ShieldAlert className="h-8 w-8 text-rose-500" />;
    };

    return (
        <Card className="p-4 border-none shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <ActivityIcon h={5} w={5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Posture</h3>
                        <p className="text-[10px] text-slate-500">Real-time risk assessment</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black ${getScoreColor(score)}`}>{score}/100</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Score</span>
                </div>
            </div>

            <div className="space-y-4">
                <MetricBar label="Identity & Access" value={metrics.identity} icon={<LockIcon />} />
                <MetricBar label="Device Security" value={metrics.devices} icon={<MonitorIcon />} />
                <MetricBar label="Compliance Status" value={metrics.compliance} icon={<FileCheckIcon />} />
            </div>

            <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 flex gap-3">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                    Your security score has improved by <span className="font-bold">4.2%</span> this week due to MFA adoption.
                </p>
            </div>
        </Card>
    );
}

function MetricBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    const getColor = (v: number) => {
        if (v >= 90) return 'bg-emerald-500';
        if (v >= 70) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                    {icon}
                    {label}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor(value)} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

// Minimal icons to avoid too many imports
const ActivityIcon = ({ h, w }: { h: number; w: number }) => <svg className={`h-${h} w-${w} text-indigo-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LockIcon = () => <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const MonitorIcon = () => <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FileCheckIcon = () => <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
