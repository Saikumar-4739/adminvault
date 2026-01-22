import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateLicenseModel, UpdateLicenseModel, DeleteLicenseModel, GetAllLicensesResponseModel, GetLicenseStatisticsResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class LicensesService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/licenses/' + childUrl;
    }

    async getAllLicenses(companyId: number, config?: AxiosRequestConfig): Promise<GetAllLicensesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllLicenses'), { companyId }, config); // Assuming CompanyIdRequestModel uses {companyId} or {id}? Usually {companyId}.
    }

    async getLicenseStatistics(companyId: number, config?: AxiosRequestConfig): Promise<GetLicenseStatisticsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getLicenseStatistics'), { companyId }, config);
    }

    async createLicense(reqObj: CreateLicenseModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createLicense'), reqObj, config);
    }

    async updateLicense(reqObj: UpdateLicenseModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateLicense'), reqObj, config);
    }

    async deleteLicense(reqObj: DeleteLicenseModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteLicense'), reqObj, config);
    }
}
