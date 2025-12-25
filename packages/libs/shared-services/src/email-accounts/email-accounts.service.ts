import { CommonAxiosService } from '../common-axios-service';
import { GetAllEmailAccountsModel, GlobalResponse } from '@adminvault/shared-models';

export class EmailAccountsService extends CommonAxiosService {
    private readonly BASE_PATH = '/email-accounts';

    async getAll(companyId?: number): Promise<GetAllEmailAccountsModel> {
        // Backend currently findAll uses POST and doesn't explicitly filter by companyId in logic, 
        // but let's pass it if needed or just call findAll.
        // Controller path: /email-accounts/findAll
        return await this.axiosPostCall(`${this.BASE_PATH}/findAll`, {});
    }

    async create(data: any): Promise<GlobalResponse> {
        // Controller path: /email-accounts/create
        return await this.axiosPostCall(`${this.BASE_PATH}/create`, data);
    }

    async delete(id: number): Promise<GlobalResponse> {
        // Controller path: /email-accounts/delete
        // Expects DeleteEmailAccountModel body: { id: number }
        return await this.axiosPostCall(`${this.BASE_PATH}/delete`, { id });
    }
}
