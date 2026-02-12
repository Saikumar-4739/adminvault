'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { iamService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

interface UserRolesMappingViewProps {
    users: any[];
    roles: any[];
    onOverride: (user: any) => void;
    onBack?: () => void;
}

export function UserRolesMappingView({ users, roles, onOverride, onBack }: UserRolesMappingViewProps) {
    const toast = useToast();
    const [userRoles, setUserRoles] = useState<Record<number, string[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadUserRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const mappings: Record<number, string[]> = {};
            await Promise.all(users.map(async (user) => {
                const res = await iamService.getUserRoles(user.id);
                if (res.status) {
                    mappings[user.id] = res.data.map((r: any) => r.roleKey);
                }
            }));
            setUserRoles(mappings);
        } catch (error: any) {
            toast.error("Failed to load user-role mappings");
        } finally {
            setIsLoading(false);
        }
    }, [users, toast]);

    useEffect(() => {
        loadUserRoles();
    }, [loadUserRoles]);

    const handleToggleRole = async (userId: number, roleKey: string) => {
        const currentRoles = userRoles[userId] || [];
        const isAdding = !currentRoles.includes(roleKey);
        const newRoles = isAdding
            ? [...currentRoles, roleKey]
            : currentRoles.filter(r => r !== roleKey);

        try {
            const res = await iamService.updateUserRoles(userId, newRoles);
            if (res.status) {
                setUserRoles(prev => ({ ...prev, [userId]: newRoles }));
                toast.success(isAdding ? `Role ${roleKey} assigned` : `Role ${roleKey} removed`);
            }
        } catch (error: any) {
            toast.error("Failed to update user roles");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-[2rem] border-slate-200 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900/40 backdrop-blur-xl">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Nexus</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Global User to Role Synchronization Matrix</p>
                    </div>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            Return to Registry
                        </button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                            <div className="relative">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Matrix...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Node</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Permission Lattice</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Overrides</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={user.id} className={`border-b border-slate-50 dark:border-white/[0.02] hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.02] transition-colors group/row ${idx % 2 === 0 ? '' : 'bg-slate-50/[0.02]'}`}>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/20">
                                                        {user.fullName?.[0] || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.fullName}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 lowercase tracking-wider">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {roles.map(role => {
                                                        const isActive = (userRoles[user.id] || []).includes(role.key);
                                                        return (
                                                            <button
                                                                key={role.key}
                                                                onClick={() => handleToggleRole(user.id, role.key)}
                                                                className={`
                                                                    px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300
                                                                    ${isActive
                                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-600/20 scale-105'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-white/5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                                    }
                                                                `}
                                                            >
                                                                {role.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => onOverride(user)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md border border-transparent hover:border-indigo-100 dark:hover:border-white/10 transition-all opacity-0 group-hover/row:opacity-100"
                                                        title="Individual Permissions Override"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
