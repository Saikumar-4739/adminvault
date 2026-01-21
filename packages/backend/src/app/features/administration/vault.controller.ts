import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PasswordVaultService } from './password-vault.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import {
    CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel
} from '@adminvault/shared-models';

@ApiTags('Password Vault')
@Controller('administration/password-vault')
@UseGuards(JwtAuthGuard)
export class VaultController {
    constructor(private readonly vaultService: PasswordVaultService) { }

    @Post('get-all')
    async findBatchVault(@Req() req: any): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.vaultService.findAllVaultEntries(req.user.companyId, req.user.id);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('create')
    @ApiBody({ type: CreatePasswordVaultModel })
    async createVault(@Req() req: any, @Body() body: CreatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            body.companyId = req.user.companyId;
            body.userId = req.user.id;
            return await this.vaultService.createVaultEntry(body);
        } catch (error) { return returnException(GlobalResponse, error); }
    }

    @Post('update')
    @ApiBody({ type: UpdatePasswordVaultModel })
    async updateVault(@Body() body: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            return await this.vaultService.updateVaultEntry(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('reveal-password')
    async revealVaultPassword(@Req() req: any, @Body('id') id: number) {
        try {
            const password = await this.vaultService.getDecryptedVaultPassword(id, req.user.id);
            return { status: true, message: 'Success', data: { password } };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
