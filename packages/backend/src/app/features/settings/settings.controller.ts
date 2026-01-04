import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SettingType } from './entities/settings.entity';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Post('get-all-user-settings')
    @ApiOperation({ summary: 'Get all user settings' })
    async getUserSettings(@Req() req: any) {
        try {
            const { id: userId } = req.user;
            return {
                status: true,
                message: 'User settings retrieved successfully',
                data: await this.settingsService.getUserSettings(userId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-all-company-settings')
    @ApiOperation({ summary: 'Get all company settings' })
    async getCompanySettings(@Req() req: any) {
        try {
            const { companyId } = req.user;
            return {
                status: true,
                message: 'Company settings retrieved successfully',
                data: await this.settingsService.getCompanySettings(companyId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-all-system-settings')
    @ApiOperation({ summary: 'Get all system settings' })
    async getSystemSettings() {
        try {
            return {
                status: true,
                message: 'System settings retrieved successfully',
                data: await this.settingsService.getSystemSettings(),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-user-setting')
    @ApiOperation({ summary: 'Get specific user setting' })
    @ApiBody({ schema: { properties: { key: { type: 'string' } } } })
    async getUserSetting(@Req() req: any, @Body('key') key: string) {
        try {
            const { id: userId } = req.user;
            return {
                status: true,
                message: 'Setting retrieved successfully',
                data: await this.settingsService.getSetting(key, SettingType.USER, userId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-company-setting')
    @ApiOperation({ summary: 'Get specific company setting' })
    @ApiBody({ schema: { properties: { key: { type: 'string' } } } })
    async getCompanySetting(@Req() req: any, @Body('key') key: string) {
        try {
            const { companyId } = req.user;
            return {
                status: true,
                message: 'Setting retrieved successfully',
                data: await this.settingsService.getSetting(key, SettingType.COMPANY, undefined, companyId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('set-user-setting')
    @ApiOperation({ summary: 'Set user setting' })
    @ApiBody({ schema: { properties: { key: { type: 'string' }, value: { type: 'object' }, category: { type: 'string' }, description: { type: 'string' } } } })
    async setUserSetting(@Req() req: any, @Body() body: { key: string; value: any; category?: string; description?: string }) {
        try {
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
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('set-company-setting')
    @ApiOperation({ summary: 'Set company setting' })
    @ApiBody({ schema: { properties: { key: { type: 'string' }, value: { type: 'object' }, category: { type: 'string' }, description: { type: 'string' } } } })
    async setCompanySetting(@Req() req: any, @Body() body: { key: string; value: any; category?: string; description?: string }) {
        try {
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
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('set-system-setting')
    @ApiOperation({ summary: 'Set system setting (admin only)' })
    @ApiBody({ schema: { properties: { key: { type: 'string' }, value: { type: 'object' }, category: { type: 'string' }, description: { type: 'string' } } } })
    async setSystemSetting(@Body() body: { key: string; value: any; category?: string; description?: string }) {
        try {
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
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('bulk-set-user-settings')
    @ApiOperation({ summary: 'Bulk set user settings' })
    @ApiBody({ schema: { properties: { settings: { type: 'array', items: { type: 'object' } } } } })
    async bulkSetUserSettings(@Req() req: any, @Body() body: { settings: Array<{ key: string; value: any; category?: string }> }) {
        try {
            const { id: userId } = req.user;
            const settings = await this.settingsService.bulkSetSettings(body.settings, SettingType.USER, userId);

            return {
                status: true,
                message: 'User settings saved successfully',
                data: settings,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('bulk-set-company-settings')
    @ApiOperation({ summary: 'Bulk set company settings' })
    @ApiBody({ schema: { properties: { settings: { type: 'array', items: { type: 'object' } } } } })
    async bulkSetCompanySettings(@Req() req: any, @Body() body: { settings: Array<{ key: string; value: any; category?: string }> }) {
        try {
            const { companyId } = req.user;
            const settings = await this.settingsService.bulkSetSettings(body.settings, SettingType.COMPANY, undefined, companyId);

            return {
                status: true,
                message: 'Company settings saved successfully',
                data: settings,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete-user-setting')
    @ApiOperation({ summary: 'Delete user setting' })
    @ApiBody({ schema: { properties: { key: { type: 'string' } } } })
    async deleteUserSetting(@Req() req: any, @Body('key') key: string) {
        try {
            const { id: userId } = req.user;
            const deleted = await this.settingsService.deleteSetting(key, SettingType.USER, userId);

            return {
                status: deleted,
                message: deleted ? 'Setting deleted successfully' : 'Setting not found',
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete-company-setting')
    @ApiOperation({ summary: 'Delete company setting' })
    @ApiBody({ schema: { properties: { key: { type: 'string' } } } })
    async deleteCompanySetting(@Req() req: any, @Body('key') key: string) {
        try {
            const { companyId } = req.user;
            const deleted = await this.settingsService.deleteSetting(key, SettingType.COMPANY, undefined, companyId);

            return {
                status: deleted,
                message: deleted ? 'Setting deleted successfully' : 'Setting not found',
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-settings-by-category')
    @ApiOperation({ summary: 'Get settings by category' })
    @ApiBody({ schema: { properties: { category: { type: 'string' }, type: { type: 'string', enum: ['USER', 'COMPANY', 'SYSTEM'] } } } })
    async getSettingsByCategory(
        @Req() req: any,
        @Body() body: { category: string, type: SettingType }
    ) {
        try {
            const { id: userId, companyId } = req.user;
            const settings = await this.settingsService.getAllSettingsByCategory(body.category, body.type, userId, companyId);

            return {
                status: true,
                message: 'Settings retrieved successfully',
                data: settings,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
