import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { BulkSetSettingsModel, CompanyIdRequestModel, CreateAPIKeyModel, CreateAssetModel, CreateEmailInfoModel, CreatePasswordVaultModel, CreateRoleModel, CreateSSOProviderModel, CreateSettingModel, DeleteEmailInfoModel, EmailStatsResponseModel, EnableMFAModel, GetAllAssetsModel, GetAllEmailInfoModel, GetAllPasswordVaultsResponseModel, GetAllRolesResponseModel, GetAllSettingsResponseModel, GetEmailInfoByIdModel, GetEmailInfoModel, GlobalResponse, UpdateEmailInfoModel, UpdatePasswordVaultModel, } from '@adminvault/shared-models';

export class AdministrationService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/administration/' + childUrl;
    }

    async getUserSettings(config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/get-all-user-settings'), {}, config);
    }

    async getCompanySettings(config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/get-all-company-settings'), {}, config);
    }

    async getSystemSettings(config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/get-all-system-settings'), {}, config);
    }

    async setUserSetting(reqObj: CreateSettingModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/set-user-setting'), reqObj, config);
    }

    async bulkSetSettings(reqObj: BulkSetSettingsModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/bulk-set'), reqObj, config);
    }

    async findAllVaultEntries(config?: AxiosRequestConfig): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/get-all'), {}, config);
    }

    async createVaultEntry(reqObj: CreatePasswordVaultModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/create'), reqObj, config);
    }

    async updateVaultEntry(reqObj: UpdatePasswordVaultModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/update'), reqObj, config);
    }

    async revealVaultPassword(id: number, config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/reveal-password'), { id }, config);
    }

    async findAssets(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllAssetsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('operations/assets/findAll'), reqObj, config);
    }

    async createAsset(reqObj: CreateAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('operations/assets/create'), reqObj, config);
    }

    async assignAssetOp(assetId: number, employeeId: number, remarks?: string, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('operations/assets/assign'), { assetId, employeeId, remarks }, config);
    }

    async findAllRoles(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllRolesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/roles/findAll'), reqObj, config);
    }

    async createRole(reqObj: CreateRoleModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/roles/create'), reqObj, config);
    }

    async getMySessions(config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/sessions/get-my-sessions'), {}, config);
    }

    async getMFAStatus(config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/mfa/status'), {}, config);
    }

    async setupMFA(config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/mfa/setup'), {}, config);
    }

    async enableMFA(reqObj: EnableMFAModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/mfa/enable'), reqObj, config);
    }

    async createAPIKey(reqObj: CreateAPIKeyModel, config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/api-keys/create'), reqObj, config);
    }

    async getSSOProviders(config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/sso/providers'), {}, config);
    }

    async createSSOProvider(reqObj: CreateSSOProviderModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('iam/sso/create'), reqObj, config);
    }

    async createEmailInfo(reqObj: CreateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email-info/createEmailInfo'), reqObj, config);
    }

    async updateEmailInfo(reqObj: UpdateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email-info/updateEmailInfo'), reqObj, config);
    }

    async getEmailInfo(reqObj: GetEmailInfoModel, config?: AxiosRequestConfig): Promise<GetEmailInfoByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email-info/getEmailInfo'), reqObj, config);
    }

    async getAllEmailInfo(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllEmailInfoModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email-info/getAllEmailInfo'), reqObj, config);
    }

    async getEmailStats(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<EmailStatsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email-info/getEmailStats'), reqObj, config);
    }

    async deleteEmailInfo(reqObj: DeleteEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email-info/deleteEmailInfo'), reqObj, config);
    }
}
