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
    const [authorizedMenus, setAuthorizedMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const [rolesData, permsData, ssoData, usersData, menusData] = await Promise.all([
                IAMService.getRoles(companyId),
                IAMService.getPermissions(),
                IAMService.getSSOProviders(),
                IAMService.getUsers(companyId),
                IAMService.getAuthorizedMenus()
            ]);

            if ((rolesData as any).success) {
                setRoles((rolesData as any).data);
            }
            if (permsData && (permsData as any).success) {
                setPermissions((permsData as any).data);
            }
            if (Array.isArray(ssoData)) {
                setSSOProviders(ssoData);
            }
            if ((usersData as any).success) {
                setUsers((usersData as any).data);
            }
            if ((menusData as any).success) {
                setAuthorizedMenus((menusData as any).data);
            }

        } catch (error) {
            console.error(error);
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

    return {
        roles,
        permissions,
        ssoProviders,
        users,
        authorizedMenus,
        loading,
        createRole,
        updateRole,
        deleteRole,
        createSSOProvider,
        updateSSOProvider,
        deleteSSOProvider,
        assignRoles,
        refresh: fetchData
    };
};
