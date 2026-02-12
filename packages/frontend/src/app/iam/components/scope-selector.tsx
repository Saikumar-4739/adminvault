'use client';

import React from 'react';
import { Globe, Building2, User, Users } from 'lucide-react';

export const SCOPES = [
    { label: 'Global', value: 'global', icon: Globe, color: 'text-indigo-500' },
    { label: 'Company', value: 'company', icon: Building2, color: 'text-emerald-500' },
    { label: 'Team', value: 'team', icon: Users, color: 'text-amber-500' },
    { label: 'Personal', value: 'personal', icon: User, color: 'text-rose-500' }
];

interface ScopeSelectorProps {
    selected?: string[];
    onChange: (scopes: string[]) => void;
}

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({ selected = [], onChange }) => {
    const toggleScope = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(s => s !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {SCOPES.map((scope) => {
                const isSelected = selected.includes(scope.value);
                const Icon = scope.icon;
                return (
                    <button
                        key={scope.value}
                        onClick={() => toggleScope(scope.value)}
                        className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-tight transition-all border ${isSelected
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                : 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                        title={scope.label}
                    >
                        <Icon className={`w-3 h-3 ${isSelected ? scope.color : 'text-slate-400'}`} />
                        {scope.label}
                    </button>
                );
            })}
        </div>
    );
};
