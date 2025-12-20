'use client';

import { Bell, Moon, Sun, Shield, Lock, Mail, Palette, Languages, Database } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage your application preferences and configuration
                    </p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Appearance Settings */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Palette className="h-5 w-5 text-indigo-500" />
                                Appearance
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize the look and feel of your application</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-700">
                                            {theme === 'dark' ? (
                                                <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            ) : (
                                                <Sun className="h-5 w-5 text-amber-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Theme Mode</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                                            }`}></div>
                                    </button>
                                </div> */}

                                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                                            <Languages className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Language</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Select your preferred language</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">English (US)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bell className="h-5 w-5 text-indigo-500" />
                                Notifications
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage how you receive notifications</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-700">
                                            <Mail className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Email Notifications</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates via email</p>
                                        </div>
                                    </div>
                                    <div className="relative w-14 h-7 bg-indigo-600 rounded-full cursor-pointer">
                                        <div className="absolute top-1 translate-x-8 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-700">
                                            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Push Notifications</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Receive browser notifications</p>
                                        </div>
                                    </div>
                                    <div className="relative w-14 h-7 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer">
                                        <div className="absolute top-1 translate-x-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Privacy */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-500" />
                                Security & Privacy
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account security settings</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                            <Lock className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Change Password</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
                                        </div>
                                    </div>
                                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">→</span>
                                </button>

                                <button className="w-full text-left px-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                            <Shield className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                                        </div>
                                    </div>
                                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">→</span>
                                </button>

                                <button className="w-full text-left px-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                            <Database className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">Privacy Settings</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Control your data and privacy</p>
                                        </div>
                                    </div>
                                    <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">→</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-400 flex items-center gap-2">
                                Danger Zone
                            </h3>
                            <p className="text-sm text-rose-600 dark:text-rose-400/80 mt-1">Irreversible and destructive actions</p>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30">
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
