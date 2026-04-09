import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface MultiSelectProps {
    label?: string;
    options: { value: string; label: string }[];
    value: string[];
    onChange: (value: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue: string) => {
        const nextValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(nextValue);
    };

    const selectedLabels = options
        .filter(opt => value.includes(opt.value))
        .map(opt => opt.label);

    return (
        <div className="w-full" ref={containerRef}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full h-14 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-between transition-all outline-none",
                        isOpen ? "border-primary-500 ring-4 ring-primary-500/10 dark:ring-primary-400/10" : "hover:border-slate-300 dark:hover:border-slate-700",
                        label && "pt-6"
                    )}
                >
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                        {value.length === 0 ? (
                            <span className="text-slate-400 text-sm font-medium"></span>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-lg text-xs font-black">
                                    {value.length}
                                </span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                                    {selectedLabels.join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                </button>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                </div>

                {label && (
                    <label
                        className={cn(
                            'absolute left-4 transition-all duration-200 pointer-events-none',
                            'top-2 text-xs text-primary-600 font-medium'
                        )}
                    >
                        {label}
                    </label>
                )}

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {options.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleOption(option.value)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                                            isSelected
                                                ? "bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300"
                                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        )}
                                    >
                                        <span className="text-xs font-bold">{option.label}</span>
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
