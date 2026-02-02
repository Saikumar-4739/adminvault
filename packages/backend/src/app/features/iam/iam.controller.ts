import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
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

            // Fallback for old tokens
            if (!role) {
                const user = await this.authRepo.findOne({ where: { id: req.user.userId } });
                role = user?.userRole;
            }

            const menus = await this.iamService.getMenusForRole(role?.toLowerCase() as any);
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
}
