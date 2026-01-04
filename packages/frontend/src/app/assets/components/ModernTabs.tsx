'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface TabConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    count?: number;
    gradient: string;
}

interface ModernTabsProps {
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children?: ReactNode;
}

export default function ModernTabs({ tabs, activeTab, onTabChange, children }: ModernTabsProps) {
    return (
        <div className="relative">
            {/* Tab Navigation */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">

                <div className="relative flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`relative flex-1 min-w-[140px] px-6 py-4 text-sm font-semibold transition-all duration-300 ${isActive
                                    ? 'text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {/* Active Tab Gradient Background */}
                                {isActive && (
                                    <>
                                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-90`}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                        {/* Glow Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} blur-xl opacity-50`}></div>
                                    </>
                                )}

                                {/* Tab Content */}
                                <div className="relative flex items-center justify-center gap-2">
                                    <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </div>

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.gradient}`}></div>
                                )}

                                {/* Separator */}
                                {!isActive && index < tabs.length - 1 && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Bottom Border Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
            </div>

            {/* Tab Content */}
            {children && (
                <div className="animate-fadeIn">
                    {children}
                </div>
            )}
        </div>
    );
}
