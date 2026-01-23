'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, LogOut, CalendarClock, Moon, Sun, Bell, Ticket, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getSocket } from '@/lib/socket';
import { UserRoleEnum } from '@adminvault/shared-models';
import Link from 'next/link';

const TopBar: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role === UserRoleEnum.ADMIN || user?.role === UserRoleEnum.SUPER_ADMIN;

    // Socket listener for notifications
    useEffect(() => {
        if (!user) return;

        const socket = getSocket();

        // Join appropriate rooms
        if (isAdmin) {
            socket.emit('joinAdmins');
        }

        // Always join personal room for notifications
        socket.emit('joinUser', { userId: user.id });

        // Unified notification listener
        socket.on('notification', (notif: any) => {
            // For admins, we also listen to ticketCreated for list refreshes
            // but we use the 'notification' event for the actual badge/toast
            setNotifications(prev => [notif, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
        });

        // Specific listener for admins to refresh lists
        if (isAdmin) {
            socket.on('ticketCreated', (ticket: any) => {
                // This can be used by pages to refresh, but for TopBar 
                // we mainly care about the notification badge
            });
        }

        return () => {
            socket.off('notification');
            socket.off('ticketCreated');
        };
    }, [user, isAdmin]);

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        // Use window.location.href for logout to clear all memory states/caches
        window.location.href = '/login';
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

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setUnreadCount(0);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white group relative"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden overflow-y-auto max-h-[400px]">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => setNotifications([])}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Bell className="h-8 w-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <Link
                                        key={notif.id}
                                        href={notif.link}
                                        onClick={() => setShowNotifications(false)}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                    >
                                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'ticket' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                                            {notif.type === 'ticket' ? <Ticket className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{notif.title}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                                            <p className="text-[9px] text-slate-400 mt-1 font-bold">{new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>

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
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
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

export { TopBar };
