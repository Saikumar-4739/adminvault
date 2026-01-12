import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    UserRoleEnum
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
        // Seeding is disabled to allow purely manual management through the UI
        // If a fresh installation is needed, use the manual seeding endpoints
    }

    // Roles
    async findAllRoles(companyId?: number): Promise<GetAllRolesResponseModel> {
        const roles = await this.roleRepo.find({ where: companyId ? { companyId } : {} });
        const responses = await Promise.all(roles.map(async (r) => {
            const perms = await this.getPermissionsForRole(Number(r.id));
            return this.mapRoleToResponse(r, perms);
        }));
        return new GetAllRolesResponseModel(true, 200, 'Roles retrieved', responses);
    }

    async findOneRole(id: number): Promise<RoleResponseModel | null> {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) return null;
        const perms = await this.getPermissionsForRole(id);
        return this.mapRoleToResponse(role, perms);
    }

    private async getPermissionsForRole(roleId: number): Promise<PermissionEntity[]> {
        const rolePerms = await this.rolePermRepo.find({ where: { roleId } });
        const permIds = rolePerms.map(rp => rp.permissionId);
        if (permIds.length === 0) return [];
        return this.permissionRepo.findByIds(permIds);
    }

    async createRole(model: CreateRoleModel): Promise<GlobalResponse> {
        const role = new RoleEntity();
        role.name = model.name;
        role.code = model.code;
        role.companyId = model.companyId;
        role.description = model.description || '';

        const saved = await this.roleRepo.save(role);

        if (model.permissionIds && model.permissionIds.length > 0) {
            for (const pId of model.permissionIds) {
                const rp = new RolePermissionEntity();
                rp.roleId = Number(saved.id);
                rp.permissionId = pId;
                await this.rolePermRepo.save(rp);
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

        return new GlobalResponse(true, 200, 'Role updated successfully');
    }

    async deleteRole(id: number): Promise<GlobalResponse> {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new NotFoundException('Role not found');
        await this.rolePermRepo.delete({ roleId: id });
        await this.roleRepo.remove(role);
        return new GlobalResponse(true, 200, 'Role deleted successfully');
    }

    private mapRoleToResponse(entity: RoleEntity, permissions: PermissionEntity[] = []): RoleResponseModel {
        return new RoleResponseModel(
            Number(entity.id),
            entity.name,
            entity.companyId,
            entity.description,
            permissions,
            entity.code,
            entity.isSystemRole,
            entity.isActive,
            entity.createdAt,
            entity.updatedAt
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
        // Get user's roles
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map(ur => ur.roleId);

        if (roleIds.length === 0) return [];

        // Get all permissions for these roles
        const rolePermissions = await this.rolePermRepo
            .createQueryBuilder('rp')
            .where('rp.roleId IN (:...roleIds)', { roleIds })
            .getMany();

        const permissionIds = [...new Set(rolePermissions.map(rp => rp.permissionId))];

        if (permissionIds.length === 0) return [];

        // Get permission details
        return this.permissionRepo.findByIds(permissionIds);
    }

    async checkUserPermission(userId: number, resource: string, action: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissions.some(p => p.resource === resource && p.action === action);
    }

    async getAllMenusTree(): Promise<any[]> {
        const allMenus = await this.menuRepo.find({ order: { sortOrder: 'ASC' } });

        const buildTree = (parentId: number | null): any[] => {
            return allMenus
                .filter(m => m.parentId === (parentId ? Number(parentId) : null))
                .map(m => ({
                    ...m,
                    children: buildTree(Number(m.id))
                }));
        };
        return buildTree(null);
    }

    async getUserAuthorizedMenus(userId: number): Promise<any[]> {
        // 1. Get user roles
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map(ur => ur.roleId);

        if (roleIds.length === 0) return [];

        // 1.1 Check if User is Admin (Bypass filtering)
        const roles = await this.roleRepo.findByIds(roleIds);
        const isAdmin = roles.some(r =>
            (r.code?.toUpperCase() || '').includes('ADMIN') ||
            (r.name?.toUpperCase() || '').includes('ADMIN')
        );

        // 2. Get menu access for these roles
        const menuAccess = await this.roleMenuRepo
            .createQueryBuilder('rma')
            .where('rma.roleId IN (:...roleIds)', { roleIds })
            .andWhere('rma.canRead = :canRead', { canRead: true })
            .getMany();

        const allowedMenuIds = new Set(menuAccess.map(ma => ma.menuId));

        // 3. Fetch full menu tree structure
        const allMenus = await this.menuRepo.find({ order: { sortOrder: 'ASC' } });

        // 4. Filter and build tree
        const buildTree = (parentId: number | null): any[] => {
            return allMenus
                .filter(m => m.parentId === (parentId ? Number(parentId) : null))
                .filter(m => isAdmin || allowedMenuIds.has(Number(m.id))) // Authorization check or bypass for Admin
                .map(m => {
                    const relevantAccess = menuAccess.filter(ma => Number(ma.menuId) === Number(m.id));
                    const permissions = isAdmin ? {
                        canCreate: true,
                        canUpdate: true,
                        canDelete: true,
                        canApprove: true,
                    } : {
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
}
