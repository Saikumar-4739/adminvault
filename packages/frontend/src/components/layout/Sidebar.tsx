'use client';

import { usePathname } from 'next/navigation';
import { Building2, Users, Package, Ticket, LayoutDashboard, Menu, X, Database } from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Masters', href: '/masters', icon: Database },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Assets', href: '/assets', icon: Package },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
                    <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">AdminVault</h1>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Enterprise Platform</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar">
                <div>
                    <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Main Menu
                    </h3>
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            // Check exact match for dashboard, startsWith for others to handle sub-routes
                            const isActive = item.href === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname?.startsWith(item.href);

                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                    <span>{item.name}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                </a>
                            );
                        })}
                    </nav>
                </div>
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
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shadow-2xl z-40">
                <SidebarContent />
            </aside>
        </>
    );
}
