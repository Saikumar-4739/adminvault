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

    async updateRoleMenus(role: string, assignments: { menuKey: string, permissions: any }[]): Promise<GlobalResponse> {
        return await this.axiosPostCall('/iam/role-menus/update', { role, assignments });
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
