'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, X, Loader2, Info } from 'lucide-react';
import { iamService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScopeSelector } from './scope-selector';

interface PermissionSet {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    scopes?: string[];
}

interface UserPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    roleMenus: Record<string, PermissionSet>; // The permissions inherited from role
    allMenus: any[];
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
    isOpen,
    onClose,
    user,
    roleMenus,
    allMenus
}) => {
    const { updateMenus, user: currentUser } = useAuth();
    const [overrides, setOverrides] = useState<Record<string, PermissionSet>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen && user) {
            fetchOverrides();
        }
    }, [isOpen, user]);

    const fetchOverrides = async () => {
        setIsLoading(true);
        try {
            const res = await iamService.getUserMenus(user.id);
            if (res.status) {
                const grouped: Record<string, PermissionSet> = {};
                (res.data as any[]).forEach(o => {
                    grouped[o.menuKey] = o.permissions;
                });
                setOverrides(grouped);
            }
        } catch (error: any) {
            toast.error("Failed to load user overrides");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (menuKey: string, type: keyof PermissionSet) => {
        const current = overrides[menuKey] || roleMenus[menuKey] || { create: false, read: false, update: false, delete: false };
        const updated = { ...current, [type]: !current[type] };

        setOverrides(prev => ({
            ...prev,
            [menuKey]: updated
        }));
    };

    const handleReset = (menuKey: string) => {
        const newOverrides = { ...overrides };
        delete newOverrides[menuKey];
        setOverrides(newOverrides);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const assignments = Object.entries(overrides).map(([menuKey, permissions]) => ({
                menuKey,
                permissions
            }));
            const res = await iamService.updateUserMenus(user.id, assignments);
            if (res.status) {
                toast.success("User permissions updated successfully");

                // If the updated user is the current user, refresh the menus in context
                if (currentUser && currentUser.id === user.id) {
                    const menuRes = await iamService.getMyMenus();
                    if (menuRes.status) {
                        updateMenus(menuRes.data);
                    }
                }
                onClose();
            }
        } catch (error: any) {
            toast.error("Failed to save user permissions");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Permissions Override: ${user?.fullName}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-800">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                        Changes here will override the default permissions for the <span className="font-bold uppercase tracking-tight">{user?.userRole}</span> role for this user only.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Menu</th>
                                <th className="py-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">C</th>
                                <th className="py-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">R</th>
                                <th className="py-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">U</th>
                                <th className="py-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">D</th>
                                <th className="py-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Reset</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMenus.map(menu => {
                                const menuKey = menu.key || menu;
                                const isOverridden = overrides[menuKey] !== undefined;
                                const perms = overrides[menuKey] || roleMenus[menuKey] || { create: false, read: false, update: false, delete: false };

                                return (
                                    <tr key={menuKey} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                        <td className="py-3 pr-4 align-top">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{menu.label || menu}</span>
                                                {isOverridden && <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter italic">Override Active</span>}
                                                {!isOverridden && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Inherited</span>}

                                                {perms.read && (
                                                    <ScopeSelector
                                                        selected={perms.scopes}
                                                        onChange={(scopes) => {
                                                            const current = overrides[menuKey] || roleMenus[menuKey] || { create: false, read: false, update: false, delete: false, scopes: [] };
                                                            setOverrides(prev => ({
                                                                ...prev,
                                                                [menuKey]: { ...current, scopes }
                                                            }));
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        {(['create', 'read', 'update', 'delete'] as const).map(type => (
                                            <td key={type} className="py-3 text-center align-top">
                                                <button
                                                    onClick={() => handleToggle(menuKey, type)}
                                                    className={`w-5 h-5 rounded flex items-center justify-center transition-all mx-auto ${perms[type]
                                                        ? 'bg-emerald-500 text-white shadow-sm'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                                        }`}
                                                >
                                                    {perms[type] ? <Check className="w-3 h-3" strokeWidth={3} /> : <X className="w-3 h-3" />}
                                                </button>
                                            </td>
                                        ))}
                                        <td className="py-3 text-center align-top">
                                            {isOverridden && (
                                                <Button size="xs" variant="outline" onClick={() => handleReset(menuKey)} className="h-5 px-1 text-[8px] uppercase tracking-tighter mx-auto">
                                                    Reset
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} leftIcon={isSaving && <Loader2 className="w-3 h-3 animate-spin" />}>
                        {isSaving ? 'Saving...' : 'Save Overrides'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
