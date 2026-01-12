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
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            // Using logic to fetch each independently so one failure doesn't block others
            const loadRoles = IAMService.getRoles(companyId).catch(err => { console.error('Roles failed', err); return null; });
            const loadPerms = IAMService.getPermissions().catch(err => { console.error('Perms failed', err); return null; });
            const loadSSO = IAMService.getSSOProviders().catch(err => { console.error('SSO failed', err); return null; });
            const loadUsers = IAMService.getUsers(companyId).catch(err => { console.error('Users failed', err); return null; });
            const loadMenus = IAMService.getAuthorizedMenus().catch(err => { console.error('Menus failed', err); return null; });
            const loadAllEmployees = IAMService.getAllEmployees(companyId).catch(err => { console.error('Employees load failed', err); return null; });

            const [rolesData, permsData, ssoData, usersData, menusData, employeesData] = await Promise.all([
                loadRoles, loadPerms, loadSSO, loadUsers, loadMenus, loadAllEmployees
            ]);

            if (rolesData && (rolesData as any).success) {
                setRoles((rolesData as any).data);
            }
            if (permsData && (permsData as any).success) {
                setPermissions((permsData as any).data);
            }
            if (Array.isArray(ssoData)) {
                setSSOProviders(ssoData);
            }
            if (usersData && (usersData as any).success) {
                setUsers((usersData as any).data);
            }
            if (menusData && (menusData as any).success) {
                setAuthorizedMenus((menusData as any).data);
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
            if ((res as any).success) {
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
            if ((res as any).success) {
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
            if ((res as any).success) {
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
            if ((res as any).success) {
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
            if ((res as any).success) {
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
            if ((res as any).success) {
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
            if ((res as any).success) {
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
            if ((res as any).success) {
                success('Success', (res as any).message);
                fetchData();
                return true;
            }
        } catch (error) {
            toastError('Error', (error as any).message || 'An error occurred');
        }
        return false;
    };

    return {
        roles,
        permissions,
        ssoProviders,
        users,
        allEmployees,
        authorizedMenus,
        loading,
        createRole,
        updateRole,
        deleteRole,
        createSSOProvider,
        updateSSOProvider,
        deleteSSOProvider,
        assignRoles,
        activateAccount,
        refresh: fetchData
    };
};
