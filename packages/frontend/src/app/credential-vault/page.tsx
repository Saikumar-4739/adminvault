'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Plus, Search, ShieldCheck, Key, ShieldAlert, LayoutGrid, List } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Button } from '@/components/ui/Button';
import { UserRoleEnum } from '@adminvault/shared-models';
import { CredentialVaultMasterView, CredentialVaultMasterViewHandle } from '../masters/components/credential-vault-master-view';
import { authService } from '@/lib/api/services';
import { AlertMessages } from '@/lib/utils/AlertMessages';

const CredentialVaultPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const viewRef = useRef<CredentialVaultMasterViewHandle>(null);

    useEffect(() => {
        const vaultSession = sessionStorage.getItem('vault_unlocked');
        if (vaultSession === 'true') {
            setIsUnlocked(true);
        }
        checkVaultStatus();
    }, []);

    const checkVaultStatus = async () => {
        try {
            // We'll use a dummy verify with empty password to check if it's set
            const response = await authService.verifyVaultPassword('');
            if (response.code === 2) {
                setIsFirstTime(true);
            }
        } catch (error) {
            // Error might happen if it's not set
        }
    };

    const handleUnlock = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!password) return;

        setIsVerifying(true);
        try {
            const response = await authService.verifyVaultPassword(password);
            if (response.status) {
                unlockVault();
            } else if (response.code === 2) {
                setIsFirstTime(true);
                AlertMessages.getErrorMessage('Vault password not set. Please set it first.');
            } else {
                AlertMessages.getErrorMessage('Invalid vault password');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSetPassword = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!password) return;
        if (password !== confirmPassword) {
            AlertMessages.getErrorMessage('Passwords do not match');
            return;
        }

        setIsVerifying(true);
        try {
            const response = await authService.setVaultPassword(password);
            if (response.status) {
                AlertMessages.getSuccessMessage('Vault password set successfully');
                setIsFirstTime(false);
                unlockVault();
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to set vault password');
        } finally {
            setIsVerifying(false);
        }
    };

    const unlockVault = () => {
        setIsUnlocked(true);
        sessionStorage.setItem('vault_unlocked', 'true');
        AlertMessages.getSuccessMessage('Vault Unlocked');
        setPassword('');
        setConfirmPassword('');
    };

    const handleLock = () => {
        setIsUnlocked(false);
        sessionStorage.removeItem('vault_unlocked');
        AlertMessages.getSuccessMessage('Vault Locked');
    };

    if (!isUnlocked) {
        return (
            <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm animate-in fade-in zoom-in duration-500">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl shadow-blue-500/10 p-6 md:p-8 space-y-6 relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3 transition-transform hover:rotate-0 duration-500">
                                    <Lock className="h-8 w-8 text-white animate-pulse" />
                                </div>

                                <div className="space-y-1">
                                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sentinel Vault</h1>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {isFirstTime ? 'Setup Security Key' : 'Authentication Required'}
                                    </p>
                                </div>

                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-500/20 rounded-xl flex items-center gap-2.5 w-full">
                                    <ShieldAlert className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                    <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 text-left leading-tight">
                                        {isFirstTime ? 'Set a strong vault security key. This is separate from your login password.' : 'Verify your separate vault security key to access secrets.'}
                                    </p>
                                </div>

                                <form onSubmit={isFirstTime ? handleSetPassword : handleUnlock} className="w-full space-y-4">
                                    <div className="relative group">
                                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder={isFirstTime ? "Create Vault Security Key" : "Vault Security Key"}
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {isFirstTime && (
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="Confirm Security Key"
                                                className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            type="submit"
                                            disabled={isVerifying || !password || (isFirstTime && !confirmPassword)}
                                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black uppercase tracking-[0.15em] text-[10px] rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isVerifying ? 'Authenticating...' : isFirstTime ? 'Set and Unlock' : 'Unlock Vault'}
                                        </Button>
                                    </div>
                                </form>

                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    End-to-End Encrypted
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]}>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/50 space-y-4">
                <PageHeader
                    title="Credential Vault"
                    description="Securely manage and protect organizational secrets"
                    icon={<Lock />}
                    gradient="from-blue-600 to-indigo-700"
                    actions={
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-0.5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="List View"
                                >
                                    <List className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <Button
                                onClick={handleLock}
                                variant="outline"
                                className="h-8 px-3 font-black uppercase tracking-widest text-[9px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                                size="sm"
                                leftIcon={<Lock className="h-3 w-3 text-slate-400" />}
                            >
                                Lock Vault
                            </Button>
                            <div className="relative group">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-8 pr-3 py-1.5 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-[11px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-32 md:w-48 placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => viewRef.current?.showAddModal()}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 px-3 font-black uppercase tracking-widest text-[9px] shadow-sm flex items-center gap-2"
                                size="sm"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add New
                            </Button>
                        </div>
                    }
                />

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <CredentialVaultMasterView ref={viewRef} searchTerm={searchTerm} viewMode={viewMode} />
                </div>
            </div>
        </RouteGuard>
    );
};

export default CredentialVaultPage;
