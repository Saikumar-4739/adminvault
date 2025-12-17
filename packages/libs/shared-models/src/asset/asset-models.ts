import { GlobalResponse } from '@adminvault/backend-utils';
import { AssetStatusEnum } from '../enums';

export class CreateAssetModel {
    companyId: number;
    deviceId: number;
    serialNumber: string;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    assetStatusEnum: AssetStatusEnum;

    constructor(
        companyId: number,
        deviceId: number,
        serialNumber: string,
        purchaseDate: Date,
        assetStatusEnum: AssetStatusEnum = AssetStatusEnum.AVAILABLE,
        warrantyExpiry?: Date
    ) {
        this.companyId = companyId;
        this.deviceId = deviceId;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.assetStatusEnum = assetStatusEnum;
        this.warrantyExpiry = warrantyExpiry;
    }
}

export class UpdateAssetModel extends CreateAssetModel {
    id: number;

    constructor(
        id: number,
        companyId: number,
        deviceId: number,
        serialNumber: string,
        purchaseDate: Date,
        assetStatusEnum: AssetStatusEnum = AssetStatusEnum.AVAILABLE,
        warrantyExpiry?: Date
    ) {
        super(companyId, deviceId, serialNumber, purchaseDate, assetStatusEnum, warrantyExpiry);
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
    serialNumber: string;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    assetStatusEnum: AssetStatusEnum;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        companyId: number,
        deviceId: number,
        serialNumber: string,
        purchaseDate: Date,
        assetStatusEnum: AssetStatusEnum,
        createdAt: Date,
        updatedAt: Date,
        warrantyExpiry?: Date
    ) {
        this.id = id;
        this.companyId = companyId;
        this.deviceId = deviceId;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.assetStatusEnum = assetStatusEnum;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.warrantyExpiry = warrantyExpiry;
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
