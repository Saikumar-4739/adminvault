'use client';

import React, { useState, useRef } from 'react';
import { Lock, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Button } from '@/components/ui/Button';
import { UserRoleEnum } from '@adminvault/shared-models';
import { CredentialVaultMasterView, CredentialVaultMasterViewHandle } from '../masters/components/credential-vault-master-view';

const CredentialVaultPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const viewRef = useRef<CredentialVaultMasterViewHandle>(null);

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
                    <CredentialVaultMasterView ref={viewRef} searchTerm={searchTerm} />
                </div>
            </div>
        </RouteGuard>
    );
};

export default CredentialVaultPage;
