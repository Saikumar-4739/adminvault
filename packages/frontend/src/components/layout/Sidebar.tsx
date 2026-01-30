'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { Package, Ticket, LayoutDashboard, Database, KeySquare, ChevronLeft, ChevronRight, PieChart, Settings as SettingsIcon, UserCircle, Plus, GitPullRequest, ShoppingCart, Users, Network, ShieldCheck, Cpu, BookOpen, FolderOpen } from 'lucide-react';

const DEFAULT_NAVIGATION = [
    {
        title: 'Command & Control',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Reports', href: '/reports', icon: PieChart },
            { name: 'Configuration', href: '/masters', icon: Database },
        ]
    },
    {
        title: 'Intelligence & Vault',
        items: [
            { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
            { name: 'Document Center', href: '/documents', icon: FolderOpen },
        ]
    },
    {
        title: 'Resource Management',
        items: [
            { name: 'Employees', href: '/employees', icon: Users },
            { name: 'Assets', href: '/assets', icon: Package },
            { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
            { name: 'Licenses', href: '/licenses', icon: KeySquare },
        ]
    },
    {
        title: 'Network & Security',
        items: [
            { name: 'Network Mesh', href: '/network', icon: Network },
            { name: 'Vault Security', href: '/security', icon: ShieldCheck },
            { name: 'Approvals', href: '/approvals', icon: GitPullRequest },
        ]
    },
    {
        title: 'System Support',
        items: [
            { name: 'Support Tickets', href: '/tickets', icon: Ticket },
            { name: 'Raise Ticket', href: '/create-ticket', icon: Plus },
        ]
    },
    {
        title: 'Personal',
        items: [
            { name: 'Profile', href: '/profile', icon: UserCircle },
            { name: 'Settings', href: '/settings', icon: SettingsIcon },
        ]
    }
];

export const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('sidebar_collapsed');
        if (stored) {
            setIsCollapsed(stored === 'true');
        }
    }, []);

    const toggleCollapse = useCallback(() => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', String(newState));
    }, [isCollapsed]);

    if (!user) return null;

    return (
        <aside className={`h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Logo Area */}
            <div className={`h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-900 ${isCollapsed ? 'justify-center px-2' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Cpu className="h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            AdminVault
                        </h1>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
                {DEFAULT_NAVIGATION.map((group) => (
                    <div key={group.title} className="mb-6">
                        {!isCollapsed && (
                            <h3 className="px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                {group.title}
                            </h3>
                        )}
                        <nav className="px-3 space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname?.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                                            } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                        {!isCollapsed && (
                                            <span className="text-sm font-semibold tracking-tight truncate">
                                                {item.name}
                                            </span>
                                        )}
                                        {isActive && !isCollapsed && (
                                            <div className="ml-auto w-1 h-4 bg-blue-600 rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Footer / Toggle */}
            <div className={`p-4 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''}`}>
                <div className={`flex ${isCollapsed ? 'justify-center w-full' : 'justify-between items-center px-1'}`}>
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>

                </div>
            </div>
        </aside>
    );
};
