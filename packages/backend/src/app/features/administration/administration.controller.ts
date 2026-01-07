import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PasswordVaultService } from './password-vault.service';
import { IAMService } from './iam.service';
import { AssetOperationsService } from './asset-operations.service';
import { EmailInfoService } from './email-info.service';
import { LoginSessionService } from '../auth-users/login-session.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RequirePermission } from '../../decorators/permissions.decorator';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import { SettingType, CompanyIdRequestModel, CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, EmailStatsResponseModel, CreateSettingModel, BulkSetSettingsModel, GetAllSettingsResponseModel, CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, CreateRoleModel, UpdateRoleModel, GetAllRolesResponseModel, EnableMFAModel, CreateAPIKeyModel, CreateSSOProviderModel, UpdateSSOProviderModel, CreateAssetModel, GetAllAssetsModel } from '@adminvault/shared-models';

@ApiTags('Administration')
@Controller('administration')
@UseGuards(JwtAuthGuard)
export class AdministrationController {
    constructor(
        private readonly settingsService: SettingsService,
        private readonly vaultService: PasswordVaultService,
        private readonly iamService: IAMService,
        private readonly assetService: AssetOperationsService,
        private readonly emailService: EmailInfoService,
        private readonly sessionService: LoginSessionService
    ) { }

    @Post('settings/get-all-user-settings')
    async getUserSettings(@Req() req: any): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getUserSettings(req.user.id);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('settings/get-all-company-settings')
    async getCompanySettings(@Req() req: any): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getCompanySettings(req.user.companyId);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('settings/get-all-system-settings')
    async getSystemSettings(): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getSystemSettings();
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('settings/set-user-setting')
    @ApiBody({ type: CreateSettingModel })
    async setUserSetting(@Req() req: any, @Body() body: CreateSettingModel): Promise<GlobalResponse> {
        try {
            body.type = SettingType.JSON;
            body.userId = req.user.id;
            return await this.settingsService.setSetting(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('settings/bulk-set')
    @ApiBody({ type: BulkSetSettingsModel })
    async bulkSetSettings(@Body() model: BulkSetSettingsModel): Promise<GlobalResponse> {
        try {
            return await this.settingsService.bulkSetSettings(model);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('password-vault/get-all')
    async findBatchVault(@Req() req: any): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.vaultService.findAllVaultEntries(req.user.companyId, req.user.id);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('password-vault/create')
    @ApiBody({ type: CreatePasswordVaultModel })
    async createVault(@Req() req: any, @Body() body: CreatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            body.companyId = req.user.companyId;
            body.userId = req.user.id;
            return await this.vaultService.createVaultEntry(body);
        } catch (error) { return returnException(GlobalResponse, error); }
    }

    @Post('password-vault/update')
    @ApiBody({ type: UpdatePasswordVaultModel })
    async updateVault(@Body() body: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            return await this.vaultService.updateVaultEntry(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('password-vault/reveal-password')
    async revealVaultPassword(@Req() req: any, @Body('id') id: number) {
        try {
            const password = await this.vaultService.getDecryptedVaultPassword(id, req.user.id);
            return { status: true, message: 'Success', data: { password } };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('operations/assets/findAll')
    @ApiBody({ type: CompanyIdRequestModel })
    async findAssets(@Body() filters: CompanyIdRequestModel): Promise<GetAllAssetsModel> {
        try { return await this.assetService.findAllAssets(filters); }
        catch (error) {
            return returnException(GetAllAssetsModel, error);
        }
    }

    @Post('operations/assets/create')
    @ApiBody({ type: CreateAssetModel })
    async createAsset(@Body() model: CreateAssetModel): Promise<GlobalResponse> {
        try { return await this.assetService.createAsset(model); }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('operations/assets/assign')
    async assignAssetOp(@Req() req: any, @Body() body: { assetId: number, employeeId: number, remarks?: string }): Promise<GlobalResponse> {
        try {
            // JwtAuthGuard should populate req.user, but add fallback for debugging
            const userId = req.user?.id || req.user?.userId || 1;
            console.log('Assign Asset - User ID:', userId, 'Full req.user:', req.user);
            return await this.assetService.assignAssetOp(body.assetId, body.employeeId, userId, body.remarks);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/roles/findAll')
    @UseGuards(PermissionsGuard)
    @RequirePermission('Role', 'READ')
    @ApiBody({ type: CompanyIdRequestModel })
    async findAllRoles(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllRolesResponseModel> {
        try { return await this.iamService.findAllRoles(reqModel.id); }
        catch (error) {
            return returnException(GetAllRolesResponseModel, error);
        }
    }

    @Post('iam/roles/create')
    @ApiBody({ type: CreateRoleModel })
    async createRole(@Body() model: CreateRoleModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.createRole(model);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/roles/update')
    @ApiBody({ type: UpdateRoleModel })
    async updateRole(@Body() model: UpdateRoleModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.updateRole(model);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/roles/delete')
    async deleteRole(@Body('id') id: number): Promise<GlobalResponse> {
        try {
            return await this.iamService.deleteRole(id);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/principals/findAll')
    @ApiBody({ type: CompanyIdRequestModel })
    async findAllPrincipals(@Body() reqModel: CompanyIdRequestModel) {
        try {
            const principals = await this.iamService.findAllPrincipals(reqModel.id);
            return { success: true, statusCode: 200, message: 'Principals retrieved', data: principals };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/permissions/findAll')
    async findAllPermissions() {
        try {
            const permissions = await this.iamService.findAllPermissions();
            return { success: true, statusCode: 200, message: 'Permissions retrieved', data: permissions };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/users/assign-roles')
    async assignRolesToUser(@Body() body: { userId: number, roleIds: number[], companyId: number }) {
        try {
            return await this.iamService.assignRolesToUser(body.userId, body.roleIds, body.companyId);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/menus/authorized')
    async getUserAuthorizedMenus(@Req() req: any) {
        try {
            const menus = await this.iamService.getUserAuthorizedMenus(req.user.id);
            return { success: true, statusCode: 200, message: 'Authorized menus retrieved', data: menus };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/sessions/get-my-sessions')
    async getMySessions(@Req() req: any) {
        try {
            return await this.sessionService.getActiveSessions(req.user.id);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/mfa/status')
    async getMFAStatus(@Req() req: any) {
        try {
            return await this.iamService.getMFAStatus(req.user.id);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/mfa/setup')
    async setupMFA(@Req() req: any) {
        try {
            return await this.iamService.generateMFASetupData(req.user.id);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/mfa/enable')
    @ApiBody({ type: EnableMFAModel })
    async enableMFA(@Body() model: EnableMFAModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.verifyAndEnableMFA(model);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/api-keys/create')
    @ApiBody({ type: CreateAPIKeyModel })
    async createAPIKey(@Req() req: any, @Body() body: CreateAPIKeyModel) {
        try {
            body.userId = req.user.id;
            body.companyId = req.user.companyId;
            const result = await this.iamService.createAPIKey(body);
            return { status: true, statusCode: 201, message: result.message, data: result };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/api-keys/get-all')
    async getAllAPIKeys(@Req() req: any) {
        try {
            const data = await this.iamService.findAllAPIKeys(req.user.companyId);
            return { status: true, statusCode: 200, message: 'API Keys retrieved', data };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/api-keys/delete')
    async deleteAPIKey(@Body('id') id: number): Promise<GlobalResponse> {
        try {
            return await this.iamService.revokeAPIKey(id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/sso/providers')
    async getSSOProviders(@Req() req: any) {
        try {
            return await this.iamService.getSSOProviders(req.user.companyId);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/sso/create')
    @ApiBody({ type: CreateSSOProviderModel })
    async createSSOProvider(@Body() model: CreateSSOProviderModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.createSSOProvider(model);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/sso/update')
    @ApiBody({ type: UpdateSSOProviderModel })
    async updateSSOProvider(@Body() model: UpdateSSOProviderModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.updateSSOProvider(model);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/sso/delete')
    async deleteSSOProvider(@Body('id') id: number): Promise<GlobalResponse> {
        try {
            return await this.iamService.deleteSSOProvider(id);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('email-info/createEmailInfo')
    @ApiBody({ type: CreateEmailInfoModel })
    async createEmailInfo(@Body() reqModel: CreateEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.emailService.createEmailInfo(reqModel);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('email-info/updateEmailInfo')
    @ApiBody({ type: UpdateEmailInfoModel })
    async updateEmailInfo(@Body() reqModel: UpdateEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.emailService.updateEmailInfo(reqModel);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('email-info/getEmailInfo')
    @ApiBody({ type: GetEmailInfoModel })
    async getEmailInfo(@Body() reqModel: GetEmailInfoModel): Promise<GetEmailInfoByIdModel> {
        try {
            return await this.emailService.getEmailInfo(reqModel);
        }
        catch (error) {
            return returnException(GetEmailInfoByIdModel, error);
        }
    }

    @Post('email-info/getAllEmailInfo')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllEmailInfo(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllEmailInfoModel> {
        try {
            return await this.emailService.getAllEmailInfo(reqModel.id);
        }
        catch (error) {
            return returnException(GetAllEmailInfoModel, error);
        }
    }

    @Post('email-info/getEmailStats')
    @ApiBody({ type: CompanyIdRequestModel })
    async getEmailStats(@Body() reqModel: CompanyIdRequestModel): Promise<EmailStatsResponseModel> {
        try {
            return await this.emailService.getEmailStats(reqModel.id);
        }
        catch (error) {
            return returnException(EmailStatsResponseModel, error);
        }
    }

    @Post('email-info/deleteEmailInfo')
    @ApiBody({ type: DeleteEmailInfoModel })
    async deleteEmailInfo(@Body() reqModel: DeleteEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.emailService.deleteEmailInfo(reqModel);
        }
        catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
