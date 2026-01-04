import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RoleEntity } from '../../../entities/role.entity';

@Controller('iam/roles')
@UseGuards(PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    @RequirePermission('Role', 'READ')
    async findAll(@Query('companyId') companyId?: string) {
        return this.rolesService.findAll(companyId ? parseInt(companyId) : undefined);
    }

    @Get(':id')
    @RequirePermission('Role', 'READ')
    async findOne(@Param('id') id: string) {
        return this.rolesService.findOne(parseInt(id));
    }

    @Post()
    @RequirePermission('Role', 'CREATE')
    async create(@Body() data: Partial<RoleEntity>, @Body('permissionIds') permissionIds?: number[]) {
        return this.rolesService.create(data, permissionIds);
    }

    @Put(':id')
    @RequirePermission('Role', 'UPDATE')
    async update(@Param('id') id: string, @Body() data: Partial<RoleEntity>, @Body('permissionIds') permissionIds?: number[]) {
        return this.rolesService.update(parseInt(id), data, permissionIds);
    }

    @Delete(':id')
    @RequirePermission('Role', 'DELETE')
    async delete(@Param('id') id: string) {
        return this.rolesService.delete(parseInt(id));
    }
}
