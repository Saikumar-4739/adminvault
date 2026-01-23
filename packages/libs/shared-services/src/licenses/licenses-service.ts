import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateLicenseModel, UpdateLicenseModel, DeleteLicenseModel, GetAllLicensesResponseModel, GetLicenseStatisticsResponseModel, GlobalResponse, CompanyIdRequestModel } from '@adminvault/shared-models';

export class LicensesService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/licenses/' + childUrl;
    }

    async getAllLicenses(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllLicensesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllLicenses'), reqObj, config);
    }

    async getLicenseStatistics(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetLicenseStatisticsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getLicenseStatistics'), reqObj, config);
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
