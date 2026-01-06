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
}

export default function PageHeader({
    title,
    description,
    icon,
    gradient = 'from-indigo-500 to-purple-600',
    actions = []
}: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
                {icon && (
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md [&>svg]:h-5 [&>svg]:w-5`}>
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions.length > 0 && (
                <div className="flex items-center gap-2">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={action.onClick}
                            leftIcon={action.icon}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
