'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal information and account details.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-slate-50 dark:ring-slate-700">
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mt-2 border border-indigo-100 dark:border-indigo-800">
                                <Shield className="w-3 h-3" />
                                {user.role || 'Administrator'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-700 pt-8">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" />
                                Email Address
                            </label>
                            <p className="text-base font-medium text-slate-700 dark:text-slate-200">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Building className="w-3.5 h-3.5" />
                                Company ID
                            </label>
                            <p className="text-base font-medium text-slate-700 dark:text-slate-200">{user.companyId}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3.5 h-3.5" />
                                User ID
                            </label>
                            <p className="text-base font-medium text-slate-700 dark:text-slate-200">#{user.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
