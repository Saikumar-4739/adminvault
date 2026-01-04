'use client';

import { useState, useEffect, useCallback } from 'react';
import { iamService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import type { IAMUser, SSOProvider, Role } from '@adminvault/shared-services';

export function useIAM(companyId?: number) {
    const [users, setUsers] = useState<IAMUser[]>([]);
    const [ssoProviders, setSSOProviders] = useState<SSOProvider[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await iamService.getAllUsers(companyId);

            if (response.status && response.data) {
                setUsers(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch users');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch users';
            setError(errorMessage);
            toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, toast]);

    // Fetch all SSO providers
    const fetchSSOProviders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await iamService.getAllSSOProviders();

            if (response.status && response.data) {
                setSSOProviders(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch SSO providers');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch SSO providers';
            setError(errorMessage);
            toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Fetch all roles
    const fetchRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await iamService.getAllRoles(companyId);

            if (response.status && response.data) {
                setRoles(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch roles');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch roles';
            setError(errorMessage);
            toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, toast]);

    // Update user
    const updateUser = useCallback(
        async (userId: number, data: Partial<IAMUser>) => {
            try {
                setIsLoading(true);
                const response = await iamService.updateUser(userId, data);

                if (response.status) {
                    await fetchUsers();
                    return { success: true, message: response.message || 'User updated successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to update user' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to update user' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchUsers]
    );

    // Delete user
    const deleteUser = useCallback(
        async (email: string) => {
            try {
                setIsLoading(true);
                const response = await iamService.deleteUser(email);

                if (response.status) {
                    await fetchUsers();
                    return { success: true, message: response.message || 'User deleted successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to delete user' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to delete user' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchUsers]
    );

    // Create SSO provider
    const createSSOProvider = useCallback(
        async (data: Partial<SSOProvider>) => {
            try {
                setIsLoading(true);
                const response = await iamService.createSSOProvider(data);

                if (response.status) {
                    await fetchSSOProviders();
                    return { success: true, message: response.message || 'SSO provider created successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to create SSO provider' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to create SSO provider' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchSSOProviders]
    );

    // Update SSO provider
    const updateSSOProvider = useCallback(
        async (id: number, data: Partial<SSOProvider>) => {
            try {
                setIsLoading(true);
                const response = await iamService.updateSSOProvider(id, data);

                if (response.status) {
                    await fetchSSOProviders();
                    return { success: true, message: response.message || 'SSO provider updated successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to update SSO provider' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to update SSO provider' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchSSOProviders]
    );

    // Delete SSO provider
    const deleteSSOProvider = useCallback(
        async (id: number) => {
            try {
                setIsLoading(true);
                const response = await iamService.deleteSSOProvider(id);

                if (response.status) {
                    await fetchSSOProviders();
                    return { success: true, message: response.message || 'SSO provider deleted successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to delete SSO provider' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to delete SSO provider' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchSSOProviders]
    );

    // Create role
    const createRole = useCallback(
        async (data: Partial<Role>, permissionIds?: number[]) => {
            try {
                setIsLoading(true);
                const response = await iamService.createRole(data, permissionIds);

                if (response.status) {
                    await fetchRoles();
                    return { success: true, message: response.message || 'Role created successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to create role' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to create role' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchRoles]
    );

    // Update role
    const updateRole = useCallback(
        async (id: number, data: Partial<Role>, permissionIds?: number[]) => {
            try {
                setIsLoading(true);
                const response = await iamService.updateRole(id, data, permissionIds);

                if (response.status) {
                    await fetchRoles();
                    return { success: true, message: response.message || 'Role updated successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to update role' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to update role' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchRoles]
    );

    // Delete role
    const deleteRole = useCallback(
        async (id: number) => {
            try {
                setIsLoading(true);
                const response = await iamService.deleteRole(id);

                if (response.status) {
                    await fetchRoles();
                    return { success: true, message: response.message || 'Role deleted successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to delete role' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to delete role' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchRoles]
    );

    useEffect(() => {
        fetchUsers();
        fetchSSOProviders();
        fetchRoles();
    }, [fetchUsers, fetchSSOProviders, fetchRoles]);

    return {
        users,
        ssoProviders,
        roles,
        isLoading,
        error,
        fetchUsers,
        fetchSSOProviders,
        fetchRoles,
        updateUser,
        deleteUser,
        createSSOProvider,
        updateSSOProvider,
        deleteSSOProvider,
        createRole,
        updateRole,
        deleteRole,
    };
}
