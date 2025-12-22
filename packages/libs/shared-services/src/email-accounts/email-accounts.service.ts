import { CommonAxiosService } from '../common-axios-service';

export class EmailAccountsService extends CommonAxiosService {
    private readonly BASE_PATH = '/email-accounts';

    async getAll(companyId?: number) {
        const config = companyId ? { params: { companyId } } : {};
        return await this.axiosGetCall(this.BASE_PATH, config);
    }

    async create(data: any) {
        return await this.axiosPostCall(this.BASE_PATH, data);
    }

    async delete(id: number) {
        return await this.axiosDeleteCall(`${this.BASE_PATH}/${id}`);
    }
}
