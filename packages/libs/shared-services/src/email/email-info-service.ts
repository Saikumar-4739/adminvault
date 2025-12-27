import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetEmailInfoByIdModel, GetAllEmailInfoModel, GlobalResponse } from '@adminvault/shared-models';

export class EmailInfoService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/email-info/' + childUrl;
    }

    async createEmailInfo(reqObj: CreateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createEmailInfo'), reqObj, config);
    }

    async updateEmailInfo(reqObj: UpdateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateEmailInfo'), reqObj, config);
    }

    async getEmailInfo(reqObj: GetEmailInfoModel, config?: AxiosRequestConfig): Promise<GetEmailInfoByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getEmailInfo'), reqObj, config);
    }

    async getAllEmailInfo(companyId?: number, config?: AxiosRequestConfig): Promise<GetAllEmailInfoModel> {
        const url = this.getURLwithMainEndPoint('getAllEmailInfo');
        const queryParams = companyId ? `?companyId=${companyId}` : '';
        return await this.axiosPostCall(`${url}${queryParams}`, {}, config);
    }

    async deleteEmailInfo(reqObj: DeleteEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteEmailInfo'), reqObj, config);
    }
}
