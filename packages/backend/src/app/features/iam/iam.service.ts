import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { UserRoleEnum } from '@adminvault/shared-models';

const DEFAULT_MENUS = [
    // Main
    { key: 'dashboard', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    { key: 'masters', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    { key: 'reports', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER] },
    { key: 'emails', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    // Resources
    { key: 'employees', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER] }, // User needs profile? No, employees list usually restricted
    { key: 'assets', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER] },
    { key: 'procurement', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    { key: 'licenses', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    // Network
    { key: 'network', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    { key: 'approvals', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER] },
    { key: 'iam', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    // Support
    { key: 'tickets', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    { key: 'create-ticket', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    // Account
    { key: 'profile', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    { key: 'knowledge-base', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    // Employees special case: If standard user needs to see directory, add USER. Assuming Admin/Manager for edit.
];

@Injectable()
export class IamService implements OnModuleInit {
    private readonly logger = new Logger(IamService.name);

    constructor(
        @InjectRepository(RoleMenuEntity)
        private roleMenuRepo: Repository<RoleMenuEntity>,
    ) { }

    async onModuleInit() {
        await this.seedDefaultMenus();
    }

    async seedDefaultMenus() {
        this.logger.log('Syncing default role menus with CRUD permissions...');

        const fullPermissions = { create: true, read: true, update: true, delete: true };
        const readOnlyPermissions = { create: false, read: true, update: false, delete: false };

        for (const menu of DEFAULT_MENUS) {
            for (const role of menu.roles) {
                // Check if permission already exists
                const exists = await this.roleMenuRepo.findOne({
                    where: { role, menuKey: menu.key }
                });

                if (!exists) {
                    const entity = new RoleMenuEntity();
                    entity.role = role;
                    entity.menuKey = menu.key;
                    entity.isActive = true;
                    // Admins get full, others get read-only by default in seed
                    entity.permissions = (role === UserRoleEnum.ADMIN || role === UserRoleEnum.SUPER_ADMIN)
                        ? fullPermissions
                        : readOnlyPermissions;
                    await this.roleMenuRepo.save(entity);
                    this.logger.log(`Added missing menu permission: ${menu.key} for role ${role}`);
                }
            }
        }
        this.logger.log('Menu permissions sync complete.');
    }

    async getAllRoles(): Promise<string[]> {
        return Object.values(UserRoleEnum);
    }

    async getAllAvailableMenus(): Promise<string[]> {
        const uniqueMenus = Array.from(new Set(DEFAULT_MENUS.map(m => m.key)));
        return uniqueMenus;
    }

    async getAllRoleMenus(): Promise<RoleMenuEntity[]> {
        return await this.roleMenuRepo.find({
            where: { isActive: true }
        });
    }

    async updateRoleMenus(role: UserRoleEnum, menuAssignments: { menuKey: string, permissions: any }[]): Promise<void> {
        // Deactivate old permissions for this role
        await this.roleMenuRepo.update({ role }, { isActive: false });

        for (const assignment of menuAssignments) {
            let entity = await this.roleMenuRepo.findOne({
                where: { role, menuKey: assignment.menuKey }
            });

            if (entity) {
                entity.isActive = true;
                entity.permissions = assignment.permissions;
                await this.roleMenuRepo.save(entity);
            } else {
                entity = new RoleMenuEntity();
                entity.role = role;
                entity.menuKey = assignment.menuKey;
                entity.permissions = assignment.permissions;
                entity.isActive = true;
                await this.roleMenuRepo.save(entity);
            }
        }
    }

    async getMenusForRole(role: UserRoleEnum): Promise<string[]> {
        const menus = await this.roleMenuRepo.find({
            where: { role, isActive: true }
        });
        return menus.map(m => m.menuKey);
    }
}
