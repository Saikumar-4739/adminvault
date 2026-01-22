import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PasswordVaultService } from './password-vault.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import { CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, GetAllVaultEntriesModel, GetVaultEntryModel, DeleteVaultEntryModel, GetDecryptedPasswordModel, SearchVaultByCategoryModel, ToggleVaultFavoriteModel, GetVaultCategoriesModel, GetVaultEntryResponseModel, GetVaultCategoriesResponseModel, GetDecryptedPasswordResponseModel } from '@adminvault/shared-models';

@ApiTags('Password Vault')
@Controller('administration/password-vault')
@UseGuards(JwtAuthGuard)
export class VaultController {
    constructor(private readonly vaultService: PasswordVaultService) { }

    @Post('getAllVaultEntries')
    @ApiBody({ type: GetAllVaultEntriesModel })
    async findAllVaultEntries(@Body() reqModel: GetAllVaultEntriesModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.vaultService.findAllVaultEntries(reqModel);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('getVaultEntry')
    @ApiBody({ type: GetVaultEntryModel })
    async findOneVaultEntry(@Body() reqModel: GetVaultEntryModel): Promise<GetVaultEntryResponseModel> {
        try {
            return await this.vaultService.findOneVaultEntry(reqModel);
        } catch (error) {
            return returnException(GetVaultEntryResponseModel, error);
        }
    }

    @Post('createVaultEntry')
    @ApiBody({ type: CreatePasswordVaultModel })
    async createVaultEntry(@Body() reqModel: CreatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            return await this.vaultService.createVaultEntry(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateVaultEntry')
    @ApiBody({ type: UpdatePasswordVaultModel })
    async updateVaultEntry(@Body() reqModel: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            return await this.vaultService.updateVaultEntry(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteVaultEntry')
    @ApiBody({ type: DeleteVaultEntryModel })
    async deleteVaultEntry(@Body() reqModel: DeleteVaultEntryModel): Promise<GlobalResponse> {
        try {
            return await this.vaultService.deleteVaultEntry(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getDecryptedVaultPassword')
    @ApiBody({ type: GetDecryptedPasswordModel })
    async getDecryptedVaultPassword(@Body() reqModel: GetDecryptedPasswordModel): Promise<GetDecryptedPasswordResponseModel> {
        try {
            return await this.vaultService.getDecryptedVaultPassword(reqModel);
        } catch (error) {
            return returnException(GetDecryptedPasswordResponseModel, error);
        }
    }

    @Post('searchVaultByCategory')
    @ApiBody({ type: SearchVaultByCategoryModel })
    async searchVaultByCategory(@Body() reqModel: SearchVaultByCategoryModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.vaultService.searchVaultByCategory(reqModel);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('toggleVaultFavorite')
    @ApiBody({ type: ToggleVaultFavoriteModel })
    async toggleVaultFavorite(@Body() reqModel: ToggleVaultFavoriteModel): Promise<GlobalResponse> {
        try {
            return await this.vaultService.toggleVaultFavorite(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getVaultCategories')
    @ApiBody({ type: GetVaultCategoriesModel })
    async getVaultCategories(@Body() reqModel: GetVaultCategoriesModel): Promise<GetVaultCategoriesResponseModel> {
        try {
            return await this.vaultService.getVaultCategories(reqModel);
        } catch (error) {
            return returnException(GetVaultCategoriesResponseModel, error);
        }
    }
}
