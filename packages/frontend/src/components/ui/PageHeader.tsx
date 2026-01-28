'use client';

import React from 'react';
import { Button } from './Button';

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

interface PageHeaderProps {
    children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    icon: Icon,
    gradient = 'from-indigo-500 to-purple-600',
    actions = [],
    children
}: PageHeaderProps) => {
    // Process actions if it's passed as a React node instead of an array (common for custom layouts)
    const customActions = React.isValidElement(actions) ? actions : null;
    const structuredActions = Array.isArray(actions) ? actions : [];

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg [&>svg]:h-5 [&>svg]:w-5 flex items-center justify-center`}>
                        {React.isValidElement(Icon) ? Icon :
                            (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in (Icon as any))) ?
                                React.createElement(Icon as any) :
                                Icon as any}
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3 max-w-5xl">
                {children && (
                    <div className="flex items-center justify-end">
                        {children}
                    </div>
                )}

                {customActions}

                {structuredActions.length > 0 && (
                    <div className="flex items-center gap-2">
                        {structuredActions.map((action, index) => (
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
