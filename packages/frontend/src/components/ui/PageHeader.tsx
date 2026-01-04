'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    gradient?: string;
    actions?: React.ReactNode;
}

export default function PageHeader({
    icon: Icon,
    title,
    subtitle,
    gradient = 'from-indigo-500 to-purple-600',
    actions
}: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-br ${gradient} rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
                </div>
            </div>

            {actions && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
