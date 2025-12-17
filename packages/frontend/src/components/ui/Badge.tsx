import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'neutral',
    size = 'md',
    dot = false,
    children,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium transition-all';

    const variants = {
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
        neutral: 'bg-slate-700 text-slate-300 border border-slate-600',
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
        <span
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {dot && (
                <span className={cn('rounded-full animate-pulse', dotSizes[size], {
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
