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
import {
    SettingType, CompanyIdRequestModel, CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel,
    GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, EmailStatsResponseModel,
    CreateSettingModel, BulkSetSettingsModel, GetAllSettingsResponseModel,
    CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel,
    CreateRoleModel, UpdateRoleModel, GetAllRolesResponseModel,
    EnableMFAModel, CreateAPIKeyModel, CreateSSOProviderModel, UpdateSSOProviderModel,
    CreateAssetModel, GetAllAssetsModel,
    // New Models
    GetAllPrincipalsResponseModel, AssignRolesModel, GetAllMenusResponseModel, GetActiveSessionsModel,
    MFAStatusResponseModel, MFASetupResponseModel, GetAllAPIKeysResponseModel, GetAllSSOProvidersResponseModel,
    GetUserPermissionsResponseModel, CheckPermissionRequestModel, CheckPermissionResponseModel,
    GetAllPermissionsResponseModel, CreatePermissionModel, UpdatePermissionModel, DeletePermissionModel,
    CreateAPIKeyResponse,
    PrincipalResponseModel, MenuResponseModel, SSOProvider, PermissionModel
} from '@adminvault/shared-models';

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
    async findAllPrincipals(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllPrincipalsResponseModel> {
        try {
            const principals = await this.iamService.findAllPrincipals(reqModel.id);
            return new GetAllPrincipalsResponseModel(true, 200, 'Principals retrieved', (principals as unknown) as PrincipalResponseModel[]);
        } catch (error) {
            return returnException(GetAllPrincipalsResponseModel, error);
        }
    }

    // ... assignRolesToUser matches (GlobalResponse) ...

    @Post('iam/menus/all-tree')
    @UseGuards(PermissionsGuard)
    @RequirePermission('Master', 'READ')
    async getAllMenusTree(): Promise<GetAllMenusResponseModel> {
        try {
            const menus = await this.iamService.getAllMenusTree();
            return new GetAllMenusResponseModel(true, 200, 'All menus retrieved', (menus as unknown) as MenuResponseModel[]);
        } catch (error) {
            return returnException(GetAllMenusResponseModel, error);
        }
    }

    @Post('iam/menus/authorized')
    async getUserAuthorizedMenus(@Req() req: any): Promise<GetAllMenusResponseModel> {
        try {
            const menus = await this.iamService.getUserAuthorizedMenus(req.user.id);
            return new GetAllMenusResponseModel(true, 200, 'Authorized menus retrieved', (menus as unknown) as MenuResponseModel[]);
        } catch (error) {
            return returnException(GetAllMenusResponseModel, error);
        }
    }

    @Post('iam/sessions/get-my-sessions')
    async getMySessions(@Req() req: any): Promise<GetActiveSessionsModel> {
        try {
            const sessions = await this.sessionService.getActiveSessions(req.user.id);
            // Cast Entity[] to DTO[]
            return new GetActiveSessionsModel(true, 200, 'Active sessions retrieved', (sessions as unknown) as any[]);
        }
        catch (error) {
            return returnException(GetActiveSessionsModel, error);
        }
    }

    // ... MFA and Keys ...

    @Post('iam/sso/providers')
    async getSSOProviders(@Req() req: any): Promise<GetAllSSOProvidersResponseModel> {
        try {
            const providers = await this.iamService.getSSOProviders(req.user.companyId);
            return new GetAllSSOProvidersResponseModel(true, 200, 'SSO Providers retrieved', (providers as unknown) as SSOProvider[]);
        }
        catch (error) {
            return returnException(GetAllSSOProvidersResponseModel, error);
        }
    }

    // ... 

    @Post('iam/users/:userId/permissions')
    async getUserPermissions(@Req() req: any): Promise<GetUserPermissionsResponseModel> {
        try {
            const userId = parseInt(req.params.userId);
            const permissions = await this.iamService.getUserPermissions(userId);
            return new GetUserPermissionsResponseModel(true, 200, 'User permissions retrieved', (permissions as unknown) as PermissionModel[]);
        } catch (error) {
            return returnException(GetUserPermissionsResponseModel, error);
        }
    }

    // ...

    @Post('iam/permissions/findAll')
    async findAllPermissions(): Promise<GetAllPermissionsResponseModel> {
        try {
            const permissions = await this.iamService.findAllPermissions();
            return new GetAllPermissionsResponseModel(true, 200, 'Permissions retrieved', (permissions as unknown) as PermissionModel[]);
        } catch (error) {
            return returnException(GetAllPermissionsResponseModel, error);
        }
    }

    @Post('iam/permissions/create')
    @ApiBody({ type: CreatePermissionModel })
    async createPermission(@Body() body: CreatePermissionModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.createPermission(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/permissions/update')
    @ApiBody({ type: UpdatePermissionModel })
    async updatePermission(@Body() body: UpdatePermissionModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.updatePermission(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/permissions/delete')
    @ApiBody({ type: DeletePermissionModel })
    async deletePermission(@Body() body: DeletePermissionModel): Promise<GlobalResponse> {
        try {
            return await this.iamService.deletePermission(body.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('iam/permissions/seed')
    @UseGuards(PermissionsGuard)
    @RequirePermission('Permission', 'CREATE')
    async seedPermissions() {
        try {
            await this.iamService.seedPermissions();
            return {
                status: true,
                statusCode: 200,
                message: 'Permissions seeded successfully'
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
