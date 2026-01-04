import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { APIKeyService } from '../services/api-key.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('IAM API Keys')
@Controller('iam/api-keys')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class APIKeyController {
    constructor(private readonly apiKeyService: APIKeyService) { }

    @Post('get-all')
    @RequirePermission('APIKey', 'READ')
    @ApiOperation({ summary: 'Get all API keys for company' })
    async findAll(@Req() req: any) {
        try {
            return await this.apiKeyService.findAll(req.user.companyId);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('create')
    @RequirePermission('APIKey', 'CREATE')
    @ApiOperation({ summary: 'Create new API key' })
    @ApiBody({ schema: { properties: { name: { type: 'string' } } } })
    async create(@Req() req: any, @Body('name') name: string) {
        try {
            return await this.apiKeyService.create(req.user.id, req.user.companyId, name);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('revoke')
    @RequirePermission('APIKey', 'DELETE')
    @ApiOperation({ summary: 'Revoke API key' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async revoke(@Body('id') id: number) {
        try {
            return await this.apiKeyService.revoke(id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
