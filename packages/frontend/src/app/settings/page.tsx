'use client';

import { Bell, Moon, Shield, Lock, Globe } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your application preferences and configuration.</p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        General
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700 dark:text-slate-200">Appearance</p>
                                    <p className="text-xs text-slate-500">Customize look and feel</p>
                                </div>
                            </div>
                            <span className="text-sm text-slate-400">Light</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</span>
                            <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                                <div className="absolute top-1 left-6 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Push Notifications</span>
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Security
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Change Password</span>
                            <Lock className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
