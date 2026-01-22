import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PasswordVaultService } from './password-vault.service';
import { CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, CreatePasswordVaultResponseModel, UpdatePasswordVaultResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Password Vault Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class PasswordVaultController {
    constructor(private passwordVaultService: PasswordVaultService) { }

    @Post('getAllPasswordVaults')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllPasswordVaults(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.passwordVaultService.getAllPasswordVaults(reqModel);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('password-vaults')
    @ApiBody({ type: CreatePasswordVaultModel })
    async createPasswordVault(@Body() data: CreatePasswordVaultModel, @Req() req: any): Promise<CreatePasswordVaultResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.passwordVaultService.createPasswordVault(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreatePasswordVaultResponseModel, error);
        }
    }

    @Post('updatePasswordVault')
    @ApiBody({ type: UpdatePasswordVaultModel })
    async updatePasswordVault(@Body() data: UpdatePasswordVaultModel, @Req() req: any): Promise<UpdatePasswordVaultResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.passwordVaultService.updatePasswordVault(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdatePasswordVaultResponseModel, error);
        }
    }

    @Post('deletePasswordVault')
    @ApiBody({ type: IdRequestModel })
    async deletePasswordVault(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.passwordVaultService.deletePasswordVault(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
