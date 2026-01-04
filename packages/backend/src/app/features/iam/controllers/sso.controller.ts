import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SSOService } from '../services/sso.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { SSOProviderEntity } from '../entities/sso-provider.entity';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('IAM SSO')
@Controller('iam/sso')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SSOController {
    constructor(private readonly ssoService: SSOService) { }

    @Post('get-providers')
    @RequirePermission('SSO', 'READ')
    async getProviders(@Req() req: any) {
        try {
            return await this.ssoService.getProvidersForCompany(req.user.companyId);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('create-provider')
    @RequirePermission('SSO', 'CREATE')
    @ApiBody({ schema: { type: 'object' } })
    async createProvider(@Req() req: any, @Body() data: Partial<SSOProviderEntity>) {
        try {
            return await this.ssoService.createProvider({ ...data, companyId: req.user.companyId });
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('update-provider')
    @RequirePermission('SSO', 'UPDATE')
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async updateProvider(@Body() data: Partial<SSOProviderEntity> & { id: number }) {
        try {
            const { id, ...providerData } = data;
            return await this.ssoService.updateProvider(id, providerData);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete-provider')
    @RequirePermission('SSO', 'DELETE')
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async deleteProvider(@Body('id') id: number) {
        try {
            return await this.ssoService.deleteProvider(id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
