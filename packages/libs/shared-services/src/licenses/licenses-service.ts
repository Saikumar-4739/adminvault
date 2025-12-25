import { CommonAxiosService } from '../common-axios-service';

export class LicensesService extends CommonAxiosService {
    private readonly BASE_PATH = '/licenses';

    async getAll(companyId?: number) {
        const data = companyId ? { id: companyId } : {};
        return await this.axiosPostCall(`${this.BASE_PATH}/findAll`, data);
    }

    async getStats(companyId?: number) {
        const data = companyId ? { id: companyId } : {};
        return await this.axiosPostCall(`${this.BASE_PATH}/stats`, data);
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
