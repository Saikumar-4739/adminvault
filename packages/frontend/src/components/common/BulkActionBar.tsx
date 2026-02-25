'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BulkAction {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
}

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    actions: BulkAction[];
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onClear, actions }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700/50 min-w-[300px] md:min-w-[500px]">
                <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                        {selectedCount}
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none">Items Selected</p>
                        <button
                            onClick={onClear}
                            className="text-[10px] text-slate-400 hover:text-white uppercase tracking-widest font-bold mt-1 transition-colors"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-1">
                    {actions.map((action, idx) => (
                        <Button
                            key={idx}
                            variant={action.variant === 'danger' ? 'outline' : (action.variant || 'ghost')}
                            size="sm"
                            onClick={action.onClick}
                            className={`gap-2 h-9 px-4 border-slate-700 hover:bg-slate-800 text-xs font-bold ${action.variant === 'danger' ? 'hover:bg-rose-500/10 hover:text-rose-400 border-rose-500/20' : 'text-slate-200'
                                }`}
                        >
                            {action.icon}
                            <span className="hidden md:inline">{action.label}</span>
                        </Button>
                    ))}
                </div>

                <button
                    onClick={onClear}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
