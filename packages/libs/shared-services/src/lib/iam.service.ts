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
}
