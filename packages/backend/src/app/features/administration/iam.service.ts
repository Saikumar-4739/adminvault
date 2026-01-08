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
        // Permissions are now seeded via migration or manual endpoint
        // await this.seedPermissions();
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

    async seedPermissions() {
        const permissions = [
            // ============ ASSET MANAGEMENT ============
            { name: 'Create Assets', code: 'asset.create', resource: 'Asset', action: 'CREATE', description: 'Create new assets in the system' },
            { name: 'View Assets', code: 'asset.read', resource: 'Asset', action: 'READ', description: 'View asset information and details' },
            { name: 'Update Assets', code: 'asset.update', resource: 'Asset', action: 'UPDATE', description: 'Update asset information and status' },
            { name: 'Delete Assets', code: 'asset.delete', resource: 'Asset', action: 'DELETE', description: 'Remove assets from the system' },
            { name: 'Assign Assets', code: 'asset.assign', resource: 'Asset', action: 'EXECUTE', description: 'Assign assets to employees' },
            { name: 'Return Assets', code: 'asset.return', resource: 'Asset', action: 'EXECUTE', description: 'Process asset returns' },
            { name: 'Approve Asset Requests', code: 'asset.approve', resource: 'Asset', action: 'EXECUTE', description: 'Approve or reject asset requests' },

            // ============ USER MANAGEMENT ============
            { name: 'Create Users', code: 'user.create', resource: 'User', action: 'CREATE', description: 'Create new user accounts' },
            { name: 'View Users', code: 'user.read', resource: 'User', action: 'READ', description: 'View user profiles and information' },
            { name: 'Update Users', code: 'user.update', resource: 'User', action: 'UPDATE', description: 'Update user information and profiles' },
            { name: 'Delete Users', code: 'user.delete', resource: 'User', action: 'DELETE', description: 'Deactivate or remove user accounts' },
            { name: 'Manage User Roles', code: 'user.assign_roles', resource: 'User', action: 'EXECUTE', description: 'Assign or revoke user roles' },
            { name: 'Reset User Password', code: 'user.reset_password', resource: 'User', action: 'EXECUTE', description: 'Reset user passwords' },

            // ============ ROLE & PERMISSION MANAGEMENT ============
            { name: 'Create Roles', code: 'role.create', resource: 'Role', action: 'CREATE', description: 'Create new roles in the system' },
            { name: 'View Roles', code: 'role.read', resource: 'Role', action: 'READ', description: 'View role definitions and permissions' },
            { name: 'Update Roles', code: 'role.update', resource: 'Role', action: 'UPDATE', description: 'Modify role permissions and settings' },
            { name: 'Delete Roles', code: 'role.delete', resource: 'Role', action: 'DELETE', description: 'Remove custom roles from system' },
            { name: 'View Permissions', code: 'permission.read', resource: 'Permission', action: 'READ', description: 'View available system permissions' },

            // ============ EMPLOYEE MANAGEMENT ============
            { name: 'Create Employees', code: 'employee.create', resource: 'Employee', action: 'CREATE', description: 'Add new employees to the system' },
            { name: 'View Employees', code: 'employee.read', resource: 'Employee', action: 'READ', description: 'View employee information and records' },
            { name: 'Update Employees', code: 'employee.update', resource: 'Employee', action: 'UPDATE', description: 'Update employee details and status' },
            { name: 'Delete Employees', code: 'employee.delete', resource: 'Employee', action: 'DELETE', description: 'Remove employees from the system' },

            // ============ TICKET MANAGEMENT ============
            { name: 'Create Tickets', code: 'ticket.create', resource: 'Ticket', action: 'CREATE', description: 'Create new support tickets' },
            { name: 'View Tickets', code: 'ticket.read', resource: 'Ticket', action: 'READ', description: 'View ticket details and history' },
            { name: 'Update Tickets', code: 'ticket.update', resource: 'Ticket', action: 'UPDATE', description: 'Update ticket status and information' },
            { name: 'Delete Tickets', code: 'ticket.delete', resource: 'Ticket', action: 'DELETE', description: 'Delete or archive tickets' },
            { name: 'Assign Tickets', code: 'ticket.assign', resource: 'Ticket', action: 'EXECUTE', description: 'Assign tickets to team members' },
            { name: 'Close Tickets', code: 'ticket.close', resource: 'Ticket', action: 'EXECUTE', description: 'Close or resolve tickets' },

            // ============ DOCUMENT MANAGEMENT ============
            { name: 'Upload Documents', code: 'document.create', resource: 'Document', action: 'CREATE', description: 'Upload new documents to the system' },
            { name: 'View Documents', code: 'document.read', resource: 'Document', action: 'READ', description: 'View and download documents' },
            { name: 'Update Documents', code: 'document.update', resource: 'Document', action: 'UPDATE', description: 'Update document metadata and versions' },
            { name: 'Delete Documents', code: 'document.delete', resource: 'Document', action: 'DELETE', description: 'Remove documents from the system' },
            { name: 'Share Documents', code: 'document.share', resource: 'Document', action: 'EXECUTE', description: 'Share documents with other users' },

            // ============ LICENSE MANAGEMENT ============
            { name: 'Create Licenses', code: 'license.create', resource: 'License', action: 'CREATE', description: 'Add new software licenses' },
            { name: 'View Licenses', code: 'license.read', resource: 'License', action: 'READ', description: 'View license information and status' },
            { name: 'Update Licenses', code: 'license.update', resource: 'License', action: 'UPDATE', description: 'Update license details and assignments' },
            { name: 'Delete Licenses', code: 'license.delete', resource: 'License', action: 'DELETE', description: 'Remove licenses from the system' },
            { name: 'Assign Licenses', code: 'license.assign', resource: 'License', action: 'EXECUTE', description: 'Assign licenses to users or assets' },

            // ============ EMAIL MANAGEMENT ============
            { name: 'Create Email Accounts', code: 'email.create', resource: 'Email', action: 'CREATE', description: 'Add new email accounts' },
            { name: 'View Email Accounts', code: 'email.read', resource: 'Email', action: 'READ', description: 'View email account information' },
            { name: 'Update Email Accounts', code: 'email.update', resource: 'Email', action: 'UPDATE', description: 'Update email account settings' },
            { name: 'Delete Email Accounts', code: 'email.delete', resource: 'Email', action: 'DELETE', description: 'Remove email accounts' },

            // ============ PASSWORD VAULT ============
            { name: 'Create Vault Entries', code: 'vault.create', resource: 'PasswordVault', action: 'CREATE', description: 'Add new password vault entries' },
            { name: 'View Vault Entries', code: 'vault.read', resource: 'PasswordVault', action: 'READ', description: 'View password vault entries' },
            { name: 'Update Vault Entries', code: 'vault.update', resource: 'PasswordVault', action: 'UPDATE', description: 'Update vault entry information' },
            { name: 'Delete Vault Entries', code: 'vault.delete', resource: 'PasswordVault', action: 'DELETE', description: 'Remove vault entries' },
            { name: 'Reveal Passwords', code: 'vault.reveal', resource: 'PasswordVault', action: 'EXECUTE', description: 'Decrypt and view stored passwords' },

            // ============ SETTINGS MANAGEMENT ============
            { name: 'View Settings', code: 'settings.read', resource: 'Settings', action: 'READ', description: 'View system and user settings' },
            { name: 'Update Settings', code: 'settings.update', resource: 'Settings', action: 'UPDATE', description: 'Modify system and user settings' },
            { name: 'Manage Company Settings', code: 'settings.company', resource: 'Settings', action: 'EXECUTE', description: 'Manage company-wide settings' },

            // ============ REPORTS & ANALYTICS ============
            { name: 'View Reports', code: 'report.read', resource: 'Report', action: 'READ', description: 'View system reports and analytics' },
            { name: 'Generate Reports', code: 'report.generate', resource: 'Report', action: 'EXECUTE', description: 'Generate custom reports' },
            { name: 'Export Reports', code: 'report.export', resource: 'Report', action: 'EXECUTE', description: 'Export reports to various formats' },

            // ============ MASTER DATA MANAGEMENT ============
            { name: 'Create Masters', code: 'master.create', resource: 'Master', action: 'CREATE', description: 'Create master data entries' },
            { name: 'View Masters', code: 'master.read', resource: 'Master', action: 'READ', description: 'View master data configurations' },
            { name: 'Update Masters', code: 'master.update', resource: 'Master', action: 'UPDATE', description: 'Update master data entries' },
            { name: 'Delete Masters', code: 'master.delete', resource: 'Master', action: 'DELETE', description: 'Remove master data entries' },

            // ============ SSO MANAGEMENT ============
            { name: 'Create SSO Providers', code: 'sso.create', resource: 'SSO', action: 'CREATE', description: 'Add new SSO providers' },
            { name: 'View SSO Providers', code: 'sso.read', resource: 'SSO', action: 'READ', description: 'View SSO provider configurations' },
            { name: 'Update SSO Providers', code: 'sso.update', resource: 'SSO', action: 'UPDATE', description: 'Update SSO provider settings' },
            { name: 'Delete SSO Providers', code: 'sso.delete', resource: 'SSO', action: 'DELETE', description: 'Remove SSO providers' },

            // ============ API KEY MANAGEMENT ============
            { name: 'Create API Keys', code: 'apikey.create', resource: 'APIKey', action: 'CREATE', description: 'Generate new API keys' },
            { name: 'View API Keys', code: 'apikey.read', resource: 'APIKey', action: 'READ', description: 'View API key information' },
            { name: 'Revoke API Keys', code: 'apikey.delete', resource: 'APIKey', action: 'DELETE', description: 'Revoke or delete API keys' },

            // ============ AUDIT & COMPLIANCE ============
            { name: 'View Audit Logs', code: 'audit.read', resource: 'AuditLog', action: 'READ', description: 'View system audit logs and activity' },
            { name: 'Export Audit Logs', code: 'audit.export', resource: 'AuditLog', action: 'EXECUTE', description: 'Export audit logs for compliance' },

            // ============ WORKFLOW & APPROVALS ============
            { name: 'View Workflows', code: 'workflow.read', resource: 'Workflow', action: 'READ', description: 'View workflow definitions and status' },
            { name: 'Approve Workflows', code: 'workflow.approve', resource: 'Workflow', action: 'EXECUTE', description: 'Approve or reject workflow steps' },
            { name: 'Manage Workflows', code: 'workflow.manage', resource: 'Workflow', action: 'UPDATE', description: 'Configure workflow rules and steps' },

            // ============ DASHBOARD & ANALYTICS ============
            { name: 'View Dashboard', code: 'dashboard.read', resource: 'Dashboard', action: 'READ', description: 'Access main dashboard and widgets' },
            { name: 'Customize Dashboard', code: 'dashboard.customize', resource: 'Dashboard', action: 'UPDATE', description: 'Customize dashboard layout and widgets' },
        ];

        for (const p of permissions) {
            try {
                // Check if permission exists by code or name
                const existingByCode = await this.permissionRepo.findOne({ where: { code: p.code } });
                const existingByName = await this.permissionRepo.findOne({ where: { name: p.name } });

                if (existingByCode) {
                    // Update existing permission if code matches
                    existingByCode.name = p.name;
                    existingByCode.description = p.description;
                    existingByCode.resource = p.resource;
                    existingByCode.action = p.action;
                    await this.permissionRepo.save(existingByCode);
                } else if (existingByName) {
                    // Update existing permission if name matches but code is different
                    existingByName.code = p.code;
                    existingByName.description = p.description;
                    existingByName.resource = p.resource;
                    existingByName.action = p.action;
                    await this.permissionRepo.save(existingByName);
                } else {
                    // Create new permission
                    await this.permissionRepo.save(this.permissionRepo.create(p));
                }
            } catch (error) {
                console.error(`Failed to seed permission ${p.code}:`, error.message);
            }
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

        // 2. Get menu access for these roles
        // We use query builder to get distinct authorized menus
        const menuAccess = await this.roleMenuRepo
            .createQueryBuilder('rma')
            .where('rma.roleId IN (:...roleIds)', { roleIds })
            .andWhere('rma.canRead = :canRead', { canRead: true })
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
