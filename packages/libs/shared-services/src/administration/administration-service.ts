import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { BulkSetSettingsModel, CompanyIdRequestModel, CreateEmailInfoModel, CreatePasswordVaultModel, CreateSettingModel, DeleteEmailInfoModel, EmailStatsResponseModel, GetAllEmailInfoModel, GetAllPasswordVaultsResponseModel, GetAllSettingsResponseModel, GetEmailInfoByIdModel, GetEmailInfoModel, GlobalResponse, UpdateEmailInfoModel, UpdatePasswordVaultModel, UserIdNumRequestModel, GetSettingRequestModel, GetSettingResponseModel, DeleteSettingRequestModel, GetSettingsByCategoryRequestModel, GetAllVaultEntriesModel, GetVaultEntryModel, GetVaultEntryResponseModel, DeleteVaultEntryModel, GetDecryptedPasswordModel, GetDecryptedPasswordResponseModel, SearchVaultByCategoryModel, ToggleVaultFavoriteModel, GetVaultCategoriesModel, GetVaultCategoriesResponseModel, SendTicketCreatedEmailModel, SendPasswordResetEmailModel, RequestAccessModel } from '@adminvault/shared-models';

export class AdministrationService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/administration/' + childUrl;
    }

    // --- SETTINGS ---

    async getUserSettings(reqModel: UserIdNumRequestModel, config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/getUserSettings'), reqModel, config);
    }

    async getCompanySettings(reqModel: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/getCompanySettings'), reqModel, config);
    }

    async getSystemSettings(config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/getSystemSettings'), {}, config);
    }

    async setSetting(reqModel: CreateSettingModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/setUserSetting'), reqModel, config);
    }

    async bulkSetSettings(reqModel: BulkSetSettingsModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/bulkSetSettings'), reqModel, config);
    }

    async getSetting(reqModel: GetSettingRequestModel, config?: AxiosRequestConfig): Promise<GetSettingResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/getSetting'), reqModel, config);
    }

    async deleteSetting(reqModel: DeleteSettingRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/deleteSetting'), reqModel, config);
    }

    async getAllSettingsByCategory(reqModel: GetSettingsByCategoryRequestModel, config?: AxiosRequestConfig): Promise<GetAllSettingsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('settings/getAllSettingsByCategory'), reqModel, config);
    }

    // --- PASSWORD VAULT ---

    async findAllVaultEntries(reqModel: GetAllVaultEntriesModel, config?: AxiosRequestConfig): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/getAllVaultEntries'), reqModel, config);
    }

    async findOneVaultEntry(reqModel: GetVaultEntryModel, config?: AxiosRequestConfig): Promise<GetVaultEntryResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/getVaultEntry'), reqModel, config);
    }

    async createVaultEntry(reqModel: CreatePasswordVaultModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/createVaultEntry'), reqModel, config);
    }

    async updateVaultEntry(reqModel: UpdatePasswordVaultModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/updateVaultEntry'), reqModel, config);
    }

    async deleteVaultEntry(reqModel: DeleteVaultEntryModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/deleteVaultEntry'), reqModel, config);
    }

    async getDecryptedVaultPassword(reqModel: GetDecryptedPasswordModel, config?: AxiosRequestConfig): Promise<GetDecryptedPasswordResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/getDecryptedVaultPassword'), reqModel, config);
    }

    async searchVaultByCategory(reqModel: SearchVaultByCategoryModel, config?: AxiosRequestConfig): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/searchVaultByCategory'), reqModel, config);
    }

    async toggleVaultFavorite(reqModel: ToggleVaultFavoriteModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/toggleVaultFavorite'), reqModel, config);
    }

    async getVaultCategories(reqModel: GetVaultCategoriesModel, config?: AxiosRequestConfig): Promise<GetVaultCategoriesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vault/getVaultCategories'), reqModel, config);
    }

    // --- EMAIL ---

    async getAllEmailInfo(reqModel: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllEmailInfoModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/getAllEmailInfo'), reqModel, config);
    }

    async getEmailInfo(reqModel: GetEmailInfoModel, config?: AxiosRequestConfig): Promise<GetEmailInfoByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/getEmailInfo'), reqModel, config);
    }

    async createEmailInfo(reqModel: CreateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/createEmailInfo'), reqModel, config);
    }

    async updateEmailInfo(reqModel: UpdateEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/updateEmailInfo'), reqModel, config);
    }

    async deleteEmailInfo(reqModel: DeleteEmailInfoModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/deleteEmailInfo'), reqModel, config);
    }

    async getEmailStats(reqModel: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<EmailStatsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/getEmailStats'), reqModel, config);
    }

    async sendTicketCreatedEmail(reqModel: SendTicketCreatedEmailModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendTicketCreatedEmail'), reqModel, config);
    }

    async sendPasswordResetEmail(reqModel: SendPasswordResetEmailModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendPasswordResetEmail'), reqModel, config);
    }

    async sendAccessRequestEmail(reqModel: RequestAccessModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('email/sendAccessRequestEmail'), reqModel, config);
    }
}
