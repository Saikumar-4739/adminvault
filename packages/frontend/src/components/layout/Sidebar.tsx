'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, Package, Ticket, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Assets', href: '/assets', icon: Package },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">AdminVault</h1>
                    <p className="text-xs text-slate-500 font-medium">Enterprise Platform</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm shadow-primary-100'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span>{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-slate-100 p-4">
                {user && (
                    <div className="mb-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {user.fullName}
                                </p>
                                <p className="text-xs text-slate-500 truncate font-medium">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <Button
                    variant="outline"
                    size="md"
                    leftIcon={<LogOut className="h-4 w-4" />}
                    onClick={handleLogout}
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                    Logout
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 text-slate-600"
            >
                {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
            </button>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col animate-slide-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-100 h-screen sticky top-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
                <SidebarContent />
            </aside>
        </>
    );
}
