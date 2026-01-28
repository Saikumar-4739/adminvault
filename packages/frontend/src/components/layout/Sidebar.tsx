import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, Package, Ticket, LayoutDashboard, Menu, X, Database, KeySquare, ChevronLeft, ChevronRight, PieChart, Settings as SettingsIcon, UserCircle, Plus, GitPullRequest, ShoppingCart, Users } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_NAVIGATION = [
    {
        title: 'System',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Configuration', href: '/masters', icon: Database },
            { name: 'All Reports', href: '/reports', icon: PieChart },
        ]
    },
    {
        title: 'Operations',
        items: [
            { name: 'Employees', href: '/employees', icon: Users },
            { name: 'Assets Info', href: '/assets', icon: Package },
            { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
            { name: 'Approvals', href: '/approvals', icon: GitPullRequest },
            { name: 'Licenses', href: '/licenses', icon: KeySquare },
        ]
    },
    {
        title: 'Support Portal',
        items: [
            { name: 'Support Tickets', href: '/tickets', icon: Ticket },
            { name: 'Raise Ticket', href: '/create-ticket', icon: Plus },
        ]
    },
    {
        title: 'Account',
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Persist collapsed state
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

    const navigationGroups = DEFAULT_NAVIGATION;

    if (!user) return null; // Don't render sidebar if user is not authenticated

    const SidebarContent = ({ collapsed, setIsMobileMenuOpen }: {
        collapsed: boolean,
        setIsMobileMenuOpen: (val: boolean) => void
    }) => (
        <>
            {/* Logo */}
            <div className={`flex items-center gap-3 px-6 py-6 mb-2 ${collapsed ? 'justify-center px-2' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/10 shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden transition-all duration-300">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">AdminVault</h1>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">Enterprise Platform</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
                {navigationGroups.map((group) => {
                    const items = group.items;
                    if (items.length === 0) return null;

                    return (
                        <div key={group.title} className="space-y-1">
                            {!collapsed && (
                                <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-indigo-500/50 rounded-full" />
                                    {group.title}
                                </h3>
                            )}
                            <nav className="space-y-0.5">
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.href === '/dashboard'
                                        ? pathname === '/dashboard'
                                        : pathname?.startsWith(item.href);

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            prefetch={true}
                                            className={`relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group font-medium text-xs ${isActive
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                } ${collapsed ? 'justify-center px-2' : ''}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-white'}`} />

                                            {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>}

                                            {isActive && !collapsed && <div className="ml-auto w-1 h-1 rounded-full bg-white/50" />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    );
                })}
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
                        <SidebarContent
                            collapsed={false}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex lg:flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/50 h-screen sticky top-0 shadow-xl z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}
            >
                <SidebarContent
                    collapsed={isCollapsed}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                {/* Collapse Toggle Button (Desktop Only) */}
                <div className={`hidden lg:flex p-4 border-t border-slate-100 dark:border-slate-800/50 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
                    <button
                        onClick={toggleCollapse}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                </div>
            </aside>
        </>
    );
}
