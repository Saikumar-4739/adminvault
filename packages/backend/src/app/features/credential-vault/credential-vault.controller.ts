import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CredentialVaultService } from './credential-vault.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Credential Vault')
@Controller('credential-vault')
@UseGuards(JwtAuthGuard)
export class CredentialVaultController {
    constructor(private readonly service: CredentialVaultService) { }

    @Post('create')
    @ApiOperation({ summary: 'Securely store a new credential' })
    async create(@Request() req: any, @Body() data: any) {
        return this.service.createCredential(req.user.id, req.user.companyId, data);
    }

    @Get('list')
    @ApiOperation({ summary: 'List all credentials for the company' })
    async list(@Request() req: any) {
        return this.service.getCredentials(req.user.companyId);
    }

    @Get('reveal/:id')
    @ApiOperation({ summary: 'Decrypt and reveal a password' })
    async reveal(@Param('id') id: string) {
        return this.service.revealPassword(Number(id));
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete a credential' })
    async remove(@Param('id') id: string) {
        return this.service.deleteCredential(Number(id));
    }
}
