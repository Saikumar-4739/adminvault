import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CreateItAdminModel,
    UpdateItAdminModel,
    DeleteItAdminModel,
    GetItAdminModel,
    GetItAdminByIdModel,
    GetAllItAdminsModel,
    GlobalResponse
} from '@adminvault/shared-models';

export class ItAdminService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/it-admin/' + childUrl;
    }

    async createAdmin(reqObj: CreateItAdminModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createAdmin'), reqObj, config);
    }

    async updateAdmin(reqObj: UpdateItAdminModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateAdmin'), reqObj, config);
    }

    async getAdmin(reqObj: GetItAdminModel, config?: AxiosRequestConfig): Promise<GetItAdminByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAdmin'), reqObj, config);
    }

    async getAllAdmins(config?: AxiosRequestConfig): Promise<GetAllItAdminsModel> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint('getAllAdmins'), config);
    }

    async deleteAdmin(reqObj: DeleteItAdminModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteAdmin'), reqObj, config);
    }
}
