'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-ring btn-ripple disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 dark:shadow-primary-900/20',
            secondary: 'bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-700/50 hover:bg-primary-50 dark:hover:bg-slate-700/50 shadow-sm',
            outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
            ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
            danger: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-md shadow-rose-500/25 dark:shadow-rose-900/20',
            success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-500/25 dark:shadow-emerald-900/20',
        };

        const sizes = {
            xs: 'h-6 px-2 text-[10px]',
            sm: 'h-8 px-3 text-xs',
            md: 'h-9 px-4 text-sm',
            lg: 'h-10 px-6 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : leftIcon ? (
                    <span className="flex items-center">{leftIcon}</span>
                ) : null}
                {children}
                {rightIcon && !isLoading && (
                    <span className="flex items-center">{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
