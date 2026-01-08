'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, Plus, Edit, Trash2, Shield, Users, Key, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
    id: number;
    name: string;
    code: string;
    description: string;
    resource: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE';
    isActive: boolean;
}

interface Role {
    id: number;
    name: string;
    code: string;
    description: string;
    isSystemRole: boolean;
    isActive: boolean;
    permissions?: Permission[];
}

interface IAMMasterViewProps {
    onBack: () => void;
}

type TabType = 'roles' | 'permissions';

export default function IAMMasterView({ onBack }: IAMMasterViewProps) {
    const { success, error: toastError } = useToast();
    const { user } = useAuth();
    const companyId = user?.companyId;

    const [activeTab, setActiveTab] = useState<TabType>('roles');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Roles state
    const [roles, setRoles] = useState<Role[]>([]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        code: '',
        description: '',
        permissionIds: [] as number[]
    });

    // Permissions state
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [permissionFormData, setPermissionFormData] = useState({
        name: '',
        code: '',
        description: '',
        resource: '',
        action: 'READ' as 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE'
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'roles') {
                await fetchRoles();
            } else {
                await fetchPermissions();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await apiClient.post('/administration/iam/roles/findAll', { companyId });
            if (response.data.success) {
                setRoles(response.data.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to load roles');
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await apiClient.post('/administration/iam/permissions/findAll');
            if (response.data.success) {
                setPermissions(response.data.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to load permissions');
        }
    };

    // Role handlers
    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...roleFormData,
                companyId: companyId || 0,
                isActive: true,
                isSystemRole: false
            };

            if (editingRole) {
                const response = await apiClient.post('/administration/iam/roles/update', {
                    id: editingRole.id,
                    ...data
                });
                if (response.data.success) {
                    success('Success', 'Role updated successfully');
                    fetchRoles();
                    handleCloseRoleModal();
                }
            } else {
                const response = await apiClient.post('/administration/iam/roles/create', data);
                if (response.data.success) {
                    success('Success', 'Role created successfully');
                    fetchRoles();
                    handleCloseRoleModal();
                }
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to save role');
        }
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleFormData({
            name: role.name,
            code: role.code,
            description: role.description,
            permissionIds: role.permissions?.map(p => p.id) || []
        });
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = async (role: Role) => {
        if (!confirm(`Are you sure you want to delete "${role.name}"?`)) return;

        try {
            const response = await apiClient.post('/administration/iam/roles/delete', {
                id: role.id
            });
            if (response.data.success) {
                success('Success', 'Role deleted successfully');
                fetchRoles();
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to delete role');
        }
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
        setEditingRole(null);
        setRoleFormData({
            name: '',
            code: '',
            description: '',
            permissionIds: []
        });
    };

    // Permission handlers
    const handlePermissionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPermission) {
                const response = await apiClient.post('/administration/iam/permissions/update', {
                    id: editingPermission.id,
                    ...permissionFormData
                });
                if (response.data.success) {
                    success('Success', 'Permission updated successfully');
                    fetchPermissions();
                    handleClosePermissionModal();
                }
            } else {
                const response = await apiClient.post('/administration/iam/permissions/create', permissionFormData);
                if (response.data.success) {
                    success('Success', 'Permission created successfully');
                    fetchPermissions();
                    handleClosePermissionModal();
                }
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to save permission');
        }
    };

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission);
        setPermissionFormData({
            name: permission.name,
            code: permission.code,
            description: permission.description,
            resource: permission.resource,
            action: permission.action
        });
        setIsPermissionModalOpen(true);
    };

    const handleDeletePermission = async (permission: Permission) => {
        if (!confirm(`Are you sure you want to delete "${permission.name}"?`)) return;

        try {
            const response = await apiClient.post('/administration/iam/permissions/delete', {
                id: permission.id
            });
            if (response.data.success) {
                success('Success', 'Permission deleted successfully');
                fetchPermissions();
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to delete permission');
        }
    };

    const handleClosePermissionModal = () => {
        setIsPermissionModalOpen(false);
        setEditingPermission(null);
        setPermissionFormData({
            name: '',
            code: '',
            description: '',
            resource: '',
            action: 'READ'
        });
    };

    const getActionBadgeColor = (action: string) => {
        const colors: Record<string, string> = {
            'CREATE': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'READ': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
            'UPDATE': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            'DELETE': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            'EXECUTE': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        };
        return colors[action] || colors['READ'];
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPermissions = permissions.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.resource.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
            acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        leftIcon={<ArrowLeft className="h-4 w-4" />}
                        className="h-10"
                    >
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">IAM Master</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage roles, permissions, and access controls</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === 'roles'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Roles
                    </div>
                    {activeTab === 'roles' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === 'permissions'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Permissions
                    </div>
                    {activeTab === 'permissions' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => activeTab === 'roles' ? setIsRoleModalOpen(true) : setIsPermissionModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    Add {activeTab === 'roles' ? 'Role' : 'Permission'}
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : activeTab === 'roles' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoles.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">No roles found</p>
                        </div>
                    ) : (
                        filteredRoles.map((role) => (
                            <div
                                key={role.id}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                            {role.name}
                                        </h3>
                                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-2">
                                            {role.code}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {role.description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditRole(role)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        {!role.isSystemRole && (
                                            <button
                                                onClick={() => handleDeleteRole(role)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {role.isSystemRole && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                        System Role
                                    </span>
                                )}
                                {role.permissions && role.permissions.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                                            {role.permissions.length} Permission{role.permissions.length !== 1 ? 's' : ''}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 3).map(p => (
                                                <span key={p.id} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                                    {p.code}
                                                </span>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                                    +{role.permissions.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Key className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">No permissions found</p>
                        </div>
                    ) : (
                        Object.entries(groupedPermissions).map(([resource, perms]) => (
                            <div key={resource} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                        {resource} ({perms.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {perms.map((permission) => (
                                        <div key={permission.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {permission.name}
                                                        </h4>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getActionBadgeColor(permission.action)}`}>
                                                            {permission.action}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        {permission.description}
                                                    </p>
                                                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                                        {permission.code}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditPermission(permission)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePermission(permission)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={handleCloseRoleModal}
                title={editingRole ? 'Edit Role' : 'Add Role'}
                size="lg"
            >
                <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Role Name"
                            value={roleFormData.name}
                            onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                            required
                            placeholder="e.g., Product Manager"
                        />
                        <Input
                            label="Role Code"
                            value={roleFormData.code}
                            onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            required
                            placeholder="e.g., product_manager"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            value={roleFormData.description}
                            onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                            placeholder="Describe this role..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="outline" onClick={handleCloseRoleModal} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {editingRole ? 'Update Role' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Permission Modal */}
            <Modal
                isOpen={isPermissionModalOpen}
                onClose={handleClosePermissionModal}
                title={editingPermission ? 'Edit Permission' : 'Add Permission'}
                size="lg"
            >
                <form onSubmit={handlePermissionSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Permission Name"
                            value={permissionFormData.name}
                            onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
                            required
                            placeholder="e.g., Create Products"
                        />
                        <Input
                            label="Permission Code"
                            value={permissionFormData.code}
                            onChange={(e) => setPermissionFormData({ ...permissionFormData, code: e.target.value.toLowerCase().replace(/\s+/g, '.') })}
                            required
                            placeholder="e.g., product.create"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Resource"
                            value={permissionFormData.resource}
                            onChange={(e) => setPermissionFormData({ ...permissionFormData, resource: e.target.value })}
                            required
                            placeholder="e.g., Product"
                        />
                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Action</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                value={permissionFormData.action}
                                onChange={(e) => setPermissionFormData({ ...permissionFormData, action: e.target.value as any })}
                                required
                            >
                                <option value="CREATE">CREATE</option>
                                <option value="READ">READ</option>
                                <option value="UPDATE">UPDATE</option>
                                <option value="DELETE">DELETE</option>
                                <option value="EXECUTE">EXECUTE</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Description</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            value={permissionFormData.description}
                            onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
                            placeholder="Describe what this permission allows..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="outline" onClick={handleClosePermissionModal} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {editingPermission ? 'Update Permission' : 'Create Permission'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
