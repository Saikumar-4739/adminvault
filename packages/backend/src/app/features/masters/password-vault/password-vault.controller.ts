import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PasswordVaultService } from './password-vault.service';
import { CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Password Vault Master')
@Controller('password-vaults')
@UseGuards(JwtAuthGuard)
export class PasswordVaultController {
    constructor(private passwordVaultService: PasswordVaultService) { }

    @Post('getAllPasswordVaults')
    async getAllPasswordVaults(): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.passwordVaultService.getAllPasswordVaults();
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('password-vaults')
    @ApiBody({ type: CreatePasswordVaultModel })
    async createPasswordVault(@Body() reqModel: CreatePasswordVaultModel, @Req() req: any): Promise<GlobalResponse> {
        reqModel.userId = req.user.userId;
        try {
            return await this.passwordVaultService.createPasswordVault(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updatePasswordVault')
    @ApiBody({ type: UpdatePasswordVaultModel })
    async updatePasswordVault(@Body() reqModel: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            return await this.passwordVaultService.updatePasswordVault(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deletePasswordVault')
    @ApiBody({ type: IdRequestModel })
    async deletePasswordVault(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.passwordVaultService.deletePasswordVault(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
