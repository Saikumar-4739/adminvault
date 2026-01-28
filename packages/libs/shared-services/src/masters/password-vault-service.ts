import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreatePasswordVaultModel, GetAllPasswordVaultsResponseModel, IdRequestModel, UpdatePasswordVaultModel, GlobalResponse } from '@adminvault/shared-models';

export class PasswordVaultService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/password-vaults/' + childUrl;
    }

    async getAllPasswordVaults(config?: AxiosRequestConfig): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllPasswordVaults'), {}, config);
    }

    async createPasswordVault(reqModel: CreatePasswordVaultModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('password-vaults'), reqModel, config);
    }

    async updatePasswordVault(reqModel: UpdatePasswordVaultModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('updatePasswordVault'), reqModel, config);
    }

    async deletePasswordVault(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deletePasswordVault'), reqObj, config);
    }
}
