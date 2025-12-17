import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetInfoRepository } from '../../repository/asset-info.repository';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAllAssetsModel, GetAssetByIdModel, AssetResponseModel } from '@adminvault/shared-models';

@Injectable()
export class AssetInfoService {
    constructor(
        private dataSource: DataSource,
        private assetInfoRepo: AssetInfoRepository
    ) { }

    async createAsset(reqModel: CreateAssetModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }
            if (!reqModel.deviceId) {
                throw new ErrorResponse(0, "Device ID is required");
            }
            if (!reqModel.serialNumber) {
                throw new ErrorResponse(0, "Serial number is required");
            }
            if (!reqModel.purchaseDate) {
                throw new ErrorResponse(0, "Purchase date is required");
            }

            const existing = await this.assetInfoRepo.findOne({ where: { serialNumber: reqModel.serialNumber } });
            if (existing) {
                throw new ErrorResponse(0, "Serial number already exists");
            }

            await transManager.startTransaction();
            const entity = this.assetInfoRepo.create(reqModel);
            await transManager.getRepository(AssetInfoEntity).save(entity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Asset created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateAsset(reqModel: UpdateAssetModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Asset ID is required");
            }
            const existing = await this.assetInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Asset not found");
            }
            await transManager.startTransaction();
            await transManager.getRepository(AssetInfoEntity).update(reqModel.id, reqModel);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Asset updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAsset(reqModel: GetAssetModel): Promise<GetAssetByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Asset ID is required");
            }
            const asset = await this.assetInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!asset) {
                throw new ErrorResponse(0, "Asset not found");
            }

            const response = new AssetResponseModel(asset.id, asset.companyId, asset.deviceId, asset.serialNumber, asset.purchaseDate, asset.assetStatusEnum, asset.createdAt, asset.updatedAt, asset.warrantyExpiry);
            return new GetAssetByIdModel(true, 0, "Asset retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    async getAllAssets(companyId?: number): Promise<GetAllAssetsModel> {
        try {
            const assets = companyId ? await this.assetInfoRepo.find({ where: { companyId } }) : await this.assetInfoRepo.find();
            const responses = assets.map(a => new AssetResponseModel(a.id, a.companyId, a.deviceId, a.serialNumber, a.purchaseDate, a.assetStatusEnum, a.createdAt, a.updatedAt, a.warrantyExpiry));
            return new GetAllAssetsModel(true, 0, "Assets retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    async deleteAsset(reqModel: DeleteAssetModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Asset ID is required");
            }
            const existing = await this.assetInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Asset not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(AssetInfoEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Asset deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
