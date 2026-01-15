import { GlobalResponse } from '../common/global-response';
import { SettingType } from '../enums';

// --- Settings ---

export class CreateSettingModel {
    key!: string;
    value: any;
    type!: SettingType;
    category?: string;
    description?: string;
    userId?: number;
    companyId?: number;
    isEncrypted?: boolean;
}

export class BulkSetSettingsModel {
    settings!: CreateSettingModel[];
}

export class SettingResponseModel {
    id: number;
    key: string;
    value: any;
    type: SettingType;
    category: string;
    description: string;
    userId: number | null;
    companyId: number | null;
    isEncrypted: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: number, key: string, value: any, type: SettingType, category: string, description: string, userId: number | null, companyId: number | null, isEncrypted: boolean, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.key = key;
        this.value = value;
        this.type = type;
        this.category = category;
        this.description = description;
        this.userId = userId;
        this.companyId = companyId;
        this.isEncrypted = isEncrypted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class GetAllSettingsResponseModel extends GlobalResponse {
    data: SettingResponseModel[];
    constructor(status: boolean, code: number, message: string, data: SettingResponseModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class GetSettingResponseModel extends GlobalResponse {
    data: SettingResponseModel | null;
    constructor(status: boolean, code: number, message: string, data: SettingResponseModel | null) {
        super(status, code, message);
        this.data = data;
    }
}

export class GetSettingsByCategoryRequestModel {
    category!: string;
    companyId?: number;
}

export class DeleteSettingRequestModel {
    key!: string;
    type!: SettingType;
    userId?: number;
    companyId?: number;
}

export class GetSettingRequestModel {
    key!: string;
    type!: SettingType;
    userId?: number;
    companyId?: number;
}

// --- IAM (Roles, Permissions, MFA, API Keys, SSO) ---

export class CreateRoleModel {
    name!: string;
    code!: string;
    companyId!: number;
    description?: string;
    permissionIds?: number[];
    menuIds?: number[];
    userRole!: string; // Mandatory mapping to system role
}

export class UpdateRoleModel {
    id!: number;
    name!: string;
    code?: string;
    description?: string;
    permissionIds?: number[];
    menuIds?: number[];
    userRole?: string;
}

export class RoleResponseModel {
    id: number;
    name: string;
    companyId: number;
    description: string;
    code: string;
    isSystemRole: boolean;
    isActive: boolean;
    userRole: string;
    createdAt: Date;
    updatedAt: Date;
    permissions: any[];
    menuIds: number[];

    constructor(id: number, name: string, companyId: number, description: string, permissions: any[], code: string, isSystemRole: boolean, isActive: boolean, userRole: string, createdAt: Date, updatedAt: Date, menuIds: number[] = []) {
        this.id = id;
        this.name = name;
        this.companyId = companyId;
        this.description = description;
        this.permissions = permissions;
        this.code = code;
        this.isSystemRole = isSystemRole;
        this.isActive = isActive;
        this.userRole = userRole;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.menuIds = menuIds;
    }
}

export class GetAllRolesResponseModel extends GlobalResponse {
    data: RoleResponseModel[];
    constructor(status: boolean, code: number, message: string, data: RoleResponseModel[]) {
        super(status, code, message, data);
        this.data = data;
    }
}

export class EnableMFAModel {
    userId!: number;
    token!: string;
    secret!: string;
}

export class VerifyMFAModel {
    userId!: number;
    token!: string;
}

export class CreateAPIKeyModel {
    userId!: number;
    companyId!: number;
    name!: string;
    expiresAt?: Date;
    constructor(userId: number, companyId: number, name: string, expiresAt?: Date) {
        this.userId = userId;
        this.companyId = companyId;
        this.name = name;
        this.expiresAt = expiresAt;
    }
}

export class APIKeyResponseModel {
    id: number;
    name: string;
    apiKey: string;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    constructor(id: number, name: string, apiKey: string, expiresAt: Date | null, lastUsedAt: Date | null) {
        this.id = id;
        this.name = name;
        this.apiKey = apiKey;
        this.expiresAt = expiresAt;
        this.lastUsedAt = lastUsedAt;
    }
}

export class CreateSSOProviderModel {
    companyId!: number;
    name!: string;
    type!: string;
    clientId!: string;
    clientSecret!: string;
    issuerUrl?: string; // Optional for some types
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    isActive!: boolean;
}

export class UpdateSSOProviderModel {
    id!: number;
    companyId?: number;
    name?: string;
    type?: string;
    clientId?: string;
    clientSecret?: string;
    issuerUrl?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    isActive?: boolean;
}

// --- Interfaces for UI ---
export interface Role {
    id: number;
    name: string;
    code: string;
    description?: string;
    isSystemRole: boolean;
    isActive: boolean;
    companyId?: number;
    permissions?: any[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SSOProvider {
    id: number;
    name: string;
    type: string;
    clientId: string;
    clientSecret?: string;
    issuerUrl?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    isActive: boolean;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
}

// --- Additional Administration Models ---

export class PrincipalResponseModel {
    id!: number;
    userId!: number | null;
    firstName!: string;
    lastName!: string;
    email!: string;
    role!: string;
    roleIds!: number[];
    departmentId!: number;
    status!: boolean;
    phNumber!: string;
    isUserActive!: boolean;
    authType!: string;
    ssoProviderName!: string | null;
}

export class GetAllPrincipalsResponseModel extends GlobalResponse<PrincipalResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data: PrincipalResponseModel[]) {
        super(status, code, message, data);
    }
}

export class AssignRolesModel {
    userId!: number;
    roleIds!: number[];
    companyId!: number;
}

export class MenuPermissionModel {
    canCreate!: boolean;
    canUpdate!: boolean;
    canDelete!: boolean;
    canApprove!: boolean;
}

export class MenuResponseModel {
    id!: number;
    parentId!: number | null;
    code!: string;
    label!: string;
    path!: string;
    icon!: string;
    sortOrder!: number;
    requiredPermissionCode!: string;
    children!: MenuResponseModel[];
    permissions?: MenuPermissionModel;
    createdAt?: Date;
    updatedAt?: Date;
}

export class GetAllMenusResponseModel extends GlobalResponse<MenuResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data: MenuResponseModel[]) {
        super(status, code, message, data);
    }
}

export class MFAStatusResponseModel {
    isEnabled!: boolean;
}

// --- Menu CRU Models ---
export class CreateMenuModel {
    label!: string;
    code!: string;
    parentId?: number | null;
    path?: string;
    icon?: string;
    sortOrder?: number;
    requiredPermissionCode?: string;
}

export class UpdateMenuModel extends CreateMenuModel {
    id!: number;
}

// --- Scope Models ---
export class ScopeResponseModel {
    id!: number;
    name!: string;
    code!: string;
    description?: string;
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
}

export class CreateScopeModel {
    name!: string;
    code!: string;
    description?: string;
}

export class UpdateScopeModel extends CreateScopeModel {
    id!: number;
}

export class GetAllScopesResponseModel extends GlobalResponse<ScopeResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data: ScopeResponseModel[]) {
        super(status, code, message, data);
    }
}

export class MFASetupResponseModel {
    secret!: string;
    qrCodeDataUrl!: string;
}

export class GetAllAPIKeysResponseModel extends GlobalResponse<APIKeyResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data: APIKeyResponseModel[]) {
        super(status, code, message, data);
    }
}

export class GeneratedAPIKeyResponseModel {
    name!: string;
    apiKey!: string;
    message!: string;
}

export class CreateAPIKeyResponse extends GlobalResponse<GeneratedAPIKeyResponseModel> {
    constructor(status: boolean, code: number, message: string, data: GeneratedAPIKeyResponseModel) {
        super(status, code, message, data);
    }
}

export class GetAllSSOProvidersResponseModel extends GlobalResponse<SSOProvider[]> {
    constructor(status: boolean, code: number, message: string, data: SSOProvider[]) {
        super(status, code, message, data);
    }
}

export class PermissionModel {
    id!: number;
    name!: string;
    code!: string;
    description!: string;
    resource!: string;
    action!: string;
    isActive?: boolean;
    createdAt!: Date;
    updatedAt!: Date;
}

export class GetAllPermissionsResponseModel extends GlobalResponse<PermissionModel[]> {
    constructor(status: boolean, code: number, message: string, data: PermissionModel[]) {
        super(status, code, message, data);
    }
}

export class GetUserPermissionsResponseModel extends GlobalResponse<PermissionModel[]> {
    constructor(status: boolean, code: number, message: string, data: PermissionModel[]) {
        super(status, code, message, data);
    }
}

export class CheckPermissionRequestModel {
    userId!: number;
    resource!: string;
    action!: string;
}

export class CheckPermissionResponseModel extends GlobalResponse<{ hasPermission: boolean }> {
    constructor(status: boolean, code: number, message: string, data: { hasPermission: boolean }) {
        super(status, code, message, data);
    }
}

export class CreatePermissionModel {
    name!: string;
    code!: string;
    description!: string;
    resource!: string;
    action!: string;
}

export class UpdatePermissionModel {
    id!: number;
    name!: string;
    code!: string;
    description!: string;
    resource!: string;
    action!: string;
}

export class DeletePermissionModel {
    id!: number;
}
