'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Save, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { iamService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { ScopeSelector } from './components/scope-selector';
import { RolesMasterTab } from './components/roles-master-tab';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

interface PermissionSet {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    scopes?: string[];
}


export default function IamPage() {
    const [roles, setRoles] = useState<any[]>([]); // Dynamic roles as objects
    const [menus, setMenus] = useState<any[]>([]);
    const [mappings, setMappings] = useState<Record<string, Record<string, PermissionSet>>>({}); // role -> menuKey -> PermissionSet
    // const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    const fetchData = useCallback(async () => {
        // setIsLoading(true);
        try {
            const [rolesRes, menusRes, mappingsRes] = await Promise.all([
                iamService.getRoles(),
                iamService.getAllMenus(),
                iamService.getAllRoleMenus()
            ]);

            if (rolesRes.status && menusRes.status && mappingsRes.status) {
                setRoles(rolesRes.data || []);
                setMenus(menusRes.data || []);

                // Group mappings by roleKey and menuKey with permissions
                const grouped: Record<string, Record<string, PermissionSet>> = {};
                (rolesRes.data || []).forEach((r: any) => grouped[r.key] = {});

                (mappingsRes.data as any[]).forEach(m => {
                    if (grouped[m.roleKey]) {
                        grouped[m.roleKey][m.menuKey] = m.permissions || { create: false, read: true, update: false, delete: false };
                    }
                });
                setMappings(grouped);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load IAM data");
        } finally {
            // setIsLoading(false);
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
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}>
            <div className="p-4 lg:p-6 min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white space-y-4">
                <PageHeader
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="User Access & Roles"
                    description="Manage user permissions and system access"
                    gradient="from-slate-900 via-indigo-950 to-slate-900"
                />

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <RolesMasterTab roles={roles} onRefresh={fetchData} />

                        <Card className="rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
                            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Access Matrix</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage permissions for each role</p>
                                </div>
                                <Button
                                    onClick={handleSaveAll}
                                    isLoading={isSaving}
                                    size="sm"
                                    leftIcon={<Save className="w-3.5 h-3.5" />}
                                >
                                    Update Permissions
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Sub-view loading is fine locally */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse compact-table">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                                <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 w-48 border-r border-slate-200 dark:border-slate-800">
                                                    Page Name
                                                </th>
                                                {roles.map(role => (
                                                    <th key={role.key} className="p-3 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest text-center min-w-[120px]">
                                                        {role.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const renderRows = (menuItems: any[], depth = 0): React.ReactNode[] => {
                                                    return menuItems.flatMap((menu: any, idx) => {
                                                        const menuKey = menu.key || menu;
                                                        const children = menu.children || [];
                                                        return [
                                                            <tr key={menuKey} className={`group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/20 dark:bg-white/[0.01]'}`}>
                                                                <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-[#020617] group-hover:bg-slate-50/50 dark:group-hover:bg-slate-900 transition-colors z-10 border-r border-slate-200 dark:border-slate-800 uppercase tracking-tight">
                                                                    <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
                                                                        {depth > 0 && <span className="text-slate-400 opacity-50">∟</span>}
                                                                        {menu.label || menu}
                                                                    </div>
                                                                </td>
                                                                {roles.map(role => {
                                                                    const perms = mappings[role.key]?.[menuKey] || { create: false, read: false, update: false, delete: false };
                                                                    return (
                                                                        <td key={role.key} className="p-2">
                                                                            <div className="flex flex-col items-center gap-1.5">
                                                                                <div className="flex items-center justify-center gap-1">
                                                                                    {[
                                                                                        { key: 'read', icon: 'R', color: 'blue' },
                                                                                        { key: 'create', icon: 'C', color: 'emerald' },
                                                                                        { key: 'update', icon: 'U', color: 'amber' },
                                                                                        { key: 'delete', icon: 'D', color: 'rose' }
                                                                                    ].map(p => (
                                                                                        <button
                                                                                            key={p.key}
                                                                                            onClick={() => togglePermission(role.key, menuKey, p.key as keyof PermissionSet)}
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
                                                                                {perms.read && (
                                                                                    <ScopeSelector
                                                                                        selected={perms.scopes}
                                                                                        onChange={(scopes) => {
                                                                                            setMappings(prev => {
                                                                                                const roleMappings = { ...(prev[role.key] || {}) };
                                                                                                roleMappings[menuKey] = {
                                                                                                    ...(roleMappings[menuKey] || { create: false, read: true, update: false, delete: false }),
                                                                                                    scopes
                                                                                                };
                                                                                                return { ...prev, [role.key]: roleMappings };
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>,
                                                            ...renderRows(children, depth + 1)
                                                        ];
                                                    });
                                                };
                                                return renderRows(menus);
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
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
                </div>
            </div>
        </RouteGuard>
    );
}

