import { CommonAxiosService } from '../common-axios-service';

export class ReportsService extends CommonAxiosService {
    private readonly BASE_PATH = '/reports';

    async generateReport(type: string, filters: any = {}) {
        const config: any = {
            params: { type, ...filters }
        };

        if (filters.format === 'excel' || filters.format === 'pdf') {
            config.responseType = 'blob';
        }

        return await this.axiosGetCall(`${this.BASE_PATH}/generate`, config);
    }
}
