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
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { MFASettingsRepository } from './repositories/mfa-settings.repository';
import { APIKeyRepository } from './repositories/api-key.repository';
import { SSOProviderRepository } from './repositories/sso-provider.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { RolePermissionEntity } from './entities/role-permission.entity';
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
    GlobalResponse
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
        @InjectRepository(AuthUsersEntity)
        private readonly userRepo: Repository<AuthUsersEntity>
    ) { }

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

    // API Keys
    async findAllAPIKeys(companyId: number): Promise<APIKeyResponseModel[]> {
        const keys = await this.apiKeyRepo.find({ where: { companyId, isActive: true } });
        return keys.map(k => new APIKeyResponseModel(Number(k.id), k.name, '********', k.expiresAt, k.lastUsedAt));
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

    // SSO
    async getSSOProviders(companyId: number): Promise<SSOProviderEntity[]> {
        return this.ssoRepo.find({ where: { companyId, isActive: true } });
    }

    async createSSOProvider(model: CreateSSOProviderModel): Promise<GlobalResponse> {
        const provider = new SSOProviderEntity();
        Object.assign(provider, model);
        await this.ssoRepo.save(provider);
        return new GlobalResponse(true, 201, 'SSO Provider created successfully');
    }

    async updateSSOProvider(model: UpdateSSOProviderModel): Promise<GlobalResponse> {
        const provider = await this.ssoRepo.findOne({ where: { id: model.id } });
        if (!provider) throw new NotFoundException('SSO Provider not found');
        Object.assign(provider, model);
        await this.ssoRepo.save(provider);
        return new GlobalResponse(true, 200, 'SSO Provider updated successfully');
    }

    async deleteSSOProvider(id: number): Promise<GlobalResponse> {
        const provider = await this.ssoRepo.findOne({ where: { id } });
        if (!provider) throw new NotFoundException('SSO Provider not found');
        await this.ssoRepo.remove(provider);
        return new GlobalResponse(true, 200, 'SSO Provider deleted successfully');
    }
}
