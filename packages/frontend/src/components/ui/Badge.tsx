import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', size = 'md', dot = false, children, ...props }) => {
    const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium transition-all';

    const variants = {
        primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
        neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const dotSizes = {
        sm: 'h-1.5 w-1.5',
        md: 'h-2 w-2',
        lg: 'h-2.5 w-2.5',
    };

    return (
        <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
            {dot && (
                <span className={cn('rounded-full animate-pulse', dotSizes[size], {
                    'bg-indigo-500': variant === 'primary',
                    'bg-emerald-400': variant === 'success',
                    'bg-amber-400': variant === 'warning',
                    'bg-rose-400': variant === 'error',
                    'bg-blue-400': variant === 'info',
                    'bg-slate-400': variant === 'neutral',
                })} />
            )}
            {children}
        </span>
    );
};

Badge.displayName = 'Badge';

export default Badge;
