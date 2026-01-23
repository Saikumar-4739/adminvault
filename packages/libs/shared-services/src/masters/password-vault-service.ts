import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreatePasswordVaultModel, CreatePasswordVaultResponseModel, GetAllPasswordVaultsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdatePasswordVaultModel, UpdatePasswordVaultResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class PasswordVaultService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllPasswordVaults(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllPasswordVaults'), reqObj, config);
    }

    async createPasswordVault(data: CreatePasswordVaultModel, config?: AxiosRequestConfig): Promise<CreatePasswordVaultResponseModel> {
        return await this.axiosPostCall(this.getURL('password-vaults'), data, config);
    }

    async updatePasswordVault(data: UpdatePasswordVaultModel, config?: AxiosRequestConfig): Promise<UpdatePasswordVaultResponseModel> {
        return await this.axiosPostCall(this.getURL('updatePasswordVault'), data, config);
    }

    async deletePasswordVault(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deletePasswordVault'), reqObj, config);
    }
}
