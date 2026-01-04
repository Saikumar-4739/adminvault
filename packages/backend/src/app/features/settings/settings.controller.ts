import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth-users/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingType } from '../../entities/settings.entity';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('user')
    @ApiOperation({ summary: 'Get all user settings' })
    async getUserSettings(@Req() req: any) {
        const { id: userId } = req.user;
        return {
            status: true,
            message: 'User settings retrieved successfully',
            data: await this.settingsService.getUserSettings(userId),
        };
    }

    @Get('company')
    @ApiOperation({ summary: 'Get all company settings' })
    async getCompanySettings(@Req() req: any) {
        const { companyId } = req.user;
        return {
            status: true,
            message: 'Company settings retrieved successfully',
            data: await this.settingsService.getCompanySettings(companyId),
        };
    }

    @Get('system')
    @ApiOperation({ summary: 'Get all system settings' })
    async getSystemSettings() {
        return {
            status: true,
            message: 'System settings retrieved successfully',
            data: await this.settingsService.getSystemSettings(),
        };
    }

    @Get('user/:key')
    @ApiOperation({ summary: 'Get specific user setting' })
    async getUserSetting(@Req() req: any, @Param('key') key: string) {
        const { id: userId } = req.user;
        return {
            status: true,
            message: 'Setting retrieved successfully',
            data: await this.settingsService.getSetting(key, SettingType.USER, userId),
        };
    }

    @Get('company/:key')
    @ApiOperation({ summary: 'Get specific company setting' })
    async getCompanySetting(@Req() req: any, @Param('key') key: string) {
        const { companyId } = req.user;
        return {
            status: true,
            message: 'Setting retrieved successfully',
            data: await this.settingsService.getSetting(key, SettingType.COMPANY, undefined, companyId),
        };
    }

    @Post('user')
    @ApiOperation({ summary: 'Set user setting' })
    async setUserSetting(@Req() req: any, @Body() body: { key: string; value: any; category?: string; description?: string }) {
        const { id: userId } = req.user;
        const setting = await this.settingsService.setSetting(
            body.key,
            body.value,
            SettingType.USER,
            userId,
            undefined,
            body.category,
            body.description
        );

        return {
            status: true,
            message: 'User setting saved successfully',
            data: setting,
        };
    }

    @Post('company')
    @ApiOperation({ summary: 'Set company setting' })
    async setCompanySetting(@Req() req: any, @Body() body: { key: string; value: any; category?: string; description?: string }) {
        const { companyId } = req.user;
        const setting = await this.settingsService.setSetting(
            body.key,
            body.value,
            SettingType.COMPANY,
            undefined,
            companyId,
            body.category,
            body.description
        );

        return {
            status: true,
            message: 'Company setting saved successfully',
            data: setting,
        };
    }

    @Post('system')
    @ApiOperation({ summary: 'Set system setting (admin only)' })
    async setSystemSetting(@Body() body: { key: string; value: any; category?: string; description?: string }) {
        const setting = await this.settingsService.setSetting(
            body.key,
            body.value,
            SettingType.SYSTEM,
            undefined,
            undefined,
            body.category,
            body.description
        );

        return {
            status: true,
            message: 'System setting saved successfully',
            data: setting,
        };
    }

    @Post('user/bulk')
    @ApiOperation({ summary: 'Bulk set user settings' })
    async bulkSetUserSettings(@Req() req: any, @Body() body: { settings: Array<{ key: string; value: any; category?: string }> }) {
        const { id: userId } = req.user;
        const settings = await this.settingsService.bulkSetSettings(body.settings, SettingType.USER, userId);

        return {
            status: true,
            message: 'User settings saved successfully',
            data: settings,
        };
    }

    @Post('company/bulk')
    @ApiOperation({ summary: 'Bulk set company settings' })
    async bulkSetCompanySettings(@Req() req: any, @Body() body: { settings: Array<{ key: string; value: any; category?: string }> }) {
        const { companyId } = req.user;
        const settings = await this.settingsService.bulkSetSettings(body.settings, SettingType.COMPANY, undefined, companyId);

        return {
            status: true,
            message: 'Company settings saved successfully',
            data: settings,
        };
    }

    @Delete('user/:key')
    @ApiOperation({ summary: 'Delete user setting' })
    async deleteUserSetting(@Req() req: any, @Param('key') key: string) {
        const { id: userId } = req.user;
        const deleted = await this.settingsService.deleteSetting(key, SettingType.USER, userId);

        return {
            status: deleted,
            message: deleted ? 'Setting deleted successfully' : 'Setting not found',
        };
    }

    @Delete('company/:key')
    @ApiOperation({ summary: 'Delete company setting' })
    async deleteCompanySetting(@Req() req: any, @Param('key') key: string) {
        const { companyId } = req.user;
        const deleted = await this.settingsService.deleteSetting(key, SettingType.COMPANY, undefined, companyId);

        return {
            status: deleted,
            message: deleted ? 'Setting deleted successfully' : 'Setting not found',
        };
    }

    @Get('category/:category')
    @ApiOperation({ summary: 'Get settings by category' })
    async getSettingsByCategory(
        @Req() req: any,
        @Param('category') category: string,
        @Query('type') type: SettingType
    ) {
        const { id: userId, companyId } = req.user;
        const settings = await this.settingsService.getAllSettingsByCategory(category, type, userId, companyId);

        return {
            status: true,
            message: 'Settings retrieved successfully',
            data: settings,
        };
    }
}
