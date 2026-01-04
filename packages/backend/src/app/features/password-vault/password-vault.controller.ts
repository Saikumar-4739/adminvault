import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PasswordVaultService } from './password-vault.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('Password Vault')
@Controller('password-vault')
@UseGuards(JwtAuthGuard)
export class PasswordVaultController {
    constructor(private readonly passwordVaultService: PasswordVaultService) { }

    @Post('get-all')
    @ApiOperation({ summary: 'Get all password entries for user' })
    async findAll(@Req() req: any) {
        try {
            const { companyId, id: userId } = req.user;
            return {
                status: true,
                message: 'Password entries retrieved successfully',
                data: await this.passwordVaultService.findAll(companyId, userId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-categories')
    @ApiOperation({ summary: 'Get all categories' })
    async getCategories(@Req() req: any) {
        try {
            const { companyId, id: userId } = req.user;
            return {
                status: true,
                message: 'Categories retrieved successfully',
                data: await this.passwordVaultService.getCategories(companyId, userId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-by-category')
    @ApiOperation({ summary: 'Get entries by category' })
    @ApiBody({ schema: { properties: { category: { type: 'string' } } } })
    async findByCategory(@Req() req: any, @Body('category') category: string) {
        try {
            const { companyId, id: userId } = req.user;
            return {
                status: true,
                message: 'Password entries retrieved successfully',
                data: await this.passwordVaultService.searchByCategory(companyId, userId, category),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-one')
    @ApiOperation({ summary: 'Get password entry by ID' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async findOne(@Req() req: any, @Body('id') id: number) {
        try {
            const { id: userId } = req.user;
            return {
                status: true,
                message: 'Password entry retrieved successfully',
                data: await this.passwordVaultService.findOne(id, userId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('create')
    @ApiOperation({ summary: 'Create new password entry' })
    @ApiBody({ schema: { type: 'object' } })
    async create(@Req() req: any, @Body() body: any) {
        try {
            const { companyId, id: userId } = req.user;
            const { password, ...data } = body;

            const entry = await this.passwordVaultService.create(
                {
                    ...data,
                    companyId,
                    createdBy: userId,
                },
                password
            );

            return {
                status: true,
                message: 'Password entry created successfully',
                data: entry,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('update')
    @ApiOperation({ summary: 'Update password entry' })
    @ApiBody({ schema: { type: 'object', properties: { id: { type: 'number' } } } })
    async update(@Req() req: any, @Body() body: any) {
        try {
            const { id: userId } = req.user;
            const { id, password, ...data } = body;

            const entry = await this.passwordVaultService.update(id, userId, data, password);

            return {
                status: true,
                message: 'Password entry updated successfully',
                data: entry,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete')
    @ApiOperation({ summary: 'Delete password entry' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async delete(@Req() req: any, @Body('id') id: number) {
        try {
            const { id: userId } = req.user;
            const deleted = await this.passwordVaultService.delete(id, userId);

            return {
                status: deleted,
                message: deleted ? 'Password entry deleted successfully' : 'Password entry not found',
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('reveal-password')
    @ApiOperation({ summary: 'Reveal decrypted password' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async revealPassword(@Req() req: any, @Body('id') id: number) {
        try {
            const { id: userId } = req.user;
            const password = await this.passwordVaultService.getDecryptedPassword(id, userId);

            return {
                status: true,
                message: 'Password revealed successfully',
                data: { password },
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('toggle-favorite')
    @ApiOperation({ summary: 'Toggle favorite status' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async toggleFavorite(@Req() req: any, @Body('id') id: number) {
        try {
            const { id: userId } = req.user;
            const entry = await this.passwordVaultService.toggleFavorite(id, userId);

            return {
                status: true,
                message: 'Favorite status updated successfully',
                data: entry,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
