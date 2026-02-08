import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { SystemMenuEntity } from './entities/system-menu.entity';
import { UserMenuEntity } from './entities/user-menu.entity';
import { UserRoleEnum, CreateMenuDto, UpdateMenuDto } from '@adminvault/shared-models';

const DEFAULT_MENUS = [
    // Main
    { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    { key: 'masters', label: 'Masters', icon: 'Settings2', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    { key: 'reports', label: 'Reports', icon: 'BarChart3', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER] },
    { key: 'emails', label: 'Emails', icon: 'Mail', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    // Resources
    { key: 'employees', label: 'Employees', icon: 'Users', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER] },
    { key: 'assets', label: 'Assets', icon: 'Laptop', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER] },
    { key: 'procurement', label: 'Procurement', icon: 'ShoppingCart', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    { key: 'licenses', label: 'Licenses', icon: 'Key', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    // Network
    { key: 'network', label: 'Network', icon: 'Network', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    { key: 'approvals', label: 'Approvals', icon: 'CheckSquare', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER] },
    { key: 'iam', label: 'IAM', icon: 'ShieldCheck', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
    // Support
    { key: 'tickets', label: 'Tickets', icon: 'Ticket', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    { key: 'create-ticket', label: 'Create Ticket', icon: 'PlusCircle', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    // Account
    { key: 'profile', label: 'Profile', icon: 'UserCircle', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
    { key: 'knowledge-base', label: 'Knowledge Base', icon: 'BookOpen', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER] },
];

@Injectable()
export class IamService implements OnModuleInit {
    private readonly logger = new Logger(IamService.name);

    constructor(
        @InjectRepository(RoleMenuEntity)
        private roleMenuRepo: Repository<RoleMenuEntity>,
        @InjectRepository(SystemMenuEntity)
        private systemMenuRepo: Repository<SystemMenuEntity>,
        @InjectRepository(UserMenuEntity)
        private userMenuRepo: Repository<UserMenuEntity>,
    ) { }

    async onModuleInit() {
        // await this.seedDefaultMenus();
    }

    async seedDefaultMenus() {
        // this.logger.debug('Syncing default system menus and role permissions...');

        try {
            let changesCount = 0;

            // 1. Seed System Menus
            for (let i = 0; i < DEFAULT_MENUS.length; i++) {
                const menu = DEFAULT_MENUS[i];
                let entity = await this.systemMenuRepo.findOne({ where: { key: menu.key } });

                if (!entity) {
                    entity = new SystemMenuEntity();
                    entity.key = menu.key;
                    entity.label = menu.label;
                    entity.icon = menu.icon;
                    entity.displayOrder = i;
                    await this.systemMenuRepo.save(entity);
                    this.logger.log(`Created system menu: ${menu.key}`);
                    changesCount++;
                } else {
                    // Update if different
                    if (entity.label !== menu.label || entity.icon !== menu.icon || entity.displayOrder !== i) {
                        entity.label = menu.label;
                        entity.icon = menu.icon;
                        entity.displayOrder = i;
                        await this.systemMenuRepo.save(entity);
                        this.logger.log(`Updated system menu: ${menu.key}`);
                        changesCount++;
                    }
                }
            }

            // 2. Seed Role Menus (Permissions)
            const fullPermissions = { create: true, read: true, update: true, delete: true };
            const readOnlyPermissions = { create: false, read: true, update: false, delete: false };

            for (const menu of DEFAULT_MENUS) {
                for (const role of menu.roles) {
                    const exists = await this.roleMenuRepo.findOne({
                        where: { role, menuKey: menu.key }
                    });

                    const targetPermissions = (role === UserRoleEnum.ADMIN || role === UserRoleEnum.SUPER_ADMIN)
                        ? fullPermissions
                        : readOnlyPermissions;

                    if (!exists) {
                        const entity = new RoleMenuEntity();
                        entity.role = role;
                        entity.menuKey = menu.key;
                        entity.isActive = true;
                        entity.permissions = targetPermissions;
                        await this.roleMenuRepo.save(entity);
                        this.logger.log(`Added missing menu permission: ${menu.key} for role ${role}`);
                        changesCount++;
                    } else {
                        // Check deep equality for permissions
                        if (!this.arePermissionsEqual(exists.permissions, targetPermissions)) {
                            exists.permissions = targetPermissions;
                            await this.roleMenuRepo.save(exists);
                            this.logger.log(`Updated permissions for menu ${menu.key} role ${role}`);
                            changesCount++;
                        }
                    }
                }
            }

            if (changesCount > 0) {
                this.logger.log(`IAM sync complete. ${changesCount} changes applied.`);
            }
        } catch (error) {
            this.logger.error('Failed to sync IAM menus', error);
        }
    }

    private arePermissionsEqual(p1: any, p2: any): boolean {
        if (!p1 || !p2) return false;
        return p1.create === p2.create &&
            p1.read === p2.read &&
            p1.update === p2.update &&
            p1.delete === p2.delete;
    }

    // Effective Permissions for User (Merged)
    async getEffectiveMenusForUser(userId: number, role: UserRoleEnum): Promise<any[]> {
        const allSystemMenus = await this.systemMenuRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
        const rolePermissions = await this.roleMenuRepo.find({ where: { role, isActive: true } });
        const userOverrides = await this.userMenuRepo.find({ where: { userId, isActive: true } });

        const effectiveMenus = allSystemMenus.map(menu => {
            const override = userOverrides.find(o => o.menuKey === menu.key);
            const rolePerm = rolePermissions.find(p => p.menuKey === menu.key);
            let permissions = override?.permissions || rolePerm?.permissions;

            if (!permissions) {
                permissions = { create: false, read: false, update: false, delete: false };
            }

            return {
                ...menu,
                permissions
            };
        });

        return effectiveMenus.filter(m => m.permissions.read);
    }

    // User-Specific Overrides CRUD
    async getUserOverrides(userId: number): Promise<UserMenuEntity[]> {
        return await this.userMenuRepo.find({ where: { userId, isActive: true } });
    }

    async updateUserOverrides(userId: number, assignments: { menuKey: string, permissions: any }[]): Promise<void> {
        await this.userMenuRepo.update({ userId }, { isActive: false });

        for (const assignment of assignments) {
            let entity = await this.userMenuRepo.findOne({
                where: { userId, menuKey: assignment.menuKey }
            });

            if (entity) {
                entity.isActive = true;
                entity.permissions = assignment.permissions;
                await this.userMenuRepo.save(entity);
            } else {
                entity = new UserMenuEntity();
                entity.userId = userId;
                entity.menuKey = assignment.menuKey;
                entity.permissions = assignment.permissions;
                entity.isActive = true;
                await this.userMenuRepo.save(entity);
            }
        }
    }

    // System Menu CRUD
    async getAllMenus(): Promise<SystemMenuEntity[]> {
        return await this.systemMenuRepo.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC' },
            relations: ['children']
        });
    }

    async createMenu(dto: CreateMenuDto): Promise<SystemMenuEntity> {
        const menu = new SystemMenuEntity();
        Object.assign(menu, dto);
        return await this.systemMenuRepo.save(menu);
    }

    async updateMenu(id: number, dto: UpdateMenuDto): Promise<SystemMenuEntity> {
        const menu = await this.systemMenuRepo.findOne({ where: { id } });
        if (!menu) throw new NotFoundException('Menu not found');
        Object.assign(menu, dto);
        return await this.systemMenuRepo.save(menu);
    }

    async deleteMenu(id: number): Promise<void> {
        await this.systemMenuRepo.delete(id);
    }

    // IAM Role Matrix
    async getAllRoles(): Promise<string[]> {
        return Object.values(UserRoleEnum);
    }

    async getAllAvailableMenus(): Promise<string[]> {
        const menus = await this.systemMenuRepo.find({ where: { isActive: true } });
        return menus.map(m => m.key);
    }

    async getAllRoleMenus(): Promise<RoleMenuEntity[]> {
        return await this.roleMenuRepo.find({
            where: { isActive: true }
        });
    }

    async updateRoleMenus(role: UserRoleEnum, menuAssignments: { menuKey: string, permissions: any }[]): Promise<void> {
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
