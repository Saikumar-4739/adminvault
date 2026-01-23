import React, { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, id, ...props }, ref) => {
        const generatedId = useId();
        const selectId = id || generatedId;

        return (
            <div className="w-full">
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'w-full h-12 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white appearance-none',
                            'transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/10',
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
                            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10',
                            label && 'pt-6',
                            className
                        )}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="h-5 w-5" />
                    </div>

                    {label && (
                        <label
                            htmlFor={selectId}
                            className={cn(
                                'absolute left-4 transition-all duration-200 pointer-events-none',
                                'top-2 text-xs text-primary-600 font-medium'
                            )}
                        >
                            {label}
                        </label>
                    )}
                </div>

                {error && (
                    <p className="mt-1 text-sm text-rose-400 animate-fade-in">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
