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
}

export class GetAllPrincipalsResponseModel extends GlobalResponse<PrincipalResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data: PrincipalResponseModel[]) {
        super(status, code, message, data);
    }
}
