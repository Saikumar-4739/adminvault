import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import {
    SettingType, CreateSettingModel, BulkSetSettingsModel, GetAllSettingsResponseModel,
    GetSettingRequestModel, GetSettingResponseModel, DeleteSettingRequestModel, GetSettingsByCategoryRequestModel
} from '@adminvault/shared-models';

@ApiTags('Settings')
@Controller('administration/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Post('get-all-user-settings')
    async getUserSettings(@Req() req: any): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getUserSettings(req.user.id);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('get-all-company-settings')
    async getCompanySettings(@Req() req: any): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getCompanySettings(req.user.companyId);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('get-all-system-settings')
    async getSystemSettings(): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getSystemSettings();
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }

    @Post('set-user-setting')
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

    @Post('bulk-set')
    @ApiBody({ type: BulkSetSettingsModel })
    async bulkSetSettings(@Body() model: BulkSetSettingsModel): Promise<GlobalResponse> {
        try {
            return await this.settingsService.bulkSetSettings(model);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-setting')
    @ApiBody({ type: GetSettingRequestModel })
    async getSetting(@Body() model: GetSettingRequestModel): Promise<GetSettingResponseModel> {
        try {
            return await this.settingsService.getSetting(model);
        } catch (error) {
            return returnException(GetSettingResponseModel, error);
        }
    }

    @Post('delete')
    @ApiBody({ type: DeleteSettingRequestModel })
    async deleteSetting(@Body() model: DeleteSettingRequestModel): Promise<GlobalResponse> {
        try {
            return await this.settingsService.deleteSetting(model);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-by-category')
    @ApiBody({ type: GetSettingsByCategoryRequestModel })
    async getAllSettingsByCategory(@Body() model: GetSettingsByCategoryRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            return await this.settingsService.getAllSettingsByCategory(model);
        } catch (error) {
            return returnException(GetAllSettingsResponseModel, error);
        }
    }
}
