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

// --- IAM (Roles, Permissions, MFA, API Keys, SSO) ---

export class CreateRoleModel {
    name!: string;
    companyId!: number;
    description?: string;
    permissionIds?: number[];
}

export class UpdateRoleModel {
    id!: number;
    name!: string;
    description?: string;
    permissionIds?: number[];
}

export class RoleResponseModel {
    id: number;
    name: string;
    companyId: number;
    description: string;
    code: string;
    isSystemRole: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: any[];

    constructor(id: number, name: string, companyId: number, description: string, permissions: any[], code: string, isSystemRole: boolean, isActive: boolean, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.name = name;
        this.companyId = companyId;
        this.description = description;
        this.permissions = permissions;
        this.code = code;
        this.isSystemRole = isSystemRole;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class GetAllRolesResponseModel extends GlobalResponse {
    data: RoleResponseModel[];
    constructor(status: boolean, code: number, message: string, data: RoleResponseModel[]) {
        super(status, code, message);
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
