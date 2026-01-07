'use client';

import React from 'react';
import Button from './Button';

interface Action {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'outline' | 'ghost';
}

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    gradient?: string;
    actions?: Action[];
    children?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    icon,
    gradient = 'from-indigo-500 to-purple-600',
    actions = [],
    children
}: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-6">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg [&>svg]:h-5 [&>svg]:w-5`}>
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3 max-w-5xl">
                {children && (
                    <div className="flex-1 hidden md:block">
                        {children}
                    </div>
                )}

                {actions.length > 0 && (
                    <div className="flex items-center gap-2">
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={action.onClick}
                                leftIcon={action.icon}
                                className="font-bold rounded-lg shadow-sm h-8"
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
