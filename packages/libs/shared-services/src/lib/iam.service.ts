import { CommonAxiosService } from '../common-axios-service';
import { GlobalResponse } from '@adminvault/shared-models';

export class IamService extends CommonAxiosService {
    async getMyMenus(): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/my-menus');
    }

    async getRoles(): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/roles');
    }

    async getAllMenus(): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/all-menus');
    }

    async getAllRoleMenus(): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/role-menus/all');
    }

    async updateRoleMenus(roleKey: string, assignments: { menuKey: string, permissions: any }[]): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/role-menus/update', { roleKey, assignments });
    }

    async getMenusForRole(roleKey: string): Promise<GlobalResponse> {
        return await this.axiosGetCall(`/iam/role-menus/${roleKey}`);
    }

    // Role Matrix CRUD
    async createRole(data: any): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/roles', data);
    }

    async updateRole(id: number, data: any): Promise<GlobalResponse> {
        return await this.axiosPatchCall(`/iam/roles/${id}`, data);
    }

    async deleteRole(id: number): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/roles/${id}`);
    }

    // User to Role Mapping
    async getUserRoles(userId: number): Promise<GlobalResponse> {
        return await this.axiosGetCall(`/iam/user-roles/${userId}`);
    }

    async updateUserRoles(userId: number, roleKeys: string[]): Promise<GlobalResponse> {
        return await this.axiosPostCall(`/iam/user-roles/${userId}/update`, { roleKeys });
    }

    async getMenus(): Promise<GlobalResponse> {
        return await this.axiosGetCall('/iam/menus');
    }

    async createMenu(data: any): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/menus', data);
    }

    async updateMenu(id: number, data: any): Promise<GlobalResponse> {
        return await this.axiosPatchCall(`/iam/menus/${id}`, data);
    }

    async deleteMenu(id: number): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(`/iam/menus/${id}`);
    }

    async getUserMenus(userId: number): Promise<GlobalResponse> {
        return await this.axiosGetCall(`/iam/user-menus/${userId}`);
    }

    async updateUserMenus(userId: number, assignments: { menuKey: string, permissions: any }[]): Promise<GlobalResponse> {
        return await this.axiosPostCall(`/iam/user-menus/${userId}/update`, { assignments });
    }
}
