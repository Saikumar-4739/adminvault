import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateLicenseModel, UpdateLicenseModel, DeleteLicenseModel, GetAllLicensesModel, GetLicenseStatsModel, GlobalResponse } from '@adminvault/shared-models';

export class LicensesService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/licenses/' + childUrl;
    }

    async findAll(companyId: number, config?: AxiosRequestConfig): Promise<GetAllLicensesModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('findAll'), { id: companyId }, config);
    }

    async getStats(companyId: number, config?: AxiosRequestConfig): Promise<GetLicenseStatsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('stats'), { id: companyId }, config);
    }

    async create(reqObj: CreateLicenseModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('create'), reqObj, config);
    }

    async update(reqObj: UpdateLicenseModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('update'), reqObj, config);
    }

    async remove(reqObj: DeleteLicenseModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('delete'), reqObj, config);
    }
}
