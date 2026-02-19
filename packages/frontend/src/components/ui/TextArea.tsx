import React, { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const generatedId = useId();
        const textareaId = id || generatedId;

        return (
            <div className="w-full">
                <div className="relative">
                    <textarea
                        ref={ref}
                        id={textareaId}
                        className={cn(
                            'w-full p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
                            'transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/10',
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
                            'resize-y min-h-[100px]',
                            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10',
                            label && 'pt-6',
                            className
                        )}
                        {...props}
                    />

                    {label && (
                        <label
                            htmlFor={textareaId}
                            className="absolute left-4 top-2 text-xs text-primary-600 font-medium transition-all duration-200 pointer-events-none"
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

TextArea.displayName = 'TextArea';

export { TextArea };
