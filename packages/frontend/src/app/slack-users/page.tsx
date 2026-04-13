'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { slackUserService, companyService } from '@/lib/api/services';
import { SlackUserModel, CompanyDropdownModel } from '@adminvault/shared-models';
import { PageHeader } from '@/components/ui/PageHeader';
import {
    Search, RefreshCw, Download,
    Shield, Mail, Building2, Slack, MessageSquare, Clock
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { Spinner } from '@/components/ui/Spinner';
import { formatPhoneNumberWithCountryCode } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const openSlackChat = (slackUserId: string, teamId: string) => {
    if (!slackUserId) return;
    const deepLink = teamId ? `slack://user?team=${teamId}&id=${slackUserId}` : `slack://user?id=${slackUserId}`;
    const webLink = teamId ? `https://app.slack.com/client/${teamId}/${slackUserId}` : `https://slack.com`;
    window.location.href = deepLink;
    setTimeout(() => window.open(webLink, '_blank'), 1500);
};

const SlackUsersPage: React.FC = () => {
    useAuth();
    const [users, setUsers] = useState<SlackUserModel[]>([]);
    const [companies, setCompanies] = useState<CompanyDropdownModel[]>([]);
    const [selectedSyncCompanyId, setSelectedSyncCompanyId] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const resp = await companyService.getAllCompaniesDropdown();
            if (resp.status) setCompanies(resp.data || []);
        } catch (e) { }
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await slackUserService.getAllSlackUsers();
            if (response.status) setUsers((response as any).slackUsers || (response as any).data || []);
        } catch { } finally { setIsLoading(false); }
    };

    const handleImportFromSlack = async () => {
        try {
            setIsImporting(true);
            if (selectedSyncCompanyId === 'all') {
                if (companies.length === 0) {
                    AlertMessages.getErrorMessage('No companies found to sync');
                    return;
                }

                let successCount = 0;
                let failCount = 0;

                // Using for...of for sequential sync to avoid overwhelming rate limits
                for (const comp of companies) {
                    try {
                        const response = await slackUserService.importSlackUsers(comp.id);
                        if (response.status) successCount++;
                        else failCount++;
                    } catch (err) {
                        failCount++;
                    }
                }

                AlertMessages.getSuccessMessage(`Bulk sync complete. Success: ${successCount}, Failed: ${failCount}`);
            } else {
                const response = await slackUserService.importSlackUsers(Number(selectedSyncCompanyId));
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Imported successfully');
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Import failed');
                }
            }
            fetchUsers();
        } catch (e: any) {
            AlertMessages.getErrorMessage(e.message || 'Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-4 lg:p-8 space-y-8 min-h-screen">

                {/* Header */}
                <PageHeader
                    title="Slack Workspace"
                    description="Sync and manage your workspace members"
                    icon={<Slack />}
                    gradient="from-[#4A154B] to-[#7C3085]"
                    actions={[
                        {
                            label: isImporting ? 'Importing...' : 'Import from Slack',
                            onClick: handleImportFromSlack,
                            icon: isImporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />,
                            variant: 'primary',
                            className: "bg-[#4A154B] hover:bg-[#3A103B] border-0"
                        }
                    ]}
                >
                    {/* Bulk Sync Selector */}
                    <div className="flex items-center gap-2 mr-4">
                        <select
                            value={selectedSyncCompanyId}
                            onChange={(e) => setSelectedSyncCompanyId(e.target.value)}
                            className="bg-white/10 border border-white/20 text-white text-[11px] font-bold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer hover:bg-white/20 transition-all uppercase tracking-wide"
                        >
                            <option value="all" className="text-slate-900">All Companies</option>
                            {companies.map(comp => (
                                <option key={comp.id} value={comp.id} className="text-slate-900">{comp.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Stats Pills */}
                    <div className="hidden md:flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] font-medium opacity-70">Total</span> {users.length}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <span className="text-[10px] font-medium opacity-70">Active</span> {users.filter(u => u.isActive).length}
                        </span>
                    </div>
                </PageHeader>

                {/* Slim Toolbar */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchUsers}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all flex items-center justify-center shadow-sm active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Cards */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A154B] to-[#7C3085] flex items-center justify-center mx-auto mb-3">
                            <Slack className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Slack members yet</h3>
                        <p className="text-xs text-slate-500">Click <strong>Import from Slack</strong> to sync your workspace.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-3">
                        {filtered.map(u => {
                            const a = u as any;
                            const initials = u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
                            return (
                                <div
                                    key={u.id}
                                    className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 flex flex-col gap-3 overflow-hidden"
                                >
                                    {/* Profile Section */}
                                    <div className="flex items-start gap-3">
                                        <div className="relative shrink-0">
                                            {a.avatarUrl ? (
                                                <img src={a.avatarUrl} alt={u.name} className="w-10 h-10 rounded-lg object-cover shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                    {initials}
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {a.isAdmin && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                                                    <Shield className="h-2.5 w-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1.5">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                    {u.name}
                                                </h3>
                                            </div>
                                            <div className="text-[10px] font-medium text-violet-500/80 truncate">
                                                @{u.displayName || u.name?.toLowerCase().replace(/\s+/g, '')}
                                            </div>
                                            <div className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                                <Slack className="h-2 w-2" />
                                                {u.slackUserId || 'NO_ID'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact & Role Details */}
                                    <div className="space-y-1.5 py-1">
                                        {u.email && (
                                            <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-1.5 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                                <Mail className="h-3 w-3 text-slate-400" />
                                                <span className="truncate">{u.email}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 gap-1">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 px-0.5">
                                                <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{u.role || 'Member'} {u.department ? ` • ${u.department}` : ''}</span>
                                            </div>
                                            {u.phone && (
                                                <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 px-0.5">
                                                    <RefreshCw className="h-3 w-3 text-slate-400 shrink-0" />
                                                    <span className="truncate">{formatPhoneNumberWithCountryCode(u.phone)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
                                        {u.slackUserId && (
                                            <button
                                                onClick={() => openSlackChat(u.slackUserId!, a.teamId)}
                                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-md text-[10px] font-bold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
                                            >
                                                <MessageSquare className="h-3 w-3" />
                                                Message
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modals */}
            </div>
        </RouteGuard>
    );
};

export default SlackUsersPage;
