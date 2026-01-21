import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, Package, Ticket, LayoutDashboard, Menu, X, Database, Mail, KeySquare, ChevronLeft, ChevronRight, FileText, Lock, PieChart, ShieldAlert, Users, Settings as SettingsIcon, UserCircle, Plus, GitPullRequest, Book, ShoppingCart, Calendar } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum, MenuResponseModel } from '@adminvault/shared-models';
import { iamService } from '@/lib/api/services';

const ICON_MAP: Record<string, any> = {
    'LayoutDashboard': LayoutDashboard,
    'Package': Package,
    'ShoppingCart': ShoppingCart,
    'Calendar': Calendar,
    'GitPullRequest': GitPullRequest,
    'KeySquare': KeySquare,
    'Users': Users,
    'Ticket': Ticket,
    'Book': Book,
    'Plus': Plus,
    'Mail': Mail,
    'FileText': FileText,
    'Lock': Lock,
    'ShieldAlert': ShieldAlert,
    'Database': Database,
    'PieChart': PieChart,
    'UserCircle': UserCircle,
    'SettingsIcon': SettingsIcon,
    'Building2': Building2,
};

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
            { name: 'Asset Inventory', href: '/assets', icon: Package },
            { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
            { name: 'Maintenance', href: '/maintenance', icon: Calendar },
            { name: 'Approvals', href: '/approvals', icon: GitPullRequest },
            { name: 'Licenses', href: '/licenses', icon: KeySquare },
        ]
    },
    {
        title: 'Support Portal',
        items: [
            { name: 'My Tickets', href: '/create-ticket?tab=tickets', icon: Ticket },
            { name: 'Submit Ticket', href: '/create-ticket?tab=create', icon: Plus },
        ]
    },
    {
        title: 'Support & Comms',
        items: [
            { name: 'Support Tickets', href: '/tickets', icon: Ticket },
            { name: 'Knowledge Base', href: '/knowledge-base', icon: Book },
            { name: 'Document Center', href: '/documents', icon: FileText },
        ]
    },
    {
        title: 'Security & Access',
        items: [
            { name: 'IAM & SSO', href: '/iam', icon: ShieldAlert },
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

interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    roles?: UserRoleEnum[]; // This will be ignored as menus are now dynamic
}

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dynamicMenus, setDynamicMenus] = useState<MenuResponseModel[]>([]);
    const [loading, setLoading] = useState(true);

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

    const fetchMenus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await iamService.getUserAuthorizedMenus();
            if (response.status && response.data) {
                setDynamicMenus(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch menus:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchMenus();
        }
    }, [user, fetchMenus]);

    const navigationGroups = useMemo(() => {
        // Validate if there are any actual items to show in the dynamic menus
        const hasValidContent = dynamicMenus?.some(group => group.children && group.children.length > 0);

        // Fallback: Show default menus if no valid dynamic configuration is found
        if (!hasValidContent) {
            return DEFAULT_NAVIGATION;
        }

        // Backend returns a tree structure. We'll treat top-level items as Groups
        // if they have children, or just single items.
        return dynamicMenus.map(group => ({
            title: group.label,
            items: (group.children || []).map(item => ({
                name: item.label,
                href: item.path,
                icon: ICON_MAP[item.icon] || LayoutDashboard, // Default icon if not found
            }))
        }));
    }, [dynamicMenus]);

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

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </>
    );
}

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;

        const toggleVisibility = () => {
            if (mainContent.scrollTop > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        mainContent.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => mainContent.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        const mainContent = document.querySelector('main');
        mainContent?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 z-50 animate-bounce"
            aria-label="Scroll to top"
        >
            <ChevronLeft className="h-6 w-6 transform rotate-90" />
        </button>
    );
}
