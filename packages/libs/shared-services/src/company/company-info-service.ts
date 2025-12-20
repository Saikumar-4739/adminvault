import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateCompanyModel, UpdateCompanyModel, DeleteCompanyModel, GetCompanyModel, GlobalResponse } from '@adminvault/shared-models';

export class CompanyInfoService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/company-info/' + childUrl;
    }

    async createCompany(reqObj: CreateCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createCompany'), reqObj, config);
    }

    async updateCompany(reqObj: UpdateCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateCompany'), reqObj, config);
    }

    async getCompany(reqObj: GetCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getCompany'), reqObj, config);
    }

    async getAllCompanies(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllCompanies'), {}, config);
    }

    async deleteCompany(reqObj: DeleteCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteCompany'), reqObj, config);
    }
}
