import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { MFASettingsEntity } from './entities/mfa-settings.entity';
import { APIKeyEntity } from './entities/api-key.entity';
import { SSOProviderEntity } from './entities/sso-provider.entity';
import { PermissionRepository } from './repositories/permission.repository';
import { MFASettingsRepository } from './repositories/mfa-settings.repository';
import { APIKeyRepository } from './repositories/api-key.repository';
import { SSOProviderRepository } from './repositories/sso-provider.repository';
import { RoleRepository } from './repositories/role.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { AuthUsersService } from '../auth-users/auth-users.service';
import { MenuRepository } from './repositories/menu.repository';
import { RoleMenuAccessRepository } from './repositories/role-menu-access.repository';
import { UserPermissionRepository } from './repositories/user-permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { ScopeRepository } from './repositories/scope.repository';
import { ScopeEntity } from './entities/scope.entity';
import { MenuEntity } from './entities/menu.entity';
import { RoleMenuAccessEntity } from './entities/role-menu-access.entity';
import {
    CreateRoleModel,
    UpdateRoleModel,
    RoleResponseModel,
    GetAllRolesResponseModel,
    EnableMFAModel,
    VerifyMFAModel,
    CreateAPIKeyModel,
    APIKeyResponseModel,
    CreateSSOProviderModel,
    UpdateSSOProviderModel,
    GlobalResponse,
    EmployeeStatusEnum,
    RegisterUserModel,
    UserRoleEnum,
    CreateMenuModel,
    UpdateMenuModel,
    CreateScopeModel,
    UpdateScopeModel,
    ScopeResponseModel,
    GetAllScopesResponseModel,
    MenuResponseModel
} from '@adminvault/shared-models';

@Injectable()
export class IAMService implements OnModuleInit {
    constructor(
        private readonly roleRepo: RoleRepository,
        private readonly permissionRepo: PermissionRepository,
        private readonly mfaRepo: MFASettingsRepository,
        private readonly apiKeyRepo: APIKeyRepository,
        private readonly ssoRepo: SSOProviderRepository,
        private readonly rolePermRepo: RolePermissionRepository,
        private readonly employeesRepo: EmployeesRepository,
        private readonly menuRepo: MenuRepository,
        private readonly roleMenuRepo: RoleMenuAccessRepository,
        private readonly userPermRepo: UserPermissionRepository,
        private readonly userRoleRepo: UserRoleRepository,
        private readonly scopeRepo: ScopeRepository,
        @InjectRepository(AuthUsersEntity)
        private readonly userRepo: Repository<AuthUsersEntity>,
        @Inject(forwardRef(() => AuthUsersService))
        private readonly authUsersService: AuthUsersService
    ) { }

    async findAllPrincipals(companyId?: number): Promise<any[]> {
        const employees = await this.employeesRepo.find({ where: companyId ? { companyId } : {} });
        const users = await this.userRepo.find({ where: companyId ? { companyId } : {} });

        // Fetch all user roles assignments
        const allUserRoles = await this.userRoleRepo.find();

        // Fetch SSO Providers for mapping names
        const ssoProviders = await this.ssoRepo.find({ where: companyId ? { companyId } : {} });
        const ssoMap = new Map(ssoProviders.map(p => [Number(p.id), p.name]));

        // Map users by email for faster lookup
        const userMap = new Map(users.map(u => [u.email.toLowerCase(), u]));

        // Map roleIds by userId
        const userRolesMap = new Map<number, number[]>();
        allUserRoles.forEach(ur => {
            const current = userRolesMap.get(Number(ur.userId)) || [];
            current.push(Number(ur.roleId));
            userRolesMap.set(Number(ur.userId), current);
        });

        return employees.map(emp => {
            const user = userMap.get(emp.email.toLowerCase());
            const roleIds = user ? (userRolesMap.get(Number(user.id)) || []) : [];

            return {
                id: emp.id, // Employee ID
                userId: user?.id || null, // Linked Auth User ID
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                role: user?.userRole || 'No Access', // Legacy single role display
                roleIds: roleIds, // New multi-role IDs
                departmentId: emp.departmentId,
                status: emp.empStatus === EmployeeStatusEnum.ACTIVE,
                phNumber: emp.phNumber,
                isUserActive: user?.status || false,
                authType: user?.authType || 'NONE',
                ssoProviderName: user?.ssoId ? ssoMap.get(Number(user.ssoId)) : null
            };
        });
    }

    async onModuleInit() {
        // 1. Core Roles Initialization
        const rolesCount = await this.roleRepo.count({ where: { companyId: 1 } });
        if (rolesCount === 0) {
            console.log('IAM: Initializing core security dimensions for primary entity...');
            const coreRoles = [
                { name: 'Super Administrator', code: 'SUPERADMIN', description: 'Total system authority and architectural governance.' },
                { name: 'Administrator', code: 'ADMIN', description: 'Full operational control and security management.' },
                { name: 'Executive Officer', code: 'CEO', description: 'High-level analytical access and strategic oversight.' },
                { name: 'Department Manager', code: 'MANAGER', description: 'Functional unit management and personnel coordination.' },
                { name: 'Standard Associate', code: 'USER', description: 'Standard operational access for daily workflows.' }
            ];

            for (const rData of coreRoles) {
                const role = new RoleEntity();
                role.name = rData.name;
                role.code = rData.code;
                role.companyId = 1;
                role.description = rData.description;
                role.isSystemRole = true;
                await this.roleRepo.save(role);
            }
            console.log('IAM: Core dimensions successfully commissioned.');
        }

        // 2. Default Navigation Hubs Initialization
        const menuCount = await this.menuRepo.count();
        if (menuCount === 0) {
            console.log('IAM: Initializing default navigation architecture...');
            const DEFAULT_NAV = [
                {
                    title: 'System',
                    code: 'NAV_SYSTEM',
                    items: [
                        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', code: 'MENU_DASHBOARD' },
                        { label: 'Configuration', path: '/masters', icon: 'Database', code: 'MENU_MASTERS' },
                        { label: 'All Reports', path: '/reports', icon: 'PieChart', code: 'MENU_REPORTS' },
                    ]
                },
                {
                    title: 'Operations',
                    code: 'NAV_OPERATIONS',
                    items: [
                        { label: 'Asset Inventory', path: '/assets', icon: 'Package', code: 'MENU_ASSETS' },
                        { label: 'Procurement', path: '/procurement', icon: 'ShoppingCart', code: 'MENU_PROCURE' },
                        { label: 'Maintenance', path: '/maintenance', icon: 'Calendar', code: 'MENU_MAINTAIN' },
                        { label: 'Approvals', path: '/approvals', icon: 'GitPullRequest', code: 'MENU_APPROVE' },
                        { label: 'Licenses', path: '/licenses', icon: 'KeySquare', code: 'MENU_LICENSES' },
                    ]
                },
                {
                    title: 'Support Portal',
                    code: 'NAV_SUPPORT_PORTAL',
                    items: [
                        { label: 'My Tickets', path: '/create-ticket?tab=tickets', icon: 'Ticket', code: 'MENU_MY_TICKETS' },
                        { label: 'Submit Ticket', path: '/create-ticket?tab=create', icon: 'Plus', code: 'MENU_SUBMIT_TICKET' },
                    ]
                },
                {
                    title: 'Support & Comms',
                    code: 'NAV_SUPPORT_COMMS',
                    items: [
                        { label: 'Support Tickets', path: '/tickets', icon: 'Ticket', code: 'MENU_TICKETS' },
                        { label: 'Knowledge Base', path: '/knowledge-base', icon: 'Book', code: 'MENU_KB' },
                        { label: 'Document Center', path: '/documents', icon: 'FileText', code: 'MENU_DOCS' },
                    ]
                },
                {
                    title: 'Security & Access',
                    code: 'NAV_SECURITY',
                    items: [
                        { label: 'IAM & SSO', path: '/iam', icon: 'ShieldAlert', code: 'MENU_IAM' },
                    ]
                },
                {
                    title: 'Account',
                    code: 'NAV_ACCOUNT',
                    items: [
                        { label: 'Profile', path: '/profile', icon: 'UserCircle', code: 'MENU_PROFILE' },
                        { label: 'Settings', path: '/settings', icon: 'SettingsIcon', code: 'MENU_SETTINGS' },
                    ]
                }
            ];

            const adminRoles = await this.roleRepo.find({
                where: [
                    { code: 'SUPERADMIN' },
                    { code: 'ADMIN' }
                ]
            });

            let groupSortOrder = 1;
            for (const group of DEFAULT_NAV) {
                const parentMenu = new MenuEntity();
                parentMenu.label = group.title;
                parentMenu.code = group.code;
                parentMenu.sortOrder = groupSortOrder++;
                const savedParent = await this.menuRepo.save(parentMenu);

                // Auto-grant access to Admin roles
                for (const role of adminRoles) {
                    const rma = new RoleMenuAccessEntity();
                    rma.roleId = Number(role.id);
                    rma.menuId = Number(savedParent.id);
                    rma.canRead = true;
                    rma.canCreate = true;
                    rma.canUpdate = true;
                    rma.canDelete = true;
                    rma.canApprove = true;
                    await this.roleMenuRepo.save(rma);
                }

                let itemSortOrder = 1;
                for (const item of group.items) {
                    const menu = new MenuEntity();
                    menu.label = item.label;
                    menu.code = item.code;
                    menu.path = item.path;
                    menu.icon = item.icon;
                    menu.parentId = Number(savedParent.id);
                    menu.sortOrder = itemSortOrder++;
                    const savedMenu = await this.menuRepo.save(menu);

                    // Auto-grant access to Admin roles
                    for (const role of adminRoles) {
                        const rma = new RoleMenuAccessEntity();
                        rma.roleId = Number(role.id);
                        rma.menuId = Number(savedMenu.id);
                        rma.canRead = true;
                        rma.canCreate = true;
                        rma.canUpdate = true;
                        rma.canDelete = true;
                        rma.canApprove = true;
                        await this.roleMenuRepo.save(rma);
                    }
                }
            }
            console.log('IAM: Default navigation architecture successfully deployed.');
        }
    }

    // Roles
    async findAllRoles(companyId?: number): Promise<GetAllRolesResponseModel> {
        const targetCompanyId = Number(companyId);

        // Strategy: Fetch all roles for the company OR system roles
        const roles = await this.roleRepo.find({
            where: targetCompanyId && targetCompanyId !== 1
                ? [{ companyId: targetCompanyId }, { companyId: 1 }]
                : [{ companyId: 1 }]
        });

        const totalRolesInDb = await this.roleRepo.count();
        console.log(`IAM DEBUG: Found ${roles.length} roles for company ${targetCompanyId}. Total roles in DB: ${totalRolesInDb}`);

        // If still no roles found, and it's a critical failure, return system default attempt
        if (roles.length === 0 && targetCompanyId !== 1) {
            console.warn(`IAM WARNING: No roles found for ${targetCompanyId}, falling back to system roles only.`);
            const systemRoles = await this.roleRepo.find({ where: { companyId: 1 } });
            roles.push(...systemRoles);
        }

        const responses = await Promise.all(roles.map(async (r) => {
            const perms = await this.getPermissionsForRole(Number(r.id));
            const menuIds = await this.getMenusForRole(Number(r.id));
            return this.mapRoleToResponse(r, perms, menuIds);
        }));

        return new GetAllRolesResponseModel(true, 200, `Found ${responses.length} roles`, responses);
    }

    async findOneRole(id: number): Promise<RoleResponseModel | null> {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) return null;
        const perms = await this.getPermissionsForRole(id);
        const menuIds = await this.getMenusForRole(id);
        return this.mapRoleToResponse(role, perms, menuIds);
    }

    private async getPermissionsForRole(roleId: number): Promise<PermissionEntity[]> {
        const rolePerms = await this.rolePermRepo.find({ where: { roleId } });
        const permIds = rolePerms.map(rp => Number(rp.permissionId));
        if (permIds.length === 0) return [];
        return this.permissionRepo.find({ where: { id: In(permIds) } });
    }

    private async getMenusForRole(roleId: number): Promise<number[]> {
        const menuAccess = await this.roleMenuRepo.find({ where: { roleId } });
        return menuAccess.map(ma => Number(ma.menuId));
    }

    async createRole(model: CreateRoleModel): Promise<GlobalResponse> {
        const role = new RoleEntity();
        role.name = model.name;
        role.code = model.code;
        role.companyId = model.companyId;
        role.description = model.description || '';
        role.userRole = model.userRole || 'user';

        const saved = await this.roleRepo.save(role);

        if (model.permissionIds && model.permissionIds.length > 0) {
            for (const pId of model.permissionIds) {
                const rp = new RolePermissionEntity();
                rp.roleId = Number(saved.id);
                rp.permissionId = pId;
                await this.rolePermRepo.save(rp);
            }
        }

        if (model.menuIds && model.menuIds.length > 0) {
            for (const mId of model.menuIds) {
                const rma = new RoleMenuAccessEntity();
                rma.roleId = Number(saved.id);
                rma.menuId = mId;
                rma.canRead = true;
                await this.roleMenuRepo.save(rma);
            }
        }

        return new GlobalResponse(true, 201, 'Role created successfully');
    }

    async updateRole(model: UpdateRoleModel): Promise<GlobalResponse> {
        const role = await this.roleRepo.findOne({ where: { id: model.id } });
        if (!role) throw new NotFoundException('Role not found');

        role.name = model.name;
        role.code = model.code || role.code;
        role.description = model.description || role.description;
        if (model.userRole) role.userRole = model.userRole;

        const saved = await this.roleRepo.save(role);

        if (model.permissionIds) {
            await this.rolePermRepo.delete({ roleId: model.id });
            for (const pId of model.permissionIds) {
                const rp = new RolePermissionEntity();
                rp.roleId = model.id;
                rp.permissionId = pId;
                await this.rolePermRepo.save(rp);
            }
        }

        if (model.menuIds) {
            await this.roleMenuRepo.delete({ roleId: model.id });
            for (const mId of model.menuIds) {
                const rma = new RoleMenuAccessEntity();
                rma.roleId = model.id;
                rma.menuId = mId;
                rma.canRead = true;
                await this.roleMenuRepo.save(rma);
            }
        }

        return new GlobalResponse(true, 200, 'Role updated successfully');
    }

    async deleteRole(id: number): Promise<GlobalResponse> {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new NotFoundException('Role not found');
        await this.rolePermRepo.delete({ roleId: id });
        await this.roleRepo.remove(role);
        return new GlobalResponse(true, 200, 'Role deleted successfully');
    }

    private mapRoleToResponse(entity: RoleEntity, permissions: PermissionEntity[] = [], menuIds: number[] = []): RoleResponseModel {
        return new RoleResponseModel(
            Number(entity.id),
            entity.name,
            entity.companyId,
            entity.description,
            permissions,
            entity.code,
            entity.isSystemRole,
            entity.isActive,
            entity.userRole,
            entity.createdAt,
            entity.updatedAt,
            menuIds
        );
    }

    async findAllPermissions() {
        return this.permissionRepo.find();
    }

    async findPermissionsByResource(resource: string) {
        return this.permissionRepo.find({ where: { resource } });
    }

    async createPermission(data: { name: string, code: string, description: string, resource: string, action: string }): Promise<GlobalResponse> {
        try {
            // Check if permission with same code already exists
            const existing = await this.permissionRepo.findOne({ where: { code: data.code } });
            if (existing) {
                throw new BadRequestException(`Permission with code '${data.code}' already exists`);
            }

            const permission = this.permissionRepo.create({
                name: data.name,
                code: data.code,
                description: data.description,
                resource: data.resource,
                action: data.action,
                isActive: true
            });

            await this.permissionRepo.save(permission);
            return new GlobalResponse(true, 201, 'Permission created successfully');
        } catch (error) {
            throw error;
        }
    }

    async updatePermission(data: { id: number, name: string, code: string, description: string, resource: string, action: string }): Promise<GlobalResponse> {
        try {
            const permission = await this.permissionRepo.findOne({ where: { id: data.id } });
            if (!permission) {
                throw new NotFoundException('Permission not found');
            }

            // Check if code is being changed and if new code already exists
            if (data.code !== permission.code) {
                const existing = await this.permissionRepo.findOne({ where: { code: data.code } });
                if (existing) {
                    throw new BadRequestException(`Permission with code '${data.code}' already exists`);
                }
            }

            permission.name = data.name;
            permission.code = data.code;
            permission.description = data.description;
            permission.resource = data.resource;
            permission.action = data.action;

            await this.permissionRepo.save(permission);
            return new GlobalResponse(true, 200, 'Permission updated successfully');
        } catch (error) {
            throw error;
        }
    }

    async deletePermission(id: number): Promise<GlobalResponse> {
        try {
            const permission = await this.permissionRepo.findOne({ where: { id } });
            if (!permission) {
                throw new NotFoundException('Permission not found');
            }

            // Check if permission is being used in any roles
            const rolePerms = await this.rolePermRepo.find({ where: { permissionId: id } });
            if (rolePerms.length > 0) {
                throw new BadRequestException('Cannot delete permission that is assigned to roles. Remove from roles first.');
            }

            await this.permissionRepo.remove(permission);
            return new GlobalResponse(true, 200, 'Permission deleted successfully');
        } catch (error) {
            throw error;
        }
    }



    // MFA
    async generateMFASetupData(userId: number): Promise<any> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'AdminVault', secret);
        const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

        return { secret, qrCodeDataUrl };
    }

    async verifyAndEnableMFA(model: EnableMFAModel): Promise<GlobalResponse> {
        const isValid = authenticator.check(model.token, model.secret);
        if (!isValid) throw new BadRequestException('Invalid MFA token');

        let mfa = await this.mfaRepo.findOne({ where: { userId: model.userId } });
        if (!mfa) {
            mfa = new MFASettingsEntity();
            mfa.userId = model.userId;
        }

        mfa.secret = model.secret;
        mfa.isEnabled = true;
        await this.mfaRepo.save(mfa);

        return new GlobalResponse(true, 200, 'MFA enabled successfully');
    }

    async verifyMFAToken(model: VerifyMFAModel): Promise<boolean> {
        const mfa = await this.mfaRepo.findOne({ where: { userId: model.userId } });
        if (!mfa || !mfa.isEnabled) return true;
        return authenticator.check(model.token, '');
    }

    async disableMFA(userId: number): Promise<GlobalResponse> {
        const mfa = await this.mfaRepo.findOne({ where: { userId } });
        if (mfa) {
            mfa.isEnabled = false;
            mfa.secret = null;
            mfa.recoveryCodes = null;
            await this.mfaRepo.save(mfa);
        }
        return new GlobalResponse(true, 200, 'MFA disabled successfully');
    }

    async getMFAStatus(userId: number): Promise<{ isEnabled: boolean }> {
        const mfa = await this.mfaRepo.findOne({ where: { userId } });
        return { isEnabled: mfa?.isEnabled || false };
    }

    // SSO
    async getSSOProviders(companyId: number): Promise<SSOProviderEntity[]> {
        return this.ssoRepo.find({ where: { companyId } });
    }

    async createSSOProvider(model: CreateSSOProviderModel): Promise<GlobalResponse> {
        const entity = new SSOProviderEntity();
        entity.name = model.name;
        entity.companyId = model.companyId;
        entity.type = model.type;
        entity.clientId = model.clientId;
        entity.clientSecret = model.clientSecret;
        entity.issuerUrl = model.issuerUrl;
        entity.authorizationUrl = model.authorizationUrl;
        entity.tokenUrl = model.tokenUrl;
        entity.userInfoUrl = model.userInfoUrl;
        entity.isActive = true;

        await this.ssoRepo.save(entity);
        return new GlobalResponse(true, 201, 'SSO Provider created successfully');
    }

    async updateSSOProvider(model: UpdateSSOProviderModel): Promise<GlobalResponse> {
        const entity = await this.ssoRepo.findOne({ where: { id: model.id } });
        if (!entity) throw new NotFoundException('SSO Provider not found');

        entity.name = model.name || entity.name;
        entity.type = model.type || entity.type;
        entity.clientId = model.clientId || entity.clientId;
        if (model.clientSecret) entity.clientSecret = model.clientSecret;
        entity.issuerUrl = model.issuerUrl || entity.issuerUrl;
        entity.authorizationUrl = model.authorizationUrl || entity.authorizationUrl;
        entity.tokenUrl = model.tokenUrl || entity.tokenUrl;
        entity.userInfoUrl = model.userInfoUrl || entity.userInfoUrl;

        await this.ssoRepo.save(entity);
        return new GlobalResponse(true, 200, 'SSO Provider updated successfully');
    }

    async deleteSSOProvider(id: number): Promise<GlobalResponse> {
        const entity = await this.ssoRepo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException('SSO Provider not found');
        await this.ssoRepo.remove(entity);
        return new GlobalResponse(true, 200, 'SSO Provider deleted successfully');
    }

    // API Keys
    async findAllAPIKeys(companyId: number): Promise<any[]> {
        const keys = await this.apiKeyRepo.find({ where: { companyId } }); // Removed isActive: true filter to show inactive ones too
        return keys.map(k => ({
            id: Number(k.id),
            name: k.name,
            key: 'pk_live_********' + k.apiKey.substring(k.apiKey.length - 4),
            expiresAt: k.expiresAt,
            lastUsed: k.lastUsedAt,
            isActive: k.isActive,
            createdAt: k.createdAt,
            permissions: [], // Not implemented yet
            description: '' // Not implemented yet
        }));
    }

    async createAPIKey(model: CreateAPIKeyModel): Promise<{ name: string, apiKey: string, message: string }> {
        const rawKey = crypto.randomBytes(32).toString('hex');
        const prefix = 'av_live_';
        const apiKey = `${prefix}${rawKey}`;
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

        const entity = new APIKeyEntity();
        entity.userId = model.userId;
        entity.companyId = model.companyId;
        entity.name = model.name;
        entity.apiKey = hashedKey;
        entity.prefix = prefix;
        entity.isActive = true;
        entity.expiresAt = model.expiresAt || null as any;

        await this.apiKeyRepo.save(entity);
        return {
            name: model.name,
            apiKey,
            message: 'Please store this key safely. It will not be shown again.'
        };
    }

    async revokeAPIKey(id: number): Promise<GlobalResponse> {
        const key = await this.apiKeyRepo.findOne({ where: { id } });
        if (!key) throw new NotFoundException('API Key not found');
        key.isActive = false;
        await this.apiKeyRepo.save(key);
        return new GlobalResponse(true, 200, 'API Key revoked successfully');
    }

    async validateAPIKey(apiKey: string): Promise<APIKeyEntity | null> {
        const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
        const entity = await this.apiKeyRepo.findOne({ where: { apiKey: hashedKey, isActive: true } });
        if (entity) {
            entity.lastUsedAt = new Date();
            await this.apiKeyRepo.save(entity);
        }
        return entity;
    }


    async activateEmployeeAccount(data: { employeeId: number, roles: number[], companyId: number, authType: string, password?: string }): Promise<GlobalResponse> {
        const employee = await this.employeesRepo.findOne({ where: { id: data.employeeId } });
        if (!employee) throw new NotFoundException('Employee not found');

        const existing = await this.userRepo.findOne({ where: { email: employee.email } });
        if (existing) throw new BadRequestException('User account already exists for this email');

        const registerModel = new RegisterUserModel(
            `${employee.firstName} ${employee.lastName}`,
            data.companyId,
            employee.email,
            employee.phNumber,
            data.authType === 'SSO' ? '' : (data.password || 'Welcome@123'),
            UserRoleEnum.USER,
            data.authType
        );

        const res = await this.authUsersService.registerUser(registerModel);
        if (!res.status) return res;

        // Fetch the newly created user to get the ID for role assignment
        const newUser = await this.userRepo.findOne({ where: { email: employee.email } });
        if (newUser && data.roles && data.roles.length > 0) {
            await this.assignRolesToUser(Number(newUser.id), data.roles, data.companyId);
        }

        return new GlobalResponse(true, 201, 'Account activated successfully');
    }
    async assignRolesToUser(userId: number, roleIds: number[], companyId: number): Promise<GlobalResponse> {
        // Clear existing roles
        await this.userRoleRepo.delete({ userId });

        // Assign new roles
        for (const roleId of roleIds) {
            await this.userRoleRepo.save(this.userRoleRepo.create({ userId, roleId }));
        }

        // Legacy Support: Update the single 'userRole' column based on highest privilege
        try {
            const roles = await this.roleRepo.findByIds(roleIds);
            let legacyRole = UserRoleEnum.USER;
            if (roles.some(r => r.code === 'ADMIN' || r.name.toUpperCase() === 'ADMIN')) legacyRole = UserRoleEnum.ADMIN;
            else if (roles.some(r => r.code === 'MANAGER' || r.name.toUpperCase() === 'MANAGER')) legacyRole = UserRoleEnum.MANAGER;

            await this.userRepo.update(userId, { userRole: legacyRole });
        } catch (e) {
            console.warn('Failed to update legacy user role', e);
        }

        return new GlobalResponse(true, 200, 'Roles assigned successfully');
    }

    async getUserPermissions(userId: number): Promise<PermissionEntity[]> {
        // Get user entity for legacy role check
        const user = await this.userRepo.findOne({ where: { id: userId } });

        // Get user's roles
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map(ur => ur.roleId);

        const roles = roleIds.length > 0 ? await this.roleRepo.find({ where: { id: In(roleIds) } }) : [];

        // SUPER_ADMIN bypass
        if (user?.userRole === UserRoleEnum.SUPER_ADMIN || roles.some(r => r.userRole === UserRoleEnum.SUPER_ADMIN)) {
            return this.permissionRepo.find({ where: { isActive: true } });
        }

        if (roleIds.length === 0) return [];

        // Get all permissions for these roles
        const rolePermissions = await this.rolePermRepo
            .createQueryBuilder('rp')
            .where('rp.roleId IN (:...roleIds)', { roleIds })
            .getMany();

        const permissionIds = [...new Set(rolePermissions.map(rp => rp.permissionId))];

        if (permissionIds.length === 0) return [];

        // Get permission details
        return this.permissionRepo.find({ where: { id: In(permissionIds) } });
    }

    async checkUserPermission(userId: number, resource: string, action: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissions.some(p => p.resource === resource && p.action === action);
    }


    async getUserAuthorizedMenus(userId: number): Promise<any[]> {
        // 1. Get user roles
        const user = await this.userRepo.findOne({ where: { id: userId } });
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map(ur => ur.roleId);

        // 1.1 Check if User is Admin (Bypass filtering)
        const roles = roleIds.length > 0 ? await this.roleRepo.find({ where: { id: In(roleIds) } }) : [];

        const isSuperAdmin = user?.userRole === UserRoleEnum.SUPER_ADMIN || roles.some(r => r.userRole === UserRoleEnum.SUPER_ADMIN);
        const isAdmin = isSuperAdmin || roles.some(r =>
            (r.code?.toUpperCase() || '').includes('ADMIN') ||
            (r.name?.toUpperCase() || '').includes('ADMIN')
        );

        // 2. Fetch full menu tree structure
        const allMenus = await this.menuRepo.find({ order: { sortOrder: 'ASC' } });

        if (isSuperAdmin) {
            // Super Admin gets everything with full permissions
            const buildFullTree = (parentId: number | null): any[] => {
                const pid = parentId ? Number(parentId) : null;
                return allMenus
                    .filter(m => (m.parentId ? Number(m.parentId) : null) === pid)
                    .map(m => ({
                        ...m,
                        permissions: {
                            canRead: true,
                            canCreate: true,
                            canUpdate: true,
                            canDelete: true,
                            canApprove: true,
                        },
                        children: buildFullTree(Number(m.id))
                    }));
            };
            return buildFullTree(null);
        }

        if (roleIds.length === 0) return [];

        // 3. Get menu access for these roles
        const menuAccess = await this.roleMenuRepo
            .createQueryBuilder('rma')
            .where('rma.roleId IN (:...roleIds)', { roleIds })
            .andWhere('rma.canRead = :canRead', { canRead: true })
            .getMany();

        const allowedMenuIds = new Set(menuAccess.map(ma => ma.menuId));

        // 4. Filter and build tree
        const buildTree = (parentId: number | null): any[] => {
            const pid = parentId ? Number(parentId) : null;
            return allMenus
                .filter(m => (m.parentId ? Number(m.parentId) : null) === pid)
                .filter(m => isAdmin || allowedMenuIds.has(Number(m.id))) // Authorization check or bypass for Admin
                .map(m => {
                    const relevantAccess = menuAccess.filter(ma => Number(ma.menuId) === Number(m.id));
                    const permissions = isAdmin ? {
                        canRead: true,
                        canCreate: true,
                        canUpdate: true,
                        canDelete: true,
                        canApprove: true,
                    } : {
                        canRead: true,
                        canCreate: relevantAccess.some(a => a.canCreate),
                        canUpdate: relevantAccess.some(a => a.canUpdate),
                        canDelete: relevantAccess.some(a => a.canDelete),
                        canApprove: relevantAccess.some(a => a.canApprove),
                    };

                    return {
                        ...m,
                        permissions,
                        children: buildTree(Number(m.id))
                    };
                });
        };

        return buildTree(null);
    }

    // --- Menus CRUD ---
    async createMenu(model: CreateMenuModel): Promise<GlobalResponse> {
        const menu = new MenuEntity();
        Object.assign(menu, model);
        await this.menuRepo.save(menu);
        return new GlobalResponse(true, 201, 'Menu created successfully');
    }

    async updateMenu(model: UpdateMenuModel): Promise<GlobalResponse> {
        const menu = await this.menuRepo.findOne({ where: { id: model.id } });
        if (!menu) throw new NotFoundException('Menu not found');
        Object.assign(menu, model);
        await this.menuRepo.save(menu);
        return new GlobalResponse(true, 200, 'Menu updated successfully');
    }

    async deleteMenu(id: number): Promise<GlobalResponse> {
        await this.menuRepo.delete(id);
        return new GlobalResponse(true, 200, 'Menu deleted successfully');
    }

    // --- Scopes CRUD ---
    async findAllScopes(): Promise<GetAllScopesResponseModel> {
        const scopes = await this.scopeRepo.find();
        return new GetAllScopesResponseModel(true, 200, 'Scopes retrieved', scopes as any[]);
    }

    async createScope(model: CreateScopeModel): Promise<GlobalResponse> {
        const scope = new ScopeEntity();
        Object.assign(scope, model);
        await this.scopeRepo.save(scope);
        return new GlobalResponse(true, 201, 'Scope created successfully');
    }

    async updateScope(model: UpdateScopeModel): Promise<GlobalResponse> {
        const scope = await this.scopeRepo.findOne({ where: { id: model.id } });
        if (!scope) throw new NotFoundException('Scope not found');
        Object.assign(scope, model);
        await this.scopeRepo.save(scope);
        return new GlobalResponse(true, 200, 'Scope updated successfully');
    }

    async deleteScope(id: number): Promise<GlobalResponse> {
        await this.scopeRepo.delete(id);
        return new GlobalResponse(true, 200, 'Scope deleted successfully');
    }

    async getAllMenusTree(): Promise<MenuResponseModel[]> {
        const allMenus = await this.menuRepo.find({ order: { sortOrder: 'ASC' } });
        const buildTree = (parentId: number | null): any[] => {
            const pid = parentId ? Number(parentId) : null;
            return allMenus
                .filter(m => (m.parentId ? Number(m.parentId) : null) === pid)
                .map(m => ({
                    ...m,
                    children: buildTree(Number(m.id))
                }));
        };
        return buildTree(null);
    }
}
