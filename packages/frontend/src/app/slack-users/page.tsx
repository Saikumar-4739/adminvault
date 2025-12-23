'use client';

import { useState, useEffect } from 'react';
import { slackUsersService } from '@/lib/api/services';
import { SlackUserModel, CreateSlackUserModel, UpdateSlackUserModel } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Search, Plus, MessageSquare, Pencil, Trash2, User, Users, UserCheck, UserX } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

export default function SlackUsersPage() {
    const [users, setUsers] = useState<SlackUserModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SlackUserModel | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        slackUserId: '',
        displayName: '',
        role: '',
        department: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await slackUsersService.getAllSlackUsers();
            if (response.status) {
                setUsers(response.slackUsers);
            }
        } catch (error) {
            console.error('Failed to fetch Slack users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            slackUserId: '',
            displayName: '',
            role: '',
            department: '',
            phone: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (user: SlackUserModel) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            slackUserId: user.slackUserId || '',
            displayName: user.displayName || '',
            role: user.role || '',
            department: user.department || '',
            phone: user.phone || '',
            notes: user.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const userId = 1;
            const companyId = 1;

            if (editingUser) {
                const updateModel: UpdateSlackUserModel = {
                    id: editingUser.id,
                    ...formData,
                    userId
                };
                await slackUsersService.updateSlackUser(updateModel);
            } else {
                const createModel: CreateSlackUserModel = {
                    ...formData,
                    userId,
                    companyId
                };
                await slackUsersService.createSlackUser(createModel);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to save Slack user:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await slackUsersService.deleteSlackUser({ id, userId: 1 });
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                            Slack Users
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Manage Slack workspace users
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={handleCreate}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            Add User
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Users"
                        value={stats.total}
                        icon={Users}
                        gradient="from-purple-500 to-indigo-600"
                        iconBg="bg-purple-50 dark:bg-purple-900/20"
                        iconColor="text-purple-600 dark:text-purple-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Active"
                        value={stats.active}
                        icon={UserCheck}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Inactive"
                        value={stats.inactive}
                        icon={UserX}
                        gradient="from-rose-500 to-red-600"
                        iconBg="bg-rose-50 dark:bg-rose-900/20"
                        iconColor="text-rose-600 dark:text-rose-400"
                        isLoading={isLoading}
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No users found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map((user) => (
                            <Card key={user.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white dark:bg-slate-800">
                                <div className="h-24 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-90 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                                </div>

                                <div className="px-6 pb-6 relative">
                                    <div className="-mt-12 mb-4 flex justify-between items-end">
                                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                                            <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-purple-500 to-indigo-600">
                                                <User className="h-8 w-8" />
                                            </div>
                                        </div>
                                        <span className={`transform -translate-y-1 mb-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                            {user.name}
                                        </h3>
                                        {user.displayName && (
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                                @{user.displayName}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                                            {user.email}
                                        </div>
                                        {user.role && (
                                            <div className="text-xs text-slate-500 dark:text-slate-500">
                                                {user.role} {user.department && `• ${user.department}`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                            <button onClick={() => handleEdit(user)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 hover:text-indigo-600 transition-colors">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-600 hover:text-rose-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit Slack User' : 'Add Slack User'} size="lg">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Full Name" />
                            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="email@company.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Slack User ID" value={formData.slackUserId} onChange={(e) => setFormData({ ...formData, slackUserId: e.target.value })} placeholder="U123456789" />
                            <Input label="Display Name" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} placeholder="@username" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="Developer" />
                            <Input label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Engineering" />
                        </div>
                        <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingUser ? 'Update User' : 'Create User'}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
}
