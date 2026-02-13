'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Package, LayoutDashboard, ChevronLeft, ChevronRight, Cpu, Settings2,
    BarChart3, Mail, Users, Laptop, ShoppingCart, Key, Network,
    ShieldCheck, Ticket, PlusCircle, UserCircle, BookOpen, CheckSquare,
    Library, Globe, HelpCircle, LayoutGrid
} from 'lucide-react';

const IconMap: Record<string, any> = {
    LayoutDashboard,
    Settings2,
    BarChart3,
    Mail,
    Users,
    Laptop,
    ShoppingCart,
    Key,
    Network,
    ShieldCheck,
    Ticket,
    PlusCircle,
    UserCircle,
    BookOpen,
    CheckSquare,
    Library,
    Globe,
    HelpCircle,
    LayoutGrid,
    Package
};

const getIcon = (name: string) => IconMap[name] || Package;

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const pathname = usePathname();
    const { user, allowedMenus } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    // Close mobile menu on route change
    useEffect(() => {
        if (onClose) onClose();
    }, [pathname, onClose]);

    // Build hierarchy for sidebar categories
    // The backend now sends a nested structure with 'children'
    const menuTree = useMemo(() => {
        return allowedMenus || [];
    }, [allowedMenus]);

    // Expand all groups by default
    useEffect(() => {
        if (menuTree.length > 0 && expandedGroups.length === 0) {
            setExpandedGroups(menuTree.map(m => m.key));
        }
    }, [menuTree]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const renderMenuItem = (item: any, depth = 0) => {
        const children = item.children || [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedGroups.includes(item.key);
        const Icon = getIcon(item.icon);
        const isActive = item.key === 'dashboard' ? pathname === '/dashboard' : pathname?.startsWith(`/${item.key}`);

        return (
            <div key={item.key} className="w-full">
                <div className="px-3 mb-0.5">
                    <div
                        onClick={() => hasChildren ? toggleGroup(item.key) : null}
                        className={`w-full`}
                    >
                        {hasChildren ? (
                            <button
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${isExpanded
                                    ? 'text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isExpanded ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span className="text-sm font-semibold tracking-tight truncate">{item.label}</span>
                                </div>
                                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} text-slate-400`} />
                            </button>
                        ) : (
                            <Link
                                href={`/${item.key === 'dashboard' ? 'dashboard' : item.key}`}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="text-sm font-semibold tracking-tight truncate">{item.label}</span>
                            </Link>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-4 pl-4 border-l border-slate-100 dark:border-slate-800 mt-0.5 space-y-0.5 pr-3">
                        {children.map((child: any) => renderMenuItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (!user) return null;

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50
            h-screen flex flex-col transition-all duration-300 ease-in-out 
            border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            lg:w-72 w-72
        `}>
            <div className={`h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-900`}>
                <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Cpu className="h-5 w-5" />
                    </div>
                    <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex-1">
                        AdminVault
                    </h1>
                    <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4 space-y-1">
                {menuTree.map((item) => renderMenuItem(item))}
            </div>
        </aside>
    );
};
