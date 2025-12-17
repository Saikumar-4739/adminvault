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
            <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">AdminVault</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Platform</p>
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                {user && (
                    <div className="mb-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.fullName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                    className="w-full"
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
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-gray-900 dark:text-white" />
                ) : (
                    <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
                )}
            </button>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-slide-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
                <SidebarContent />
            </aside>
        </>
    );
}
