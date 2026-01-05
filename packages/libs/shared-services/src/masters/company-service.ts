import { CreateCompanyModel, UpdateCompanyModel, DeleteCompanyModel, GetCompanyModel, GlobalResponse } from '@adminvault/shared-models';
import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';

export class CompanyService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/company-info/' + childUrl;
    }

    async createCompany(data: CreateCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createCompany'), data, config);
    }

    async updateCompany(data: UpdateCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateCompany'), data, config);
    }

    async getCompany(data: GetCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getCompany'), data, config);
    }

    async getAllCompanies(config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllCompanies'), {}, config);
    }

    async deleteCompany(data: DeleteCompanyModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteCompany'), data, config);
    }
}
