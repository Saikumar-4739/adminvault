import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RoleEntity } from '../entities/role.entity';
import { returnException } from '@adminvault/backend-utils';
import { CompanyIdRequestModel } from '@adminvault/shared-models';

@ApiTags('IAM Roles')
@Controller('iam/roles')
@UseGuards(PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post('findAll')
    @RequirePermission('Role', 'READ')
    @ApiBody({ type: CompanyIdRequestModel })
    async findAll(@Body() reqModel: CompanyIdRequestModel) {
        try {
            return await this.rolesService.findAll(reqModel.id);
        } catch (error) {
            return returnException(error);
        }
    }

    @Post('findOne')
    @RequirePermission('Role', 'READ')
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async findOne(@Body('id') id: number) {
        try {
            return await this.rolesService.findOne(id);
        } catch (error) {
            return returnException(error);
        }
    }

    @Post('create')
    @RequirePermission('Role', 'CREATE')
    @ApiBody({ schema: { properties: { name: { type: 'string' }, permissionIds: { type: 'array', items: { type: 'number' } } } } })
    async create(@Body() data: Partial<RoleEntity> & { permissionIds?: number[] }) {
        try {
            const { permissionIds, ...roleData } = data;
            return await this.rolesService.create(roleData, permissionIds);
        } catch (error) {
            return returnException(error);
        }
    }

    @Post('update')
    @RequirePermission('Role', 'UPDATE')
    @ApiBody({ schema: { properties: { id: { type: 'number' }, name: { type: 'string' }, permissionIds: { type: 'array', items: { type: 'number' } } } } })
    async update(@Body() data: Partial<RoleEntity> & { id: number, permissionIds?: number[] }) {
        try {
            const { id, permissionIds, ...roleData } = data;
            return await this.rolesService.update(id, roleData, permissionIds);
        } catch (error) {
            return returnException(error);
        }
    }

    @Post('delete')
    @RequirePermission('Role', 'DELETE')
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async delete(@Body('id') id: number) {
        try {
            return await this.rolesService.delete(id);
        } catch (error) {
            return returnException(error);
        }
    }
}
