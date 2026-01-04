import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PermissionEntity } from '../../../entities/permission.entity';

@Injectable()
export class PermissionsService {
    private readonly permissionRepo: Repository<PermissionEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.permissionRepo = this.dataSource.getRepository(PermissionEntity);
    }

    async findAll() {
        return this.permissionRepo.find();
    }

    async findByResource(resource: string) {
        return this.permissionRepo.find({ where: { resource } });
    }

    async create(data: Partial<PermissionEntity>) {
        const permission = this.permissionRepo.create(data);
        return this.permissionRepo.save(permission);
    }

    async seedPermissions() {
        const permissions = [
            // ASSETS
            { name: 'View Assets', code: 'assets.view', resource: 'Asset', action: 'READ', description: 'View company assets' },
            { name: 'Update Assets', code: 'assets.update', resource: 'Asset', action: 'UPDATE', description: 'Update asset information' },
            { name: 'Delete Assets', code: 'assets.delete', resource: 'Asset', action: 'DELETE', description: 'Remove assets from system' },
            // USERS
            { name: 'View Users', code: 'users.view', resource: 'User', action: 'READ', description: 'View list of users' },
            { name: 'Manage Roles', code: 'roles.manage', resource: 'Role', action: 'UPDATE', description: 'Assign roles to users' },
            // AUDIT
            { name: 'View Audit Logs', code: 'audit.view', resource: 'AuditLog', action: 'READ', description: 'View system audit logs' },
            // WORKFLOWS
            { name: 'Approve Workflows', code: 'workflows.approve', resource: 'Workflow', action: 'EXECUTE', description: 'Approve or reject workflow steps' },
        ];

        for (const p of permissions) {
            const exists = await this.permissionRepo.findOne({ where: { code: p.code } });
            if (!exists) {
                await this.permissionRepo.save(this.permissionRepo.create(p));
            }
        }
    }
}
