'use client';

import { useState, useEffect } from 'react';
import { employeeService, mastersService } from '@/lib/api/services';
import { SlackUserModel, CreateSlackUserModel, UpdateSlackUserModel, EmployeeResponseModel, Department } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus, MessageSquare, Pencil, Trash2, User, Users } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { useAuth } from '@/contexts/AuthContext';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';

const SlackUsersPage: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<SlackUserModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SlackUserModel | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState<EmployeeResponseModel[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
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
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        if (!user?.companyId) return;
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const [empRes, deptRes] = await Promise.all([
                employeeService.getAllEmployees(req as any),
                mastersService.getAllDepartments(req)
            ]);

            if (empRes.status) setEmployees(empRes.employees);
            if (deptRes.status) setDepartments(deptRes.departments);
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch initial data');
        }
    };

    const fetchUsers = async () => {
        if (!user?.companyId) return;
        try {
            setIsLoading(true);
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await mastersService.getAllSlackUsers(req);
            if (response.status) {
                setUsers(response.slackUsers || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch Slack users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setSelectedEmployeeId('');
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

    const handleEmployeeSelect = (employeeId: string) => {
        setSelectedEmployeeId(employeeId);
        if (employeeId) {
            const emp = employees.find(e => e.id.toString() === employeeId);
            if (emp) {
                setFormData(prev => ({
                    ...prev,
                    name: `${emp.firstName} ${emp.lastName}`,
                    email: emp.email,
                    phone: emp.phNumber || prev.phone,
                    department: emp.departmentName || prev.department
                }));
            }
        }
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
            const currentUserId = user?.id || 1;
            const currentCompanyId = user?.companyId || 1;

            if (editingUser) {
                const updateModel = new UpdateSlackUserModel(
                    editingUser.id,
                    formData.name,
                    formData.email,
                    formData.notes, // description
                    true, // isActive
                    formData.slackUserId,
                    formData.displayName,
                    formData.role,
                    formData.department,
                    formData.phone,
                    formData.notes, // notes
                    currentCompanyId
                );
                const response = await mastersService.updateSlackUser(updateModel);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Slack user updated successfully');
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const createModel = new CreateSlackUserModel(
                    currentUserId,
                    currentCompanyId,
                    formData.name,
                    formData.email,
                    formData.notes, // description
                    true, // isActive
                    formData.slackUserId,
                    formData.displayName,
                    formData.role,
                    formData.department,
                    formData.phone,
                    formData.notes // notes
                );
                const response = await mastersService.createSlackUser(createModel);
                if (response.status) {
                    AlertMessages.getSuccessMessage('Slack user created successfully');
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to save Slack user');
        }
    };

    const handleDelete = (id: number) => {
        setUserToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const req = new IdRequestModel(userToDelete);
            const response = await mastersService.deleteSlackUser(req);
            if (response.status) {
                AlertMessages.getSuccessMessage('Slack user deleted successfully');
                fetchUsers();
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to delete user');
        } finally {
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );


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

                {/* Table */}
                {isLoading ? (
                    <PageLoader />
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No users found</h3>
                    </div>
                ) : (
                    <Card className="overflow-hidden border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">S.No</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization & Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">
                                                            {user.name}
                                                        </div>
                                                        {user.displayName && (
                                                            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                                @{user.displayName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">{user.email}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {user.role || 'No Role'} {user.department && `â€¢ ${user.department}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800'
                                                    }`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit Slack User' : 'Add Slack User'} size="lg">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                        {!editingUser && (
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <label className="block text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Select Employee (Optional)</label>
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.email})</option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                                >
                                    <option value="">-- Select Department --</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Remarks</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                                placeholder="Enter any additional remarks..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                            <Button variant="primary" type="submit">{editingUser ? 'Update User' : 'Create User'}</Button>
                        </div>
                    </form>
                </Modal>

                <DeleteConfirmDialog
                    isOpen={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    itemName="Slack User"
                />
            </div>
        </RouteGuard>
    );
};




export default SlackUsersPage;
