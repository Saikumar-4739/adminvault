import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";

export class ReportsService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/reports/' + childUrl;
    }

    async generateReport(type: string, filters: any = {}, config?: AxiosRequestConfig) {
        const queryConfig: AxiosRequestConfig = {
            ...config,
            params: { type, ...filters }
        };

        if (filters.format === 'excel' || filters.format === 'pdf') {
            queryConfig.responseType = 'blob';
        }

        return await this.axiosGetCall(this.getURLwithMainEndPoint('generate'), queryConfig);
    }
}
