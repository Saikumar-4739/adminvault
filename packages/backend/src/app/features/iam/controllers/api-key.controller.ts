import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { APIKeyService } from '../services/api-key.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';

@Controller('iam/api-keys')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class APIKeyController {
    constructor(private readonly apiKeyService: APIKeyService) { }

    @Get()
    @RequirePermission('APIKey', 'READ')
    async findAll(@Req() req: any) {
        return this.apiKeyService.findAll(req.user.companyId);
    }

    @Post()
    @RequirePermission('APIKey', 'CREATE')
    async create(@Req() req: any, @Body('name') name: string) {
        return this.apiKeyService.create(req.user.id, req.user.companyId, name);
    }

    @Delete(':id')
    @RequirePermission('APIKey', 'DELETE')
    async revoke(@Param('id') id: string) {
        return this.apiKeyService.revoke(parseInt(id));
    }
}
