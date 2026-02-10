'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { iamService } from '@/lib/api/services';

import { Package, Ticket, LayoutDashboard, Database, KeySquare, ChevronLeft, ChevronRight, PieChart, UserCircle, Plus, GitPullRequest, ShoppingCart, Users, Network, Cpu, BookOpen, Mail, FileText } from 'lucide-react';

const DEFAULT_NAVIGATION = [
    {
        title: 'Main',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
            { name: 'Configuration', href: '/masters', icon: Database, key: 'masters' },
            { name: 'Reports', href: '/reports', icon: PieChart, key: 'reports' },
            { name: 'Document Vault', href: '/documents', icon: FileText, key: 'document-hub' },
            { name: 'Emails Info', href: '/emails', icon: Mail, key: 'emails' },
        ]
    },
    {
        title: 'Resources',
        items: [
            { name: 'Employees', href: '/employees', icon: Users, key: 'employees' },
            { name: 'Assets', href: '/assets', icon: Package, key: 'assets' },
            { name: 'Procurement', href: '/procurement', icon: ShoppingCart, key: 'procurement' },
            { name: 'Licenses', href: '/licenses', icon: KeySquare, key: 'licenses' },
        ]
    },
    {
        title: 'Network & Security',
        items: [
            { name: 'Network', href: '/network', icon: Network, key: 'network' },
            { name: 'Approvals', href: '/approvals', icon: GitPullRequest, key: 'approvals' },
        ]
    },
    {
        title: 'Support',
        items: [
            { name: 'Support Tickets', href: '/tickets', icon: Ticket, key: 'tickets' },
            { name: 'Create Ticket', href: '/create-ticket', icon: Plus, key: 'create-ticket' },
        ]
    },
    {
        title: 'Account',
        items: [
            { name: 'Profile', href: '/profile', icon: UserCircle, key: 'profile' },
            { name: 'Help', href: '/knowledge-base', icon: BookOpen, key: 'knowledge-base' },
        ]
    }
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const pathname = usePathname();
    const { user, allowedMenus, updateMenus } = useAuth();

    const [isCollapsed, setIsCollapsed] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        if (onClose) onClose();
    }, [pathname, onClose]);

    useEffect(() => {
        const stored = localStorage.getItem('sidebar_collapsed');
        if (stored) {
            setIsCollapsed(stored === 'true');
        }
    }, []);

    useEffect(() => {
        if (user && (!allowedMenus || allowedMenus.length === 0)) {
            iamService.getMyMenus()
                .then(response => {
                    if (response.status && Array.isArray(response.data)) {
                        updateMenus(response.data);
                    }
                })
                .catch(err => console.error("Failed to fetch menus", err));
        }
    }, [user, allowedMenus, updateMenus]);

    const toggleCollapse = useCallback(() => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar_collapsed', String(newState));
    }, [isCollapsed]);

    if (!user) return null;

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50
            h-screen flex flex-col transition-all duration-300 ease-in-out 
            border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed ? 'lg:w-20' : 'lg:w-72 w-72'}
        `}>
            {/* Logo Area */}
            <div className={`h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-900 ${isCollapsed ? 'justify-center px-2' : ''}`}>
                <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Cpu className="h-5 w-5" />
                    </div>
                    {(!isCollapsed || isOpen) && (
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex-1">
                            AdminVault
                        </h1>
                    )}
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4">
                {DEFAULT_NAVIGATION.map((group) => {
                    // Filter items based on dynamic allowed keys
                    const visibleItems = group.items
                        .map(item => {
                            // Always allow dashboard, otherwise check permissions
                            if (item.key === 'dashboard') {
                                return item;
                            }
                            const dynamicMenu = allowedMenus.find(m => m.key === item.key);
                            if (!dynamicMenu) return null;
                            return {
                                ...item,
                                name: dynamicMenu.label || item.name // Use DB label if available
                            };
                        })
                        .filter((item): item is any => item !== null);

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.title} className="mb-6">
                            {(!isCollapsed || isOpen) && (
                                <h3 className="px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                    {group.title}
                                </h3>
                            )}
                            <nav className="px-3 space-y-0.5">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname?.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                                                } ${isCollapsed && !isOpen ? 'justify-center px-0' : ''}`}
                                            title={isCollapsed && !isOpen ? item.name : ''}
                                        >
                                            <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                            {(!isCollapsed || isOpen) && (
                                                <span className="text-sm font-semibold tracking-tight truncate">
                                                    {item.name}
                                                </span>
                                            )}
                                            {isActive && (!isCollapsed || isOpen) && (
                                                <div className="ml-auto w-1 h-4 bg-blue-600 rounded-full" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Toggle */}
            <div className={`p-4 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-4 ${isCollapsed && !isOpen ? 'items-center' : ''} hidden lg:flex`}>
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
