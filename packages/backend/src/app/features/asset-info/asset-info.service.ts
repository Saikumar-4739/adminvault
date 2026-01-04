import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAllAssetsModel, GetAssetByIdModel, AssetResponseModel, AssetStatisticsResponseModel, AssetSearchRequestModel, AssetWithAssignmentModel, GetAssetsWithAssignmentsResponseModel, AssetStatusEnum } from '@adminvault/shared-models';
import { AssetInfoEntity } from './entities/asset-info.entity';
import { AssetInfoRepository } from './repositories/asset-info.repository';

@Injectable()
export class AssetInfoService {
    constructor(
        private dataSource: DataSource,
        private assetInfoRepo: AssetInfoRepository
    ) { }

    /**
     * Create a new asset in the system
     * Validates required fields and ensures serial number uniqueness
     * 
     * @param reqModel - Asset creation data including company, device, and serial number
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if validation fails or serial number already exists
     */
    async createAsset(reqModel: CreateAssetModel, userId?: number): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.companyId || !reqModel.deviceId || !reqModel.serialNumber) {
                throw new ErrorResponse(0, "Company ID, Device ID and Serial Number are required");
            }

            const existingModel = await this.assetInfoRepo.findOne({ where: { serialNumber: reqModel.serialNumber } });
            if (existingModel) {
                throw new ErrorResponse(0, "Serial number already exists");
            }

            await transManager.startTransaction();
            const entity = new AssetInfoEntity();
            entity.companyId = reqModel.companyId;
            entity.deviceId = reqModel.deviceId;
            entity.serialNumber = reqModel.serialNumber;
            entity.brandId = reqModel.brandId;
            entity.model = reqModel.model;
            entity.configuration = reqModel.configuration;
            entity.assignedToEmployeeId = reqModel.assignedToEmployeeId;
            entity.previousUserEmployeeId = reqModel.previousUserEmployeeId;
            entity.purchaseDate = reqModel.purchaseDate;
            entity.warrantyExpiry = reqModel.warrantyExpiry;
            entity.userAssignedDate = reqModel.userAssignedDate;
            entity.lastReturnDate = reqModel.lastReturnDate;
            entity.assetStatusEnum = reqModel.assignedToEmployeeId? ((reqModel.assetStatusEnum === AssetStatusEnum.MAINTENANCE || reqModel.assetStatusEnum === AssetStatusEnum.RETIRED) ? reqModel.assetStatusEnum : AssetStatusEnum.IN_USE): (reqModel.assetStatusEnum || AssetStatusEnum.AVAILABLE);
            await transManager.getRepository(AssetInfoEntity).save(entity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Asset created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update an existing asset
     * Modifies asset information for an existing asset record
     * 
     * @param reqModel - Asset update data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if asset not found or update fails
     */
    async updateAsset(reqModel: UpdateAssetModel, userId?: number): Promise<GlobalResponse> {
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
            existing.companyId = reqModel.companyId;
            existing.deviceId = reqModel.deviceId;
            existing.serialNumber = reqModel.serialNumber;
            existing.brandId = reqModel.brandId;
            existing.model = reqModel.model;
            existing.configuration = reqModel.configuration;
            existing.assignedToEmployeeId = reqModel.assignedToEmployeeId;
            existing.previousUserEmployeeId = reqModel.previousUserEmployeeId;
            existing.purchaseDate = reqModel.purchaseDate ? new Date(reqModel.purchaseDate) : null;
            existing.warrantyExpiry = reqModel.warrantyExpiry ? new Date(reqModel.warrantyExpiry) : null;
            existing.userAssignedDate = reqModel.userAssignedDate ? new Date(reqModel.userAssignedDate) : null;
            existing.lastReturnDate = reqModel.lastReturnDate ? new Date(reqModel.lastReturnDate) : null;
            existing.userId = userId || existing.userId;
            existing.assetStatusEnum = reqModel.assignedToEmployeeId? ((reqModel.assetStatusEnum === AssetStatusEnum.MAINTENANCE || reqModel.assetStatusEnum === AssetStatusEnum.RETIRED) ? reqModel.assetStatusEnum : AssetStatusEnum.IN_USE): (reqModel.assetStatusEnum || existing.assetStatusEnum || AssetStatusEnum.AVAILABLE);
            await transManager.getRepository(AssetInfoEntity).save(existing);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Asset updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Get a specific asset by ID
     * Retrieves detailed information about a single asset
     * 
     * @param reqModel - Request model containing asset ID
     * @returns GetAssetByIdModel with asset details
     * @throws ErrorResponse if asset not found
     */
    async getAsset(reqModel: GetAssetModel): Promise<GetAssetByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Asset ID is required");
            }

            const asset = await this.assetInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!asset) {
                throw new ErrorResponse(0, "Asset not found");
            }

            const response = new AssetResponseModel(asset.id, asset.companyId, asset.deviceId, asset.serialNumber, asset.assetStatusEnum, asset.createdAt, asset.updatedAt, asset.purchaseDate, asset.warrantyExpiry, asset.brandId, asset.model, asset.configuration, asset.assignedToEmployeeId, asset.previousUserEmployeeId, asset.userAssignedDate, asset.lastReturnDate);
            return new GetAssetByIdModel(true, 0, "Asset retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all assets, optionally filtered by company
     * Retrieves a list of all assets or assets for a specific company
     * 
     * @param companyId - Optional company ID to filter assets
     * @returns GetAllAssetsModel with list of assets
     * @throws Error if retrieval fails
     */
    async getAllAssets(companyId?: number): Promise<GetAllAssetsModel> {
        try {
            const assets = companyId ? await this.assetInfoRepo.find({ where: { companyId } }) : await this.assetInfoRepo.find();
            const responses = assets.map(a => new AssetResponseModel(a.id, a.companyId, a.deviceId, a.serialNumber, a.assetStatusEnum, a.createdAt, a.updatedAt, a.purchaseDate, a.warrantyExpiry, a.brandId, a.model, a.configuration, a.assignedToEmployeeId, a.previousUserEmployeeId, a.userAssignedDate, a.lastReturnDate));
            return new GetAllAssetsModel(true, 0, "Assets retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete an asset (soft delete)
     * Marks an asset as deleted without removing from database
     * 
     * @param reqModel - Request model containing asset ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if asset not found or deletion fails
     */
    async deleteAsset(reqModel: DeleteAssetModel, userId?: number): Promise<GlobalResponse> {
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

    /**
     * Get asset statistics grouped by status
     * Provides counts of assets in each status (Available, In Use, Maintenance, Retired)
     * Uses repository method for efficient aggregation
     * 
     * @param companyId - Company ID to get statistics for
     * @returns AssetStatisticsResponseModel with status counts
     * @throws ErrorResponse if company ID not provided
     */
    async getAssetStatistics(companyId: number): Promise<AssetStatisticsResponseModel> {
        try {
            if (!companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            const statsData = await this.assetInfoRepo.getAssetStatistics(companyId);
            // Transform to expected format
            const statistics = {
                total: statsData.reduce((sum, item) => sum + parseInt(item.count), 0),
                available: statsData.find(s => s.status === AssetStatusEnum.AVAILABLE)?.count || 0,
                inUse: statsData.find(s => s.status === AssetStatusEnum.IN_USE)?.count || 0,
                maintenance: statsData.find(s => s.status === AssetStatusEnum.MAINTENANCE)?.count || 0,
                retired: statsData.find(s => s.status === AssetStatusEnum.RETIRED)?.count || 0
            };

            return new AssetStatisticsResponseModel(true, 0, "Statistics retrieved successfully", statistics);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search assets by query and/or status filter
     * Searches assets by serial number or device name, with optional status filtering
     * Uses repository method for optimized query
     * 
     * @param reqModel - Search request with company ID, optional query and status filter
     * @returns GetAllAssetsModel with filtered asset list
     * @throws ErrorResponse if company ID not provided
     */
    async searchAssets(reqModel: AssetSearchRequestModel): Promise<GetAllAssetsModel> {
        try {
            if (!reqModel.companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            const assets = await this.assetInfoRepo.searchAssets(reqModel);
            return new GetAllAssetsModel(true, 0, "Assets retrieved successfully", assets as any);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get assets with their current assignment information
     * Retrieves assets joined with device info, current assignments, and assigned employee details
     * Uses repository method for complex join query
     * 
     * @param companyId - Company ID to get assets for
     * @returns GetAssetsWithAssignmentsResponseModel with assets and assignment details
     * @throws ErrorResponse if company ID not provided
     */
    async getAssetsWithAssignments(companyId: number): Promise<GetAssetsWithAssignmentsResponseModel> {
        try {
            if (!companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }
            const assets = await this.assetInfoRepo.getAssetsWithAssignments(companyId);
            return new GetAssetsWithAssignmentsResponseModel(true, 0, "Assets with assignments retrieved successfully", assets);
        } catch (error) {
            throw error;
        }
    }
}
