import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { IdRequestModel, CreateEmailInfoModel, DeleteEmailInfoModel, EmailStatsResponseModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, GetEmailInfoModel, GlobalResponse, UpdateEmailInfoModel, SendTicketCreatedEmailModel, SendPasswordResetEmailModel, RequestAccessModel, SendAssetApprovalEmailModel } from '@adminvault/shared-models';

export class AdministrationService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/administration/' + childUrl;
    }

    async getAllEmailInfo(reqModel: IdRequestModel, config?: AxiosRequestConfig): Promise<GetAllEmailInfoModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/getAllEmailInfo'), reqModel, config);
    }

    async getEmailInfo(reqModel: GetEmailInfoModel, config?: AxiosRequestConfig): Promise<GetEmailInfoByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/getEmailInfo'), reqModel, config);
    }

    async createEmailInfo(reqModel: CreateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/createEmailInfo'), reqModel, config);
    }

    async updateEmailInfo(reqModel: UpdateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/updateEmailInfo'), reqModel, config);
    }

    async deleteEmailInfo(reqModel: DeleteEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/deleteEmailInfo'), reqModel, config);
    }

    async getEmailStats(reqModel: IdRequestModel, config?: AxiosRequestConfig): Promise<EmailStatsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/getEmailStats'), reqModel, config);
    }

    async sendTicketCreatedEmail(reqModel: SendTicketCreatedEmailModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendTicketCreatedEmail'), reqModel, config);
    }

    async sendPasswordResetEmail(reqModel: SendPasswordResetEmailModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendPasswordResetEmail'), reqModel, config);
    }

    async sendAccessRequestEmail(reqModel: RequestAccessModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendAccessRequestEmail'), reqModel, config);
    }

    async sendAssetApprovalEmail(reqModel: SendAssetApprovalEmailModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendAssetApprovalEmail'), reqModel, config);
    }

    async getAllAccessRequests(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('email/getAllAccessRequests'), config);
    }
}
