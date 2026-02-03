import { Controller, Get, Post, Body, Req, UseGuards, Patch, Delete } from '@nestjs/common';
import { IamService } from './iam.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IAuthenticatedRequest } from '../../interfaces/auth.interface';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';

@ApiTags('IAM')
@Controller('iam')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IamController {
    constructor(
        private readonly iamService: IamService,
        @InjectRepository(AuthUsersEntity)
        private readonly authRepo: Repository<AuthUsersEntity>
    ) { }

    @Get('my-menus')
    @ApiOperation({ summary: 'Get allowed menus for current user' })
    async getMyMenus(@Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            let role = req.user.role;
            const userId = req.user.userId;

            // Fallback for old tokens
            if (!role) {
                const user = await this.authRepo.findOne({ where: { id: userId } });
                role = user?.userRole;
            }

            const menus = await this.iamService.getEffectiveMenusForUser(Number(userId), role?.toLowerCase() as any);
            return new GlobalResponse(true, 0, 'Menus retrieved', menus);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Get('roles')
    @ApiOperation({ summary: 'Get all user roles' })
    async getAllRoles(): Promise<GlobalResponse> {
        try {
            const roles = await this.iamService.getAllRoles();
            return new GlobalResponse(true, 0, 'Roles retrieved', roles);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Get('all-menus')
    @ApiOperation({ summary: 'Get all configured menu keys' })
    async getAllAvailableMenus(): Promise<GlobalResponse> {
        try {
            const menus = await this.iamService.getAllAvailableMenus();
            return new GlobalResponse(true, 0, 'Menus retrieved', menus);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Get('role-menus/all')
    @ApiOperation({ summary: 'Get all role-menu mappings' })
    async getAllRoleMenus(): Promise<GlobalResponse> {
        try {
            const mappings = await this.iamService.getAllRoleMenus();
            return new GlobalResponse(true, 0, 'Mappings retrieved', mappings);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('role-menus/update')
    @ApiOperation({ summary: 'Update menu permissions for a role' })
    async updateRoleMenus(@Body() body: { role: string, assignments: { menuKey: string, permissions: any }[] }): Promise<GlobalResponse> {
        try {
            await this.iamService.updateRoleMenus(body.role as any, body.assignments);
            return new GlobalResponse(true, 0, 'Permissions updated successfully');
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // System Menu Management
    @Get('menus')
    @ApiOperation({ summary: 'Get all system menus (Full Tree)' })
    async getAllMenus(): Promise<GlobalResponse> {
        try {
            const menus = await this.iamService.getAllMenus();
            return new GlobalResponse(true, 0, 'System menus retrieved', menus);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('menus')
    @ApiOperation({ summary: 'Create a new system menu' })
    async createMenu(@Body() dto: any): Promise<GlobalResponse> {
        try {
            const menu = await this.iamService.createMenu(dto);
            return new GlobalResponse(true, 0, 'Menu created successfully', menu);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Patch('menus/:id')
    @ApiOperation({ summary: 'Update a system menu' })
    async updateMenu(@Req() req: any, @Body() dto: any): Promise<GlobalResponse> {
        try {
            const menu = await this.iamService.updateMenu(Number(req.params.id), dto);
            return new GlobalResponse(true, 0, 'Menu updated successfully', menu);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Delete('menus/:id')
    @ApiOperation({ summary: 'Delete a system menu' })
    async deleteMenu(@Req() req: any): Promise<GlobalResponse> {
        try {
            await this.iamService.deleteMenu(Number(req.params.id));
            return new GlobalResponse(true, 0, 'Menu deleted successfully');
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // User-Specific Overrides
    @Get('user-menus/:userId')
    @ApiOperation({ summary: 'Get overrides for a specific user' })
    async getUserOverrides(@Req() req: any): Promise<GlobalResponse> {
        try {
            const overrides = await this.iamService.getUserOverrides(Number(req.params.userId));
            return new GlobalResponse(true, 0, 'User overrides retrieved', overrides);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('user-menus/:userId/update')
    @ApiOperation({ summary: 'Update overrides for a specific user' })
    async updateUserOverrides(@Req() req: any, @Body() body: { assignments: { menuKey: string, permissions: any }[] }): Promise<GlobalResponse> {
        try {
            await this.iamService.updateUserOverrides(Number(req.params.userId), body.assignments);
            return new GlobalResponse(true, 0, 'User overrides updated successfully');
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
