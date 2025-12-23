import { GlobalResponse } from '@adminvault/backend-utils';
import { AssetStatusEnum } from '../enums';

export class CreateAssetModel {
    companyId: number;
    deviceId: number;
    brandId?: number;
    model?: string;
    serialNumber: string;
    expressCode?: string;
    boxNo?: string;
    configuration?: string;
    assignedToEmployeeId?: number;
    previousUserEmployeeId?: number;
    purchaseDate?: string;
    warrantyExpiry?: string;
    assetStatusEnum: AssetStatusEnum;
    userAssignedDate?: string;
    lastReturnDate?: string;

    constructor(
        companyId: number,
        deviceId: number,
        serialNumber: string,
        assetStatusEnum: AssetStatusEnum,
        purchaseDate?: string,
        warrantyExpiry?: string,
        brandId?: number,
        model?: string,
        configuration?: string,
        assignedToEmployeeId?: number,
        previousUserEmployeeId?: number,
        userAssignedDate?: string,
        lastReturnDate?: string,
        expressCode?: string,
        boxNo?: string
    ) {
        this.companyId = companyId;
        this.deviceId = deviceId;
        this.brandId = brandId;
        this.model = model;
        this.serialNumber = serialNumber;
        this.expressCode = expressCode;
        this.boxNo = boxNo;
        this.configuration = configuration;
        this.assignedToEmployeeId = assignedToEmployeeId;
        this.previousUserEmployeeId = previousUserEmployeeId;
        this.purchaseDate = purchaseDate;
        this.assetStatusEnum = assetStatusEnum;
        this.warrantyExpiry = warrantyExpiry;
        this.userAssignedDate = userAssignedDate;
        this.lastReturnDate = lastReturnDate;
    }
}

export class UpdateAssetModel extends CreateAssetModel {
    id: number;

    constructor(
        id: number,
        companyId: number,
        deviceId: number,
        serialNumber: string,
        assetStatusEnum: AssetStatusEnum = AssetStatusEnum.AVAILABLE,
        purchaseDate?: string,
        warrantyExpiry?: string,
        brandId?: number,
        model?: string,
        configuration?: string,
        assignedToEmployeeId?: number,
        previousUserEmployeeId?: number,
        userAssignedDate?: string,
        lastReturnDate?: string,
        expressCode?: string,
        boxNo?: string
    ) {
        super(companyId, deviceId, serialNumber, assetStatusEnum, purchaseDate, warrantyExpiry, brandId, model, configuration, assignedToEmployeeId, previousUserEmployeeId, userAssignedDate, lastReturnDate, expressCode, boxNo);
        this.id = id;
    }
}

export class DeleteAssetModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class GetAssetModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class AssetResponseModel {
    id: number;
    companyId: number;
    deviceId: number;
    brandId?: number;
    model?: string;
    serialNumber: string;
    expressCode?: string;
    boxNo?: string;
    configuration?: string;
    assignedToEmployeeId?: number;
    previousUserEmployeeId?: number;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    assetStatusEnum: AssetStatusEnum;
    userAssignedDate?: Date;
    lastReturnDate?: Date;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        companyId: number,
        deviceId: number,
        serialNumber: string,
        assetStatusEnum: AssetStatusEnum,
        createdAt: Date,
        updatedAt: Date,
        purchaseDate?: Date,
        warrantyExpiry?: Date,
        brandId?: number,
        model?: string,
        configuration?: string,
        assignedToEmployeeId?: number,
        previousUserEmployeeId?: number,
        userAssignedDate?: Date,
        lastReturnDate?: Date,
        expressCode?: string,
        boxNo?: string
    ) {
        this.id = id;
        this.companyId = companyId;
        this.deviceId = deviceId;
        this.brandId = brandId;
        this.model = model;
        this.serialNumber = serialNumber;
        this.expressCode = expressCode;
        this.boxNo = boxNo;
        this.configuration = configuration;
        this.assignedToEmployeeId = assignedToEmployeeId;
        this.previousUserEmployeeId = previousUserEmployeeId;
        this.purchaseDate = purchaseDate;
        this.assetStatusEnum = assetStatusEnum;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.warrantyExpiry = warrantyExpiry;
        this.userAssignedDate = userAssignedDate;
        this.lastReturnDate = lastReturnDate;
    }
}

export class GetAllAssetsModel extends GlobalResponse {
    assets: AssetResponseModel[];
    constructor(status: boolean, code: number, message: string, assets: AssetResponseModel[]) {
        super(status, code, message);
        this.assets = assets;
    }
}

export class GetAssetByIdModel extends GlobalResponse {
    asset: AssetResponseModel;
    constructor(status: boolean, code: number, message: string, asset: AssetResponseModel) {
        super(status, code, message);
        this.asset = asset;
    }
}

// New Models for Enhanced Asset Management

export class AssetStatisticsResponseModel extends GlobalResponse {
    statistics: {
        total: number;
        available: number;
        inUse: number;
        maintenance: number;
        retired: number;
    };

    constructor(
        status: boolean,
        code: number,
        message: string,
        statistics: {
            total: number;
            available: number;
            inUse: number;
            maintenance: number;
            retired: number;
        }
    ) {
        super(status, code, message);
        this.statistics = statistics;
    }
}

export class AssetSearchRequestModel {
    companyId: number;
    searchQuery?: string;
    statusFilter?: AssetStatusEnum;

    constructor(companyId: number, searchQuery?: string, statusFilter?: AssetStatusEnum) {
        this.companyId = companyId;
        this.searchQuery = searchQuery;
        this.statusFilter = statusFilter;
    }
}

export class AssetWithAssignmentModel {
    id: number;
    companyId: number;
    deviceId: number;
    deviceName?: string;
    serialNumber: string;
    purchaseDate?: Date;
    warrantyExpiry?: Date;
    assetStatusEnum: AssetStatusEnum;
    userAssignedDate?: Date;
    lastReturnDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    // Assignment details
    assignedTo?: string; // Employee name
    assignedDate?: Date;
    assignedById?: number;

    constructor(
        id: number,
        companyId: number,
        deviceId: number,
        serialNumber: string,
        assetStatusEnum: AssetStatusEnum,
        createdAt: Date,
        updatedAt: Date,
        purchaseDate?: Date,
        warrantyExpiry?: Date,
        deviceName?: string,
        assignedTo?: string,
        assignedDate?: Date,
        assignedById?: number,
        userAssignedDate?: Date,
        lastReturnDate?: Date
    ) {
        this.id = id;
        this.companyId = companyId;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.assetStatusEnum = assetStatusEnum;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.warrantyExpiry = warrantyExpiry;
        this.assignedTo = assignedTo;
        this.assignedDate = assignedDate;
        this.assignedById = assignedById;
        this.userAssignedDate = userAssignedDate;
        this.lastReturnDate = lastReturnDate;
    }
}

export class GetAssetsWithAssignmentsResponseModel extends GlobalResponse {
    assets: AssetWithAssignmentModel[];

    constructor(status: boolean, code: number, message: string, assets: AssetWithAssignmentModel[]) {
        super(status, code, message);
        this.assets = assets;
    }
}
