import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { GlobalResponse } from '@adminvault/shared-models';

export interface IAMUser {
    id: number;
    fullName: string;
    email: string;
    phNumber?: string;
    companyId: number;
    userRole: string;
    status: boolean;
    lastLogin?: Date;
    roles?: any[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SSOProvider {
    id: number;
    name: string;
    type: string;
    clientId: string;
    clientSecret?: string;
    issuerUrl?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    isActive: boolean;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Role {
    id: number;
    name: string;
    code: string;
    description?: string;
    isSystemRole: boolean;
    isActive: boolean;
    companyId?: number;
    permissions?: any[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GetAllUsersResponse extends GlobalResponse {
    data?: IAMUser[];
}

export interface GetAllSSOProvidersResponse extends GlobalResponse {
    data?: SSOProvider[];
}

export interface GetAllRolesResponse extends GlobalResponse {
    data?: Role[];
}

export class IAMService extends CommonAxiosService {
    // Users endpoints
    async getAllUsers(companyId?: number, config?: AxiosRequestConfig): Promise<GetAllUsersResponse> {
        const url = companyId
            ? `/auth-users/getAllUsers`
            : `/auth-users/getAllUsers`;
        return await this.axiosPostCall(url, { companyId }, config);
    }

    async updateUser(userId: number, data: Partial<IAMUser>, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/auth-users/updateUser', { id: userId, ...data }, config);
    }

    async deleteUser(email: string, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/auth-users/deleteUser', { email }, config);
    }

    // SSO endpoints
    async getAllSSOProviders(config?: AxiosRequestConfig): Promise<GetAllSSOProvidersResponse> {
        return await this.axiosGetCall('/iam/sso/providers', config);
    }

    async createSSOProvider(data: Partial<SSOProvider>, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/sso/providers', data, config);
    }

    async updateSSOProvider(id: number, data: Partial<SSOProvider>, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPutCall(`/iam/sso/providers/${id}`, data, config);
    }

    async deleteSSOProvider(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/sso/providers/${id}`, config);
    }

    // Roles endpoints
    async getAllRoles(companyId?: number, config?: AxiosRequestConfig): Promise<GetAllRolesResponse> {
        const url = companyId
            ? `/iam/roles?companyId=${companyId}`
            : `/iam/roles`;
        return await this.axiosGetCall(url, config);
    }

    async createRole(data: Partial<Role>, permissionIds?: number[], config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/roles', { ...data, permissionIds }, config);
    }

    async updateRole(id: number, data: Partial<Role>, permissionIds?: number[], config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPutCall(`/iam/roles/${id}`, { ...data, permissionIds }, config);
    }

    async deleteRole(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/roles/${id}`, config);
    }

    // API Keys endpoints
    async getAllAPIKeys(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/api-keys', config);
    }

    async createAPIKey(data: any, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/api-keys', data, config);
    }

    async deleteAPIKey(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/api-keys/${id}`, config);
    }

    // MFA endpoints
    async getMFAMethods(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/mfa/methods', config);
    }

    async setupMFA(data: any, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/mfa/setup', data, config);
    }

    async disableMFA(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/mfa/${id}`, config);
    }

    async generateBackupCodes(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/mfa/backup-codes', {}, config);
    }

    // Sessions endpoints
    async getAllSessions(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/sessions', config);
    }

    async terminateSession(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/sessions/${id}`, config);
    }

    async terminateAllOtherSessions(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/sessions/terminate-others', {}, config);
    }
}
