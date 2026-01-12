import { apiClient } from '@/lib/api-client';
import {
    GetAllRolesResponseModel,
    GlobalResponse,
    CreateRoleModel,
    UpdateRoleModel,
    SSOProvider,
    CreateSSOProviderModel,
    UpdateSSOProviderModel,
    GetAllEmployeesModel
} from '@adminvault/shared-models';

export interface Permission {
    id: number;
    name: string;
    code: string;
    resource: string;
    action: string;
    description: string;
}

export const IAMService = {
    // Roles
    getUsers: async (companyId: number) => {
        const response = await apiClient.post<any>('/administration/iam/principals/findAll', { id: companyId });
        return response.data;
    },

    getAllEmployees: async (companyId: number) => {
        const response = await apiClient.post<GetAllEmployeesModel>('/employees/getAllEmployees', { id: companyId });
        return response.data;
    },

    assignRoles: async (data: { userId: number, roleIds: number[], companyId: number }) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/users/assign-roles', data);
        return response.data;
    },

    activateAccount: async (data: { employeeId: number, roles: number[], companyId: number, authType: string, password?: string }) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/users/activate-account', data);
        return response.data;
    },

    getAuthorizedMenus: async () => {
        const response = await apiClient.post<any>('/administration/iam/menus/authorized');
        return response.data;
    },

    getRoles: async (companyId: number) => {
        const response = await apiClient.post<GetAllRolesResponseModel>('/administration/iam/roles/findAll', { id: companyId });
        return response.data;
    },

    createRole: async (data: CreateRoleModel) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/roles/create', data);
        return response.data;
    },

    updateRole: async (data: UpdateRoleModel) => {
        // Missing endpoint in controller, but let's assume one exists or I might need to add it 
        // Wait, I didn't add updateRole to controller! I should check if it exists.
        // It was NOT in administration.controller.ts. I only saw createRole.
        // I need to add updateRole and deleteRole to backend controller too!
        // For now I will mock or ommit. But user wants "Real" screen.
        // I MUST add update/delete endpoints.
        const response = await apiClient.post<GlobalResponse>('/administration/iam/roles/update', data);
        return response.data;
    },

    deleteRole: async (id: number) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/roles/delete', { id });
        return response.data;
    },

    // Permissions
    getPermissions: async () => {
        const response = await apiClient.post<{ success: boolean; data: Permission[] }>('/administration/iam/permissions/findAll');
        return response.data;
    },

    // SSO
    getSSOProviders: async () => {
        const response = await apiClient.post<SSOProvider[]>('/administration/iam/sso/providers');
        return response.data; // The controller returns array directly? 
        // Controller: return await this.iamService.getSSOProviders(req.user.companyId); -> returns Entity[]
    },

    createSSOProvider: async (data: CreateSSOProviderModel) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/sso/create', data);
        return response.data;
    },

    updateSSOProvider: async (data: UpdateSSOProviderModel) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/sso/update', data);
        return response.data;
    },

    deleteSSOProvider: async (id: number) => {
        const response = await apiClient.post<GlobalResponse>('/administration/iam/sso/delete', { id });
        return response.data;
    }
};
