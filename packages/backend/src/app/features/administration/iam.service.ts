import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
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
    EmployeeStatusEnum
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
        private readonly userRepo: Repository<AuthUsersEntity>
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
                ssoProviderName: user?.ssoProviderId ? ssoMap.get(Number(user.ssoProviderId)) : null
            };
        });
    }

    async onModuleInit() {
        await this.seedPermissions();
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

    async seedPermissions() {
        const permissions = [
            { name: 'View Assets', code: 'assets.view', resource: 'Asset', action: 'READ', description: 'View company assets' },
            { name: 'Update Assets', code: 'assets.update', resource: 'Asset', action: 'UPDATE', description: 'Update asset information' },
            { name: 'Delete Assets', code: 'assets.delete', resource: 'Asset', action: 'DELETE', description: 'Remove assets from system' },
            { name: 'View Users', code: 'users.view', resource: 'User', action: 'READ', description: 'View list of users' },
            { name: 'Manage Roles', code: 'roles.manage', resource: 'Role', action: 'UPDATE', description: 'Assign roles to users' },
            { name: 'View Audit Logs', code: 'audit.view', resource: 'AuditLog', action: 'READ', description: 'View system audit logs' },
            { name: 'Approve Workflows', code: 'workflows.approve', resource: 'Workflow', action: 'EXECUTE', description: 'Approve or reject workflow steps' },
        ];
        for (const p of permissions) {
            const exists = await this.permissionRepo.findOne({ where: { code: p.code } });
            if (!exists) await this.permissionRepo.save(this.permissionRepo.create(p));
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


    // User Roles & Permissions
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
            let legacyRole = 'USER';
            if (roles.some(r => r.code === 'ADMIN' || r.name.toUpperCase() === 'ADMIN')) legacyRole = 'ADMIN';
            else if (roles.some(r => r.code === 'MANAGER' || r.name.toUpperCase() === 'MANAGER')) legacyRole = 'MANAGER';

            await this.userRepo.update(userId, { userRole: legacyRole as any });
        } catch (e) {
            console.warn('Failed to update legacy user role', e);
        }

        return new GlobalResponse(true, 200, 'Roles assigned successfully');
    }

    async getUserAuthorizedMenus(userId: number): Promise<any[]> {
        // 1. Get user roles
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map(ur => ur.roleId);

        if (roleIds.length === 0) return [];

        // 2. Get menu access for these roles
        // We use query builder to get distinct authorized menus
        const menuAccess = await this.roleMenuRepo
            .createQueryBuilder('rma')
            .where('rma.roleId IN (:...roleIds)', { roleIds })
            .andWhere('rma.canRead = :canRead', { canRead: true })
            .leftJoinAndSelect('rma.menu', 'menu')
            .getMany();

        const allowedMenuIds = new Set(menuAccess.map(ma => ma.menuId));

        // 3. Fetch full menu tree structure (all menus)
        // Optimization: fetching all and filtering in memory is usually fine for menu size < 1000
        const allMenus = await this.menuRepo.find({ order: { sortOrder: 'ASC' } });

        // 4. Filter and build tree
        const buildTree = (parentId: number | null): any[] => {
            return allMenus
                .filter(m => m.parentId === (parentId ? Number(parentId) : null)) // Get children of current parent (handle null vs 0 mismatch if any)
                .filter(m => allowedMenuIds.has(Number(m.id))) // Authorization check
                .map(m => {
                    // Aggregate permissions for this menu across all user's roles
                    const relevantAccess = menuAccess.filter(ma => Number(ma.menuId) === Number(m.id));
                    const permissions = {
                        canCreate: relevantAccess.some(a => a.canCreate),
                        canUpdate: relevantAccess.some(a => a.canUpdate),
                        canDelete: relevantAccess.some(a => a.canDelete),
                        canApprove: relevantAccess.some(a => a.canApprove),
                    };

                    return {
                        ...m,
                        permissions,
                        children: buildTree(Number(m.id)) // Recursion
                    };
                });
        };

        return buildTree(null);
    }
}
