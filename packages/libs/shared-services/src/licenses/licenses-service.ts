import { CommonAxiosService } from '../common-axios-service';

export class LicensesService extends CommonAxiosService {
    private readonly BASE_PATH = '/licenses';

    async getAll(companyId?: number) {
        const config = companyId ? { params: { companyId } } : {};
        return await this.axiosGetCall(this.BASE_PATH, config);
    }

    async getStats(companyId?: number) {
        const config = companyId ? { params: { companyId } } : {};
        return await this.axiosGetCall(`${this.BASE_PATH}/stats`, config);
    }

    async create(data: any) {
        return await this.axiosPostCall(this.BASE_PATH, data);
    }

    async update(id: number, data: any) {
        return await this.axiosPatchCall(`${this.BASE_PATH}/${id}`, data);
    }

    async remove(id: number) {
        return await this.axiosDeleteCall(`${this.BASE_PATH}/${id}`);
    }
}
