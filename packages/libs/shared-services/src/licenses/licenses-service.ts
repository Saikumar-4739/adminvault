import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateLicenseModel, UpdateLicenseModel, DeleteLicenseModel, GetAllLicensesResponseModel, GlobalResponse, IdRequestModel } from '@adminvault/shared-models';

export class LicensesService extends CommonAxiosService {
    private baseUrl = '/licenses';

    async getAllLicenses(req: IdRequestModel): Promise<GetAllLicensesResponseModel> {
        return this.axiosPostCall(`${this.baseUrl}/getAllLicenses`, req);
    }

    async createLicense(model: CreateLicenseModel): Promise<GlobalResponse> {
        return this.axiosPostCall(`${this.baseUrl}/createLicense`, model);
    }

    async updateLicense(model: UpdateLicenseModel): Promise<GlobalResponse> {
        return this.axiosPostCall(`${this.baseUrl}/updateLicense`, model);
    }

    async deleteLicense(model: { id: number }): Promise<GlobalResponse> {
        return this.axiosPostCall(`${this.baseUrl}/deleteLicense`, model);
    }

    async getUtilization(req: IdRequestModel): Promise<any> {
        return this.axiosPostCall(`${this.baseUrl}/getUtilization`, req);
    }

    async getComplianceReport(req: IdRequestModel): Promise<any> {
        return this.axiosPostCall(`${this.baseUrl}/getComplianceReport`, req);
    }

    async getCostOptimization(req: IdRequestModel): Promise<any> {
        return this.axiosPostCall(`${this.baseUrl}/getCostOptimization`, req);
    }
}
