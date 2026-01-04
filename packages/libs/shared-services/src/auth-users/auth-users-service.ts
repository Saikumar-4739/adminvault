import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CompanyIdRequestModel,
    DeleteUserModel,
    GetAllUsersModel,
    GlobalResponse,
    LoginResponseModel,
    LoginUserModel,
    LogoutUserModel,
    RegisterUserModel,
    RequestAccessModel,
    UpdateUserModel
} from '@adminvault/shared-models';

export class AuthUsersService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/auth-users/' + childUrl;
    }

    async registerUser(reqObj: RegisterUserModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('registerUser'), reqObj, config);
    }

    async loginUser(reqObj: LoginUserModel, config?: AxiosRequestConfig): Promise<LoginResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('loginUser'), reqObj, config);
    }

    async logOutUser(reqObj: LogoutUserModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('logOutUser'), reqObj, config);
    }

    async updateUser(reqObj: UpdateUserModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateUser'), reqObj, config);
    }

    async deleteUser(reqObj: DeleteUserModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteUser'), reqObj, config);
    }

    async getAllUsers(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllUsersModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllUsers'), reqObj, config);
    }

    async requestAccess(reqObj: RequestAccessModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('requestAccess'), reqObj, config);
    }
}
