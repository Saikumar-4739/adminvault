'use client';

import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building, Shield, Calendar, MapPin, Phone, Briefcase, Edit } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="h-screen flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Manage your personal information and account details
                        </p>
                    </div>
                    <Button variant="primary" leftIcon={<Edit className="h-4 w-4" />}>
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Profile Header Card */}
                    <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-32"></div>
                        <CardContent className="p-6 -mt-16">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-white dark:ring-slate-800">
                                    {user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                            <Shield className="w-4 h-4" />
                                            {user.role || 'Administrator'}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Contact Information */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="pb-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-indigo-500" />
                                    Contact Information
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-700">
                                            <Mail className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-700">
                                            <Phone className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">Not provided</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Details */}
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="pb-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-500" />
                                    Account Details
                                </h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-700">
                                            <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User ID</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">#{user.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="p-2 rounded-lg bg-white dark:bg-slate-700">
                                            <Building className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company ID</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{user.companyId}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Additional Information */}
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-indigo-500" />
                                Professional Information
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</p>
                                    </div>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">Not specified</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Date</p>
                                    </div>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">Not available</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</p>
                                    </div>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">Not specified</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
