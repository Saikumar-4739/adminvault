import { CommonAxiosService } from '../common-axios-service';

export class ReportsService extends CommonAxiosService {
    private readonly BASE_PATH = '/reports';

    async generateReport(type: string, filters: any = {}) {
        return await this.axiosGetCall(`${this.BASE_PATH}/generate`, {
            params: { type, ...filters }
        });
    }
}
