import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import { SettingType, CreateSettingModel, BulkSetSettingsModel, GetAllSettingsResponseModel, GetSettingRequestModel, GetSettingResponseModel, DeleteSettingRequestModel, GetSettingsByCategoryRequestModel, CompanyIdRequestModel, UserIdNumRequestModel } from '@adminvault/shared-models';

@ApiTags('Settings')
@Controller('administration/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Post('getUserSettings')
    @ApiBody({ type: UserIdNumRequestModel })
    async getUserSettings(@Body() reqModel: UserIdNumRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getUserSettings(reqModel);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('getCompanySettings')
    @ApiBody({ type: CompanyIdRequestModel })
    async getCompanySettings(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getCompanySettings(reqModel);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('getSystemSettings')
    async getSystemSettings(): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getSystemSettings();
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('setUserSetting')
    @ApiBody({ type: CreateSettingModel })
    async setUserSetting(@Body() reqModel: CreateSettingModel): Promise<GlobalResponse> {
        try {
            reqModel.type = SettingType.JSON;
            return await this.settingsService.setSetting(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('bulkSetSettings')
    @ApiBody({ type: BulkSetSettingsModel })
    async bulkSetSettings(@Body() reqModel: BulkSetSettingsModel): Promise<GlobalResponse> {
        try {
            return await this.settingsService.bulkSetSettings(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getSetting')
    @ApiBody({ type: GetSettingRequestModel })
    async getSetting(@Body() reqModel: GetSettingRequestModel): Promise<GetSettingResponseModel> {
        try {
            return await this.settingsService.getSetting(reqModel);
        } catch (error) {
            return returnException(GetSettingResponseModel, error);
        }
    }

    @Post('deleteSetting')
    @ApiBody({ type: DeleteSettingRequestModel })
    async deleteSetting(@Body() reqModel: DeleteSettingRequestModel): Promise<GlobalResponse> {
        try {
            return await this.settingsService.deleteSetting(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllSettingsByCategory')
    @ApiBody({ type: GetSettingsByCategoryRequestModel })
    async getAllSettingsByCategory(@Body() reqModel: GetSettingsByCategoryRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getAllSettingsByCategory(reqModel);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }
}
