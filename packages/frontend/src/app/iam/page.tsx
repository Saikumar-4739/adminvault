'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Fingerprint, Users, Shield, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { iamService, authService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

interface PermissionSet {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

export default function IamPage() {
    const [activeTab, setActiveTab] = useState<'iam' | 'sso' | 'users'>('users');
    const [roles, setRoles] = useState<string[]>([]);
    const [menus, setMenus] = useState<string[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [mappings, setMappings] = useState<Record<string, Record<string, PermissionSet>>>({}); // role -> menuKey -> PermissionSet
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [rolesRes, menusRes, mappingsRes, usersRes] = await Promise.all([
                iamService.getRoles(),
                iamService.getAllMenus(),
                iamService.getAllRoleMenus(),
                authService.getAllUsers({ companyId: 1 }) // Assuming companyId 1 for now, should be dynamic
            ]);

            if (rolesRes.status && menusRes.status && mappingsRes.status) {
                setRoles(rolesRes.data);
                setMenus(menusRes.data);
                setUsers(usersRes.users || []);

                // Group mappings by role and menuKey with permissions
                const grouped: Record<string, Record<string, PermissionSet>> = {};
                rolesRes.data.forEach((r: string) => grouped[r] = {});

                (mappingsRes.data as any[]).forEach(m => {
                    if (grouped[m.role]) {
                        grouped[m.role][m.menuKey] = m.permissions || { create: false, read: true, update: false, delete: false };
                    }
                });
                setMappings(grouped);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load IAM data");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const togglePermission = (role: string, menuKey: string, permission: keyof PermissionSet) => {
        setMappings(prev => {
            const roleMappings = { ...(prev[role] || {}) };
            const currentPerms = roleMappings[menuKey] || { create: false, read: false, update: false, delete: false };

            roleMappings[menuKey] = {
                ...currentPerms,
                [permission]: !currentPerms[permission]
            };

            // If any permission is true, ensure 'read' is true (unless we are toggling read off)
            if (permission !== 'read' && roleMappings[menuKey][permission]) {
                roleMappings[menuKey].read = true;
            }

            return { ...prev, [role]: roleMappings };
        });
    };


    const handleUpdateUserRole = async (userId: number, role: string) => {
        try {
            const res = await authService.updateUser({ id: userId, role: role as any });
            if (res.status) {
                toast.success("User role updated successfully");
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, userRole: role } : u));
            } else {
                toast.error(res.message || "Failed to update user role");
            }
        } catch (error: any) {
            toast.error(error.message || "Error updating user role");
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await Promise.all(
                Object.entries(mappings).map(([role, menuMap]) => {
                    const assignments = Object.entries(menuMap)
                        .filter(([_, perms]) => perms.read || perms.create || perms.update || perms.delete)
                        .map(([menuKey, permissions]) => ({ menuKey, permissions }));

                    return iamService.updateRoleMenus(role, assignments);
                })
            );
            toast.success("All permissions synchronized successfully");
        } catch (error: any) {
            toast.error("Failed to synchronize some permissions");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-6 min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white space-y-4">
            <PageHeader
                icon={<ShieldCheck />}
                title="IAM & Single Sign-On"
                description="Manage identity access policies and enterprise authentication providers."
            />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'users'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Users & Roles
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('iam')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'iam'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Role Matrix
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
                        SSO
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
                            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">User Directory</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Assign roles to platform users</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse compact-table">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Role</th>
                                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                                    <td className="p-3 text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</td>
                                                    <td className="p-3 text-xs text-slate-500">{user.email}</td>
                                                    <td className="p-3">
                                                        <select
                                                            value={user.userRole}
                                                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500"
                                                        >
                                                            {roles.map(r => (
                                                                <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-3 text-center text-emerald-500">
                                                        <CheckCircle2 className="w-4 h-4 mx-auto opacity-50" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'iam' && (
                    <div className="space-y-4">

                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
                            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Permission Matrix</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CRUD Controller</p>
                                </div>
                                <Button
                                    onClick={handleSaveAll}
                                    isLoading={isSaving}
                                    size="sm"
                                    leftIcon={<Save className="w-3.5 h-3.5" />}
                                >
                                    Sync Matrix
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Decrypting Permission Sets...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse compact-table">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                                    <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 w-48 border-r border-slate-200 dark:border-slate-800">
                                                        Menu Endpoint
                                                    </th>
                                                    {roles.map(role => (
                                                        <th key={role} className="p-3 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center min-w-[120px]">
                                                            {role.replace('_', ' ')}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {menus.map((menuKey, idx) => (
                                                    <tr key={menuKey} className={`group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/20 dark:bg-white/[0.01]'}`}>
                                                        <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-[#020617] group-hover:bg-slate-50/50 dark:group-hover:bg-slate-900 transition-colors z-10 border-r border-slate-200 dark:border-slate-800 uppercase tracking-tight">
                                                            {menuKey}
                                                        </td>
                                                        {roles.map(role => {
                                                            const perms = mappings[role]?.[menuKey] || { create: false, read: false, update: false, delete: false };
                                                            return (
                                                                <td key={role} className="p-2">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        {[
                                                                            { key: 'read', icon: 'R', color: 'blue' },
                                                                            { key: 'create', icon: 'C', color: 'emerald' },
                                                                            { key: 'update', icon: 'U', color: 'amber' },
                                                                            { key: 'delete', icon: 'D', color: 'rose' }
                                                                        ].map(p => (
                                                                            <button
                                                                                key={p.key}
                                                                                onClick={() => togglePermission(role, menuKey, p.key as keyof PermissionSet)}
                                                                                title={`${p.key.toUpperCase()} - ${menuKey}`}
                                                                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${perms[p.key as keyof PermissionSet]
                                                                                    ? `bg-${p.color}-500 text-white shadow-sm`
                                                                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                                    }`}
                                                                            >
                                                                                {p.icon}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                            <CardHeader className="p-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20">
                                <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                                        R: Read | C: Create | U: Update | D: Delete. Changes take effect on next sync.
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {activeTab === 'sso' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="rounded-xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        SAML Configuration
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Identity Provider</span>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded uppercase">Active</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                            https://idp.adminvault.com/sso/saml/metadata
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline" size="sm">Update Metadata</Button>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border-slate-200 dark:border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                        OIDC Connect
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-60">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">OpenID Provider</span>
                                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">Inactive</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                            Not configured
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="primary" size="sm">Configure OIDC</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
