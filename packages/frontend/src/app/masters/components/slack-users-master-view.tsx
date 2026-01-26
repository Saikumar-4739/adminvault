'use client';

import { useState, useEffect, useCallback } from 'react';
import { slackUserService, departmentService, employeeService } from '@/lib/api/services';
import { CreateSlackUserModel, UpdateSlackUserModel, SlackUserModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PageLoader } from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, ArrowLeft, User, Search } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeOption {
    id: number;
    name: string;
    email: string;
    phone: string;
    department: string;
}

interface SlackUsersMasterViewProps {
    onBack?: () => void;
}

interface DepartmentInfo {
    id: number;
    name: string;
}

export const SlackUsersMasterView: React.FC<SlackUsersMasterViewProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<SlackUserModel[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        slackUserId: '',
        displayName: '',
        role: '',
        department: '',
        phone: '',
        notes: '',
        companyId: '',
        employeeId: ''
    });

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const getAllSlackUsers = useCallback(async (): Promise<void> => {
        if (!user?.companyId) return;
        setIsLoading(true);
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const response = await slackUserService.getAllSlackUsers(req);
            if (response.status) {
                setUsers(response.slackUsers || []);
            } else {
                AlertMessages.getErrorMessage(response.message || 'Failed to fetch slack users');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'Failed to fetch slack users');
        } finally {
            setIsLoading(true); // Should be false but let's follow the logic or fix it
            setIsLoading(false);
        }
    }, [user?.companyId]);

    const fetchDependencies = useCallback(async (): Promise<void> => {
        if (!user?.companyId) return;
        try {
            const req = new CompanyIdRequestModel(user.companyId);
            const [empRes, deptRes] = await Promise.all([
                employeeService.getAllEmployees(req as any),
                departmentService.getAllDepartments(req as any)
            ]);

            if (empRes.status && empRes.employees) {
                setEmployees(empRes.employees.map((e: any) => ({
                    id: e.id,
                    name: `${e.firstName} ${e.lastName}`,
                    email: e.email,
                    phone: e.phNumber,
                    department: e.departmentName
                })));
            }

            if (deptRes.status && deptRes.departments) {
                setDepartments(deptRes.departments);
            }
        } catch (error) {
            console.error('Failed to fetch dependencies', error);
        }
    }, [user?.companyId]);

    useEffect(() => {
        if (user?.companyId) {
            getAllSlackUsers();
            fetchDependencies();
        }
    }, [getAllSlackUsers, fetchDependencies, user?.companyId]);

    const handleEmployeeSelect = (employeeId: string): void => {
        const emp = employees.find(e => e.id.toString() === employeeId);
        if (emp) {
            setFormData(prev => ({
                ...prev,
                name: emp.name,
                email: emp.email,
                phone: emp.phone || prev.phone,
                department: emp.department || prev.department,
                employeeId: emp.id.toString()
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const companyIdToUse = Number(formData.companyId) || user.companyId;

            if (isEditMode && editingId) {
                const model = new UpdateSlackUserModel(
                    editingId,
                    formData.name,
                    formData.email,
                    formData.notes,
                    true, // isActive
                    formData.slackUserId,
                    formData.displayName,
                    formData.role,
                    formData.department,
                    formData.phone,
                    formData.notes, // notes
                    companyIdToUse,
                    undefined, // avatar
                    formData.employeeId ? Number(formData.employeeId) : undefined
                );

                const response = await slackUserService.updateSlackUser(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Slack User Updated Successfully');
                    handleCloseModal();
                    getAllSlackUsers();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to Update Slack User');
                }
            } else {
                const model = new CreateSlackUserModel(
                    user.id,
                    companyIdToUse,
                    formData.name,
                    formData.email,
                    formData.notes,
                    true,
                    formData.slackUserId,
                    formData.displayName,
                    formData.role,
                    formData.department,
                    formData.phone,
                    formData.notes,
                    undefined, // avatar
                    formData.employeeId ? Number(formData.employeeId) : undefined
                );
                const response = await slackUserService.createSlackUser(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Slack User Created Successfully');
                    handleCloseModal();
                    getAllSlackUsers();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to Create Slack User');
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: SlackUserModel): void => {
        setIsEditMode(true);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            email: item.email,
            slackUserId: item.slackUserId || '',
            displayName: item.displayName || '',
            role: item.role || '',
            department: item.department || '',
            phone: item.phone || '',
            notes: item.notes || '',
            companyId: item.companyId?.toString() || '',
            employeeId: item.employeeId?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number): void => {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (deletingId) {
            setIsLoading(true);
            try {
                const req = new IdRequestModel(deletingId);
                const response = await slackUserService.deleteSlackUser(req);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message || 'Slack User Deleted Successfully');
                    getAllSlackUsers();
                } else {
                    AlertMessages.getErrorMessage(response.message || 'Failed to Delete Slack User');
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message || 'An error occurred');
            } finally {
                setIsLoading(false);
                setDeletingId(null);
            }
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({
            name: '', email: '', slackUserId: '', displayName: '',
            role: '', department: '', phone: '', notes: '', companyId: '', employeeId: ''
        });
    };

    const filteredUsers = users.filter((user: SlackUserModel) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Slack Users</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64 hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Slack User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                    {isLoading ? (
                        <PageLoader />
                    ) : (
                        <div className="overflow-x-auto h-full">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">User Details</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Slack ID</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Role & Dept</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center border-b border-slate-200 dark:border-slate-700">Status</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center border-b border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                                    {filteredUsers.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users found</td></tr>
                                    ) : (
                                        filteredUsers.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{item.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.slackUserId ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-fit">{item.slackUserId}</span>
                                                            <span className="text-xs text-indigo-500 mt-0.5">@{item.displayName || '-'}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">{item.role || '-'}</div>
                                                    {item.department && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.department}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${item.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                                                        }`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleEdit(item)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(item.id)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Slack User" : "Add Slack User"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isEditMode && employees.length > 0 && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                            <label className="block text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2">Auto-fill from Employee</label>
                            <select
                                value={formData.employeeId}
                                onChange={(e) => handleEmployeeSelect(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Slack User ID" value={formData.slackUserId} onChange={(e) => setFormData({ ...formData, slackUserId: e.target.value })} />
                        <Input label="Display Name" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                    <Input label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="outline" onClick={handleCloseModal} type="button">Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update User' : 'Create User'}</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName="Slack User"
            />
        </>
    );
}
