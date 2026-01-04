import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class RolesService {
    private readonly roleRepo: Repository<RoleEntity>;
    private readonly permissionRepo: Repository<PermissionEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.roleRepo = this.dataSource.getRepository(RoleEntity);
        this.permissionRepo = this.dataSource.getRepository(PermissionEntity);
    }

    async findAll(companyId?: number) {
        return this.roleRepo.find({
            where: companyId ? { companyId } : {},
            relations: ['permissions']
        });
    }

    async findOne(id: number) {
        const role = await this.roleRepo.findOne({
            where: { id },
            relations: ['permissions']
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async create(data: Partial<RoleEntity>, permissionIds?: number[]) {
        const role = this.roleRepo.create(data);
        if (permissionIds && permissionIds.length > 0) {
            role.permissions = await this.permissionRepo.findByIds(permissionIds);
        }
        return this.roleRepo.save(role);
    }

    async update(id: number, data: Partial<RoleEntity>, permissionIds?: number[]) {
        const role = await this.findOne(id);
        Object.assign(role, data);
        if (permissionIds) {
            role.permissions = await this.permissionRepo.findByIds(permissionIds);
        }
        return this.roleRepo.save(role);
    }

    async delete(id: number) {
        const role = await this.findOne(id);
        if (role.isSystemRole) {
            throw new Error('System roles cannot be deleted');
        }
        return this.roleRepo.remove(role);
    }
}
