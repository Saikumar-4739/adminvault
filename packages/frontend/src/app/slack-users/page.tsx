'use client';

import { useState, useEffect } from 'react';
import { slackUserService, departmentService } from '@/lib/api/services';
import { SlackUserModel, UpdateSlackUserModel, Department } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Modal } from '@/components/ui/Modal';
import {
    Search, MessageSquare, Pencil, Trash2, Download,
    RefreshCw, ExternalLink, Clock, Shield, Mail,
    Building2, Slack
} from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, IdRequestModel } from '@adminvault/shared-models';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { formatPhoneNumberWithCountryCode } from '@/lib/utils';

const openSlackChat = (slackUserId: string, teamId: string) => {
    if (!slackUserId) return;
    const deepLink = teamId ? `slack://user?team=${teamId}&id=${slackUserId}` : `slack://user?id=${slackUserId}`;
    const webLink = teamId ? `https://app.slack.com/client/${teamId}/${slackUserId}` : `https://slack.com`;
    window.location.href = deepLink;
    setTimeout(() => window.open(webLink, '_blank'), 1500);
};

const SlackUsersPage: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<SlackUserModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SlackUserModel | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState({
        name: '', email: '', slackUserId: '', displayName: '',
        role: '', department: '', phone: '', notes: ''
    });

    useEffect(() => { fetchUsers(); fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        if (!user?.companyId) return;
        try {
            const deptRes = await departmentService.getAllDepartments();
            if (deptRes.status) setDepartments(deptRes.departments);
        } catch { }
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
            const response = await slackUserService.importSlackUsers();
            if (response.status) { AlertMessages.getSuccessMessage(response.message || 'Imported successfully'); fetchUsers(); }
            else AlertMessages.getErrorMessage(response.message || 'Import failed');
        } catch (e: any) { AlertMessages.getErrorMessage(e.message || 'Import failed'); }
        finally { setIsImporting(false); }
    };

    const handleEdit = (u: SlackUserModel) => {
        setEditingUser(u);
        setFormData({ name: u.name, email: u.email, slackUserId: u.slackUserId || '', displayName: u.displayName || '', role: u.role || '', department: u.department || '', phone: u.phone || '', notes: u.notes || '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!editingUser) return;
        try {
            const m = new UpdateSlackUserModel(editingUser.id, formData.name, formData.email, formData.notes, true, formData.slackUserId, formData.displayName, formData.role, formData.department, formData.phone, formData.notes, user?.companyId || 1);
            const r = await slackUserService.updateSlackUser(m);
            if (r.status) AlertMessages.getSuccessMessage('Updated successfully');
            else AlertMessages.getErrorMessage(r.message);
            setIsModalOpen(false); fetchUsers();
        } catch (e: any) { AlertMessages.getErrorMessage(e.message); }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const r = await slackUserService.deleteSlackUser(new IdRequestModel(userToDelete));
            if (r.status) { AlertMessages.getSuccessMessage('Deleted'); fetchUsers(); }
            else AlertMessages.getErrorMessage(r.message);
        } catch { } finally { setDeleteConfirmOpen(false); setUserToDelete(null); }
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A154B] to-[#7C3085] flex items-center justify-center shadow-md">
                            <Slack className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Slack Workspace</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Sync and manage your workspace members</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-xs w-44" />
                        </div>
                        <button onClick={fetchUsers} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <Button variant="primary" onClick={handleImportFromSlack} disabled={isImporting}
                            leftIcon={isImporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            className="bg-gradient-to-r from-[#4A154B] to-[#7C3085] border-0 text-sm">
                            {isImporting ? 'Importing...' : 'Import from Slack'}
                        </Button>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                        {filtered.map(u => {
                            const a = u as any;
                            const initials = u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
                            return (
                                <div key={u.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all flex flex-col gap-2">

                                    {/* Avatar row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="relative shrink-0">
                                                {a.avatarUrl
                                                    ? <img src={a.avatarUrl} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                                                    : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">{initials}</div>
                                                }
                                                {a.isAdmin && (
                                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center">
                                                        <Shield className="h-2 w-2 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</div>
                                                {u.displayName && <div className="text-[10px] text-violet-500 truncate">@{u.displayName}</div>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            {u.slackUserId && (
                                                <button onClick={() => openSlackChat(u.slackUserId!, a.teamId)} title="Chat in Slack"
                                                    className="p-1 rounded-md bg-gradient-to-br from-[#4A154B] to-[#7C3085] text-white">
                                                    <MessageSquare className="h-2.5 w-2.5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(u)} className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-indigo-600">
                                                <Pencil className="h-2.5 w-2.5" />
                                            </button>
                                            <button onClick={() => { setUserToDelete(u.id); setDeleteConfirmOpen(true); }} className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-600">
                                                <Trash2 className="h-2.5 w-2.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        {u.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{u.email}</span></div>}
                                        {u.phone && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0" /><span className="truncate">{formatPhoneNumberWithCountryCode(u.phone)}</span></div>}
                                        {u.role && <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0" /><span className="truncate">{u.role}{u.department && ` · ${u.department}`}</span></div>}
                                        {a.timezoneLabel && <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" /><span className="truncate">{a.timezoneLabel}</span></div>}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${u.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        {u.slackUserId && (
                                            <button onClick={() => openSlackChat(u.slackUserId!, a.teamId)}
                                                className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                                                <ExternalLink className="h-2.5 w-2.5" />Chat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Edit Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Slack Member" size="lg">
                    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Slack User ID" value={formData.slackUserId} onChange={e => setFormData({ ...formData, slackUserId: e.target.value })} />
                            <Input label="Display Name" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Role / Title" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                                <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm">
                                    <option value="">-- Select --</option>
                                    {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <PhoneInput label="Phone" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} />
                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" type="submit">Update Member</Button>
                        </div>
                    </form>
                </Modal>

                <DeleteConfirmDialog isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onConfirm={confirmDelete} itemName="Slack Member" />
            </div>
        </RouteGuard>
    );
};

export default SlackUsersPage;
