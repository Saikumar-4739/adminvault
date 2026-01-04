import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SSOService } from '../services/sso.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { SSOProviderEntity } from '../../../entities/sso-provider.entity';

@Controller('iam/sso')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SSOController {
    constructor(private readonly ssoService: SSOService) { }

    @Get('providers')
    @RequirePermission('SSO', 'READ')
    async getProviders(@Req() req: any) {
        return this.ssoService.getProvidersForCompany(req.user.companyId);
    }

    @Post('providers')
    @RequirePermission('SSO', 'CREATE')
    async createProvider(@Req() req: any, @Body() data: Partial<SSOProviderEntity>) {
        return this.ssoService.createProvider({ ...data, companyId: req.user.companyId });
    }

    @Put('providers/:id')
    @RequirePermission('SSO', 'UPDATE')
    async updateProvider(@Param('id') id: string, @Body() data: Partial<SSOProviderEntity>) {
        return this.ssoService.updateProvider(parseInt(id), data);
    }

    @Delete('providers/:id')
    @RequirePermission('SSO', 'DELETE')
    async deleteProvider(@Param('id') id: string) {
        return this.ssoService.deleteProvider(parseInt(id));
    }
}
