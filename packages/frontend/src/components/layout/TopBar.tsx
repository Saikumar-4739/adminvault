'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, LogOut, Moon, Sun, Bell, Search, Globe, Terminal } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getSocket } from '@/lib/socket';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const TopBar: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { stats, isLoading: statsLoading } = useDashboardStats();
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Socket listener for notifications
    useEffect(() => {
        if (!user) return;
        const socket = getSocket();

        // Admin join logic removed as isAdmin is currently unused in this simplified view
        // But we keep user join for personalized notifications
        socket.emit('joinUser', { userId: user.id });

        socket.on('notification', (notif: any) => {
            setNotifications(prev => [notif, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.off('notification');
        };
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowUserMenu(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
            {/* Left: Section Title / Global Context */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:border-blue-500/20">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${stats?.security.score && stats.security.score > 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {statsLoading ? 'Security: ---' : `Security Score: ${stats?.security.score}%`}
                    </span>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                        {statsLoading ? 'Critical: --' : `Critical Issues: ${stats?.systemHealth.openCriticalTickets || 0}`}
                    </span>
                </div>
            </div>

            {/* Right: Tools & Identity */}
            <div className="flex items-center gap-2">
                {/* Search Prompt */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group mr-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                    <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-semibold text-slate-400 tracking-tight">Search...</span>
                    <span className="ml-2 text-[9px] font-black text-slate-300 dark:text-slate-700 bg-white dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">⌘K</span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }}
                        className={`p-2 rounded-lg transition-all ${showNotifications ? 'bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-slate-950" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stream</h3>
                                <button onClick={() => setNotifications([])} className="text-[10px] font-black text-blue-500 hover:text-blue-600">Flush All</button>
                            </div>
                            <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center opacity-30">
                                        <Terminal className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Incoming Streams</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 cursor-pointer">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{notif.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

                {/* Identity */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg transition-all ${showUserMenu ? 'bg-slate-100 dark:bg-slate-900' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                    >
                        <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[12px] font-black shadow-lg shadow-blue-600/10">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{user?.fullName || 'User'}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Terminate Session
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export { TopBar };
