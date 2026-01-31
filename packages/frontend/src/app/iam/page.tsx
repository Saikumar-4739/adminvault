'use client';

import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Users, Key, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function IamPage() {
    const [activeTab, setActiveTab] = useState<'iam' | 'sso'>('iam');

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white space-y-6">
            <PageHeader
                icon={<ShieldCheck />}
                title="IAM & Single Sign-On"
                description="Manage identity access policies and enterprise authentication providers."
            />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                <button
                    onClick={() => setActiveTab('iam')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'iam'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Identity Management
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('sso')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'sso'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        SSO Configuration
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'iam' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Total Users</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">1,248</div>
                                    <div className="text-xs text-emerald-600 font-bold mt-1">+12 this week</div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Active Roles</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">14</div>
                                    <div className="text-xs text-slate-500 font-bold mt-1">Defined policies</div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                            <Key className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Access Keys</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">85</div>
                                    <div className="text-xs text-slate-500 font-bold mt-1">Active tokens</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 border-dashed">
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <ShieldCheck className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">IAM Policies Config</h3>
                                <p className="text-sm text-slate-500 max-w-sm text-center">
                                    Advanced policy editor and role assignment matrix will appear here.
                                </p>
                                <Button className="mt-6" variant="outline">
                                    Configure Roles
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'sso' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        SAML Configuration
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Identity Provider</span>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Active</span>
                                        </div>
                                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                                            https://idp.adminvault.com/sso/saml/metadata
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">Update Metadata</Button>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        OIDC Connect
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-60">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">OpenID Provider</span>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Inactive</span>
                                        </div>
                                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                            Not configured
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="primary">Configure OIDC</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
