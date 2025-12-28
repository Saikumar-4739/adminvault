'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
}

export default function PageHeader({
    icon: Icon,
    title,
    subtitle,
    actions
}: PageHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {subtitle}
                </p>
            </div>

            {actions && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
