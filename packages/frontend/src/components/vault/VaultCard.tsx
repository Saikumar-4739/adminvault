// Optimized VaultCard component extracted for better performance
'use client';

import { memo } from 'react';
import { Globe, User, Copy, Eye, EyeOff, Check, ArrowUpRight } from 'lucide-react';

interface VaultCardProps {
    vault: any;
    employeeName: string | null;
    viewMode: 'grid' | 'list';
    isPasswordVisible: boolean;
    isCopied: boolean;
    onTogglePassword: () => void;
    onCopyUsername: () => void;
    onCopyPassword: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const StrengthRing = memo(({ pwd }: { pwd: string }) => {
    const getStrength = (password: string) => {
        if (!password) return 0;
        if (password.length < 8) return 1;
        if (password.length < 12) return 2;
        return 3;
    };

    const strength = getStrength(pwd);
    const colors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
    const textColors = ['text-slate-400', 'text-rose-500', 'text-amber-500', 'text-emerald-500'];

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <div className={`w-1.5 h-1.5 rounded-full ${colors[strength]}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${textColors[strength]}`}>
                {strength === 1 ? 'Weak' : strength === 2 ? 'Mod' : 'High'}
            </span>
        </div>
    );
});

StrengthRing.displayName = 'StrengthRing';

const VaultCard = memo<VaultCardProps>(({
    vault,
    employeeName,
    viewMode,
    isPasswordVisible,
    isCopied,
    onTogglePassword,
    onCopyUsername,
    onCopyPassword,
    onEdit,
    onDelete
}) => {
    const appInitial = vault.name.charAt(0).toUpperCase();

    return (
        <div
            className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 rounded-[40px] overflow-hidden ${viewMode === 'list' ? 'p-6 flex items-center gap-6' : 'p-8 flex flex-col'}`}
        >
            {/* Employee Badge */}
            <div className="absolute top-4 right-8">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100/50 dark:border-indigo-800/50">
                    <User className="w-3 h-3 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 tracking-wider truncate max-w-[100px]">
                        {employeeName || 'Shared'}
                    </span>
                </div>
            </div>

            {/* Card Header / Icon */}
            <div className={`shrink-0 flex items-center justify-between mb-8 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    {appInitial}
                </div>
                <div className="flex items-center gap-2 pt-8">
                    <StrengthRing pwd={vault.password} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">{vault.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate">{vault.url || 'Internal Application'}</span>
                        </div>
                    </div>
                </div>

                {/* Identity Detail */}
                <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Access Identity</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{vault.username || '—'}</p>
                    </div>
                    <button
                        onClick={onCopyUsername}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                {/* Secret Zone */}
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group/pass shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="font-mono text-sm tracking-[0.2em] text-slate-900 dark:text-slate-200">
                            {isPasswordVisible ? vault.password : '••••••••••••'}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover/pass:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => { e.stopPropagation(); onTogglePassword(); }}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                            >
                                {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={onCopyPassword}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                            >
                                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                    >
                        Maintain
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    >
                        Revoke
                    </button>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
        </div>
    );
});

VaultCard.displayName = 'VaultCard';

export default VaultCard;
