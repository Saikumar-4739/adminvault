import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PasswordVaultService } from './password-vault.service';
import { JwtAuthGuard } from '../auth-users/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Password Vault')
@Controller('password-vault')
@UseGuards(JwtAuthGuard)
export class PasswordVaultController {
    constructor(private readonly passwordVaultService: PasswordVaultService) { }

    @Get()
    @ApiOperation({ summary: 'Get all password entries for user' })
    async findAll(@Req() req: any) {
        const { companyId, id: userId } = req.user;
        return {
            status: true,
            message: 'Password entries retrieved successfully',
            data: await this.passwordVaultService.findAll(companyId, userId),
        };
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all categories' })
    async getCategories(@Req() req: any) {
        const { companyId, id: userId } = req.user;
        return {
            status: true,
            message: 'Categories retrieved successfully',
            data: await this.passwordVaultService.getCategories(companyId, userId),
        };
    }

    @Get('category/:category')
    @ApiOperation({ summary: 'Get entries by category' })
    async findByCategory(@Req() req: any, @Param('category') category: string) {
        const { companyId, id: userId } = req.user;
        return {
            status: true,
            message: 'Password entries retrieved successfully',
            data: await this.passwordVaultService.searchByCategory(companyId, userId, category),
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get password entry by ID' })
    async findOne(@Req() req: any, @Param('id') id: number) {
        const { id: userId } = req.user;
        return {
            status: true,
            message: 'Password entry retrieved successfully',
            data: await this.passwordVaultService.findOne(id, userId),
        };
    }

    @Post()
    @ApiOperation({ summary: 'Create new password entry' })
    async create(@Req() req: any, @Body() body: any) {
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
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update password entry' })
    async update(@Req() req: any, @Param('id') id: number, @Body() body: any) {
        const { id: userId } = req.user;
        const { password, ...data } = body;

        const entry = await this.passwordVaultService.update(id, userId, data, password);

        return {
            status: true,
            message: 'Password entry updated successfully',
            data: entry,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete password entry' })
    async delete(@Req() req: any, @Param('id') id: number) {
        const { id: userId } = req.user;
        const deleted = await this.passwordVaultService.delete(id, userId);

        return {
            status: deleted,
            message: deleted ? 'Password entry deleted successfully' : 'Password entry not found',
        };
    }

    @Post(':id/reveal')
    @ApiOperation({ summary: 'Reveal decrypted password' })
    async revealPassword(@Req() req: any, @Param('id') id: number) {
        const { id: userId } = req.user;
        const password = await this.passwordVaultService.getDecryptedPassword(id, userId);

        return {
            status: true,
            message: 'Password revealed successfully',
            data: { password },
        };
    }

    @Post(':id/favorite')
    @ApiOperation({ summary: 'Toggle favorite status' })
    async toggleFavorite(@Req() req: any, @Param('id') id: number) {
        const { id: userId } = req.user;
        const entry = await this.passwordVaultService.toggleFavorite(id, userId);

        return {
            status: true,
            message: 'Favorite status updated successfully',
            data: entry,
        };
    }
}
