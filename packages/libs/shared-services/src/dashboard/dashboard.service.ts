import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { DashboardStatsResponseModel, CompanyIdRequestModel } from '@adminvault/shared-models';

export class DashboardService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/dashboard/' + childUrl;
    }

    async getDashboardStats(reqModel: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<DashboardStatsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getDashboardStats'), reqModel, config);
    }
}
