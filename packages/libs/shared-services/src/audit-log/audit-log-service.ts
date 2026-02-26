import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { GetAllAuditLogsResponseModel, GetAuditLogsRequestModel } from '@adminvault/shared-models';

export class AuditLogService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/audit-log/' + childUrl;
    }

    async getAllLogs(config?: AxiosRequestConfig): Promise<GetAllAuditLogsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllLogs'), {}, config);
    }

    async getLogsByEntity(reqObj: GetAuditLogsRequestModel, config?: AxiosRequestConfig): Promise<GetAllAuditLogsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getLogsByEntity'), reqObj, config);
    }
}
