'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Package, Ticket, LayoutDashboard, Menu, X, Database, PieChart, Mail, KeySquare, ChevronLeft, ChevronRight, MessageSquare, FileText, Lock } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRoleEnum } from '@adminvault/shared-models';

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    roles?: UserRoleEnum[]; // Empty array or undefined means accessible to all
}

const allNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'Configuration', href: '/masters', icon: Database, roles: [UserRoleEnum.ADMIN] },
    { name: 'Assets', href: '/assets', icon: Package, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'Licenses', href: '/licenses', icon: KeySquare, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'Safe Vault', href: '/password-vault', icon: Lock, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Email Info', href: '/emails', icon: Mail, roles: [UserRoleEnum.ADMIN] },
    { name: 'Slack Users', href: '/slack-users', icon: MessageSquare, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'Documents', href: '/documents', icon: FileText, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'Employees', href: '/employees', icon: Users, roles: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] },
    { name: 'All Reports', href: '/reports', icon: PieChart, roles: [UserRoleEnum.ADMIN] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const permissions = usePermissions();

    // Filter navigation based on user permissions
    const navigation = allNavigation.filter(item => {
        // If no roles specified, accessible to all
        if (!item.roles || item.roles.length === 0) return true;
        // Check if user has required role
        return permissions.hasRole(item.roles);
    });

    const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
        <>
            {/* Logo */}
            <div className={`flex items-center gap-3 px-6 py-6 mb-2 ${collapsed ? 'justify-center px-2' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden transition-all duration-300">
                        <h1 className="text-xl font-bold text-white tracking-tight whitespace-nowrap">AdminVault</h1>
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">Enterprise Platform</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-2 space-y-8">
                <div>
                    {!collapsed && (
                        <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 whitespace-nowrap transition-opacity duration-300">
                            Main Menu
                        </h3>
                    )}
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            // Check exact match for dashboard, startsWith for others to handle sub-routes
                            const isActive = item.href === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname?.startsWith(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        } ${collapsed ? 'justify-center px-2' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />

                                    {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>}

                                    {/* Active Indicator Dot */}
                                    {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm shrink-0" />}

                                    {/* Tooltip for collapsed state */}
                                    {collapsed && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Collapse Toggle Button (Desktop Only) */}
            <div className={`hidden lg:flex p-4 border-t border-slate-800 ${collapsed ? 'justify-center' : 'justify-end'}`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md shadow-lg shadow-slate-900/20 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
                {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </button>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl flex flex-col border-r border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Always expanded on mobile */}
                        <SidebarContent collapsed={false} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex lg:flex-col bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shadow-2xl z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}
            >
                <SidebarContent collapsed={isCollapsed} />
            </aside>
        </>
    );
}
