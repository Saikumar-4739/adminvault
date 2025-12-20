'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, ChevronDown, LogOut, CalendarClock, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const TopBar: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
            {/* Left section - Date/Welcome */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                    <CalendarClock className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white group"
                    aria-label="Toggle dark mode"
                >
                    <div className="relative w-5 h-5">
                        <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isDarkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
                        <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${isDarkMode ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                    </div>
                </button>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-sm">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="text-left hidden md:block mr-2">
                            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-none">{user?.fullName || 'User'}</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 mt-0.5">{user?.role || 'Admin'}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'email@example.com'}</p>
                            </div>
                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                            <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
