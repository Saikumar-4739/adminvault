import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { SystemMenuEntity } from './entities/system-menu.entity';
import { UserMenuEntity } from './entities/user-menu.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user-role.entity';
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
    {
        key: 'iam',
        label: 'IAM',
        icon: 'ShieldCheck',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
        children: [
            { key: 'menu-master', label: 'Menu Master', icon: 'AppWindow', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
            { key: 'submenu-master', label: 'Sub Menu Master', icon: 'LayoutGrid', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
            { key: 'user-mapping', label: 'User mapping', icon: 'Users', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN] },
        ]
    },
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
        @InjectRepository(RoleEntity)
        private roleRepo: Repository<RoleEntity>,
        @InjectRepository(UserRoleEntity)
        private userRoleRepo: Repository<UserRoleEntity>,
    ) { }

    async onModuleInit() {
        await this.seedDefaultMenus();
    }

    async seedDefaultMenus() {
        this.logger.debug('Syncing default system menus and role permissions...');

        try {
            let changesCount = 0;

            // Recursive function to seed menus and permissions
            const seedMenuRecursively = async (menuData: any, parentId: number | null = null, displayOrder: number) => {
                let entity = await this.systemMenuRepo.findOne({ where: { key: menuData.key } });

                if (!entity) {
                    entity = new SystemMenuEntity();
                    entity.key = menuData.key;
                    entity.label = menuData.label;
                    entity.icon = menuData.icon;
                    entity.parentId = parentId;
                    entity.displayOrder = displayOrder;
                    await this.systemMenuRepo.save(entity);
                    this.logger.log(`Created system menu: ${menuData.key}`);
                    changesCount++;
                } else {
                    if (entity.label !== menuData.label || entity.icon !== menuData.icon || entity.displayOrder !== displayOrder || Number(entity.parentId) !== Number(parentId)) {
                        entity.label = menuData.label;
                        entity.icon = menuData.icon;
                        entity.displayOrder = displayOrder;
                        entity.parentId = parentId;
                        await this.systemMenuRepo.save(entity);
                        this.logger.log(`Updated system menu: ${menuData.key}`);
                        changesCount++;
                    }
                }

                // Seed Permissions for this menu
                const fullPermissions = { create: true, read: true, update: true, delete: true };
                const readOnlyPermissions = { create: false, read: true, update: false, delete: false };

                for (const role of menuData.roles) {
                    const exists = await this.roleMenuRepo.findOne({
                        where: { roleKey: role as any, menuKey: menuData.key }
                    });

                    const targetPermissions = (role === UserRoleEnum.ADMIN || role === UserRoleEnum.SUPER_ADMIN)
                        ? fullPermissions
                        : readOnlyPermissions;

                    if (!exists) {
                        const permEntity = new RoleMenuEntity();
                        permEntity.roleKey = role as any;
                        permEntity.menuKey = menuData.key;
                        permEntity.isActive = true;
                        permEntity.permissions = targetPermissions;
                        await this.roleMenuRepo.save(permEntity);
                        this.logger.log(`Added missing menu permission: ${menuData.key} for role ${role}`);
                        changesCount++;
                    } else if (!this.arePermissionsEqual(exists.permissions, targetPermissions)) {
                        exists.permissions = targetPermissions;
                        await this.roleMenuRepo.save(exists);
                        this.logger.log(`Updated permissions for menu ${menuData.key} role ${role}`);
                        changesCount++;
                    }
                }

                // Recurse for children
                if (menuData.children && menuData.children.length > 0) {
                    for (let j = 0; j < menuData.children.length; j++) {
                        await seedMenuRecursively(menuData.children[j], Number(entity.id), j);
                    }
                }
            };

            for (let i = 0; i < DEFAULT_MENUS.length; i++) {
                await seedMenuRecursively(DEFAULT_MENUS[i], null, i);
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

        const basicEqual = p1.create === p2.create &&
            p1.read === p2.read &&
            p1.update === p2.update &&
            p1.delete === p2.delete;

        if (!basicEqual) return false;

        // Compare scopes
        const s1 = p1.scopes || [];
        const s2 = p2.scopes || [];
        if (s1.length !== s2.length) return false;
        return s1.every((s: string) => s2.includes(s));
    }

    // Effective Permissions for User (Merged from multiple roles)
    async getEffectiveMenusForUser(userId: number): Promise<any[]> {
        const userRoles = await this.userRoleRepo.find({ where: { userId, isActive: true } });
        const roleKeys = userRoles.map(ur => ur.roleKey);

        const allSystemMenus = await this.systemMenuRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });

        // Get permissions from all assigned roles
        const rolePermissions = await this.roleMenuRepo.find({
            where: roleKeys.length > 0 ? roleKeys.map(rk => ({ roleKey: rk, isActive: true })) : { isActive: false }
        });

        const userOverrides = await this.userMenuRepo.find({ where: { userId, isActive: true } });

        const effectiveMenus = allSystemMenus.map(menu => {
            const override = userOverrides.find(o => o.menuKey === menu.key);

            // Merge permissions from all roles for this menu
            const relevantRolePerms = rolePermissions.filter(p => p.menuKey === menu.key);

            let mergedRolePerms = { create: false, read: false, update: false, delete: false, scopes: [] as string[] };

            relevantRolePerms.forEach(rp => {
                mergedRolePerms.create = mergedRolePerms.create || rp.permissions.create;
                mergedRolePerms.read = mergedRolePerms.read || rp.permissions.read;
                mergedRolePerms.update = mergedRolePerms.update || rp.permissions.update;
                mergedRolePerms.delete = mergedRolePerms.delete || rp.permissions.delete;
                if (rp.permissions.scopes) {
                    mergedRolePerms.scopes = Array.from(new Set([...mergedRolePerms.scopes, ...rp.permissions.scopes]));
                }
            });

            let permissions = override?.permissions || mergedRolePerms;

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
    async getAllRoles(): Promise<RoleEntity[]> {
        return await this.roleRepo.find({ where: { isActive: true } });
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

    async createRole(dto: any): Promise<RoleEntity> {
        const role = new RoleEntity();
        Object.assign(role, dto);
        return await this.roleRepo.save(role);
    }

    async updateRole(id: number, dto: any): Promise<RoleEntity> {
        const role = await this.roleRepo.findOne({ where: { id: id as any } });
        if (!role) throw new NotFoundException('Role not found');
        Object.assign(role, dto);
        return await this.roleRepo.save(role);
    }

    async deleteRole(id: number): Promise<void> {
        await this.roleRepo.delete(id);
    }

    // Role to Menu Mapping
    async updateRoleMenus(roleKey: string, menuAssignments: { menuKey: string, permissions: any }[]): Promise<void> {
        await this.roleMenuRepo.update({ roleKey }, { isActive: false });

        for (const assignment of menuAssignments) {
            let entity = await this.roleMenuRepo.findOne({
                where: { roleKey, menuKey: assignment.menuKey }
            });

            if (entity) {
                entity.isActive = true;
                entity.permissions = assignment.permissions;
                await this.roleMenuRepo.save(entity);
            } else {
                entity = new RoleMenuEntity();
                entity.roleKey = roleKey;
                entity.menuKey = assignment.menuKey;
                entity.permissions = assignment.permissions;
                entity.isActive = true;
                await this.roleMenuRepo.save(entity);
            }
        }
    }

    async getMenusForRole(roleKey: string): Promise<string[]> {
        const menus = await this.roleMenuRepo.find({
            where: { roleKey, isActive: true }
        });
        return menus.map(m => m.menuKey);
    }

    // User to Role Mapping
    async getUserRoles(userId: number): Promise<UserRoleEntity[]> {
        return await this.userRoleRepo.find({ where: { userId, isActive: true } });
    }

    async updateUserRoles(userId: number, roleKeys: string[]): Promise<void> {
        await this.userRoleRepo.update({ userId }, { isActive: false });

        for (const roleKey of roleKeys) {
            let entity = await this.userRoleRepo.findOne({
                where: { userId, roleKey }
            });

            if (entity) {
                entity.isActive = true;
                await this.userRoleRepo.save(entity);
            } else {
                entity = new UserRoleEntity();
                entity.userId = userId;
                entity.roleKey = roleKey;
                entity.isActive = true;
                await this.userRoleRepo.save(entity);
            }
        }
    }
}
