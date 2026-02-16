import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateLicenseMasterModel, UpdateLicenseMasterModel, DeleteLicenseModel, GetAllLicenseMastersResponseModel, GlobalResponse, CompanyIdRequestModel } from '@adminvault/shared-models';

export class LicensesService extends CommonAxiosService {
    private baseUrl = 'license';

    async getAllLicenses(req: CompanyIdRequestModel): Promise<GetAllLicenseMastersResponseModel> {
        return this.axiosPostCall(`${this.baseUrl}/getAllLicenses`, req);
    }

    async createLicense(model: CreateLicenseMasterModel): Promise<GlobalResponse> {
        return this.axiosPostCall(`${this.baseUrl}/createLicense`, model);
    }

    async updateLicense(model: UpdateLicenseMasterModel): Promise<GlobalResponse> {
        return this.axiosPostCall(`${this.baseUrl}/updateLicense`, model);
    }

    async deleteLicense(model: { id: number }): Promise<GlobalResponse> {
        return this.axiosPostCall(`${this.baseUrl}/deleteLicense`, model);
    }
}
