'use client';

import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const TopBar: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <Input
                    placeholder="Search..."
                    leftIcon={<Search className="h-4 w-4" />}
                    className="h-10"
                />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                </button>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium text-slate-200">Admin User</p>
                            <p className="text-xs text-slate-400">admin@adminvault.com</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 animate-fade-in">
                            <a href="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                                Profile
                            </a>
                            <a href="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                                Settings
                            </a>
                            <hr className="my-2 border-slate-700" />
                            <button className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-700 transition-colors">
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
