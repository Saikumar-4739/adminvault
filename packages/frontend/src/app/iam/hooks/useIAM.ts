import { useState, useCallback, useEffect } from 'react';
import { IAMService, Permission } from '../iam.service';
import { RoleResponseModel, SSOProvider, CreateRoleModel, UpdateRoleModel, CreateSSOProviderModel, UpdateSSOProviderModel } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

export const useIAM = (companyId?: number) => {
    const { success, error: toastError } = useToast();
    const [roles, setRoles] = useState<RoleResponseModel[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [ssoProviders, setSSOProviders] = useState<SSOProvider[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [authorizedMenus, setAuthorizedMenus] = useState<any[]>([]);
    const [allMenusTree, setAllMenusTree] = useState<any[]>([]);
    const [scopes, setScopes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Using logic to fetch each independently so one failure doesn't block others
            const loadRoles = companyId ? IAMService.getRoles(companyId).catch(err => { console.error('Roles failed', err); return null; }) : Promise.resolve(null);
            const loadPerms = IAMService.getPermissions().catch(err => { console.error('Perms failed', err); return null; });
            const loadSSO = IAMService.getSSOProviders().catch(err => { console.error('SSO failed', err); return null; });
            const loadUsers = companyId ? IAMService.getUsers(companyId).catch(err => { console.error('Users failed', err); return null; }) : Promise.resolve(null);
            const loadMenus = IAMService.getAuthorizedMenus().catch(err => { console.error('Menus failed', err); return null; });
            const loadAllMenusTree = IAMService.getAllMenusTree().catch(err => { console.error('Full Tree failed', err); return null; });
            const loadScopes = IAMService.getScopes().catch(err => { console.error('Scopes failed', err); return null; });
            const loadAllEmployees = companyId ? IAMService.getAllEmployees(companyId).catch(err => { console.error('Employees load failed', err); return null; }) : Promise.resolve(null);

            const [rolesData, permsData, ssoData, usersData, menusData, allMenusTreeData, scopesData, employeesData] = await Promise.all([
                loadRoles, loadPerms, loadSSO, loadUsers, loadMenus, loadAllMenusTree, loadScopes, loadAllEmployees
            ]);

            if (rolesData) {
                if ((rolesData as any).status && Array.isArray((rolesData as any).data)) {
                    setRoles((rolesData as any).data);
                } else if (Array.isArray(rolesData)) {
                    setRoles(rolesData as any);
                }
            }
            if (permsData && (permsData as any).status) {
                setPermissions((permsData as any).data);
            }
            if (ssoData) {
                if ((ssoData as any).status && Array.isArray((ssoData as any).data)) {
                    setSSOProviders((ssoData as any).data);
                } else if (Array.isArray(ssoData)) {
                    setSSOProviders(ssoData as any);
                }
            }
            if (usersData && (usersData as any).status) {
                setUsers((usersData as any).data);
            }
            if (menusData && (menusData as any).status) {
                setAuthorizedMenus((menusData as any).data);
            }
            if (allMenusTreeData && (allMenusTreeData as any).status) {
                setAllMenusTree((allMenusTreeData as any).data);
            }
            if (scopesData && (scopesData as any).status) {
                setScopes((scopesData as any).data);
            }
            if (employeesData && (employeesData as any).status) {
                setAllEmployees((employeesData as any).employees || (employeesData as any).data || []);
            }

        } catch (error) {
            console.error(error);
            toastError("Error", "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createRole = async (data: CreateRoleModel) => {
        try {
            const res = await IAMService.createRole(data);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const updateRole = async (data: UpdateRoleModel) => {
        try {
            const res = await IAMService.updateRole(data);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const deleteRole = async (id: number) => {
        try {
            const res = await IAMService.deleteRole(id);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const createSSOProvider = async (data: CreateSSOProviderModel) => {
        try {
            const res = await IAMService.createSSOProvider(data);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const updateSSOProvider = async (data: UpdateSSOProviderModel) => {
        try {
            const res = await IAMService.updateSSOProvider(data);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const deleteSSOProvider = async (id: number) => {
        try {
            const res = await IAMService.deleteSSOProvider(id);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const assignRoles = async (data: { userId: number, roleIds: number[], companyId: number }) => {
        try {
            const res = await IAMService.assignRoles(data);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    const activateAccount = async (data: { employeeId: number, roles: number[], companyId: number, authType: string, password?: string }) => {
        try {
            const res = await IAMService.activateAccount(data);
            if ((res as any).status) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    // New CRUD methods
    const createMenu = async (data: any) => { try { const res = await IAMService.createMenu(data); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };
    const updateMenu = async (data: any) => { try { const res = await IAMService.updateMenu(data); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };
    const deleteMenu = async (id: number) => { try { const res = await IAMService.deleteMenu(id); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };

    const createScope = async (data: any) => { try { const res = await IAMService.createScope(data); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };
    const updateScope = async (data: any) => { try { const res = await IAMService.updateScope(data); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };
    const deleteScope = async (id: number) => { try { const res = await IAMService.deleteScope(id); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };

    const createPermission = async (data: any) => { try { const res = await IAMService.createPermission(data); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };
    const updatePermission = async (data: any) => { try { const res = await IAMService.updatePermission(data); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };
    const deletePermission = async (id: number) => { try { const res = await IAMService.deletePermission(id); if (res.status) { success('Success', res.message); fetchData(); return true; } } catch (err: any) { toastError('Error', err.message); } return false; };

    return {
        roles,
        permissions,
        ssoProviders,
        users,
        allEmployees,
        authorizedMenus,
        allMenusTree,
        scopes,
        loading,
        createRole,
        updateRole,
        deleteRole,
        createSSOProvider,
        updateSSOProvider,
        deleteSSOProvider,
        assignRoles,
        activateAccount,
        createMenu,
        updateMenu,
        deleteMenu,
        createScope,
        updateScope,
        deleteScope,
        createPermission,
        updatePermission,
        deletePermission,
        refresh: fetchData
    };
};
