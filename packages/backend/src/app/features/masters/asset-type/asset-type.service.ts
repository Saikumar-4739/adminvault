import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { AssetTypeRepository } from './repositories/asset-type.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateAssetTypeModel, UpdateAssetTypeModel, GetAllAssetTypesResponseModel, CreateAssetTypeResponseModel, AssetTypeDropdownModel, AssetTypeDropdownResponse, IdRequestModel } from '@adminvault/shared-models';
import { AssetTypeMasterEntity } from './entities/asset-type.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class AssetTypeService {
    constructor(
        private dataSource: DataSource,
        private assetTypeRepo: AssetTypeRepository,
    ) { }

    /**
     * Create a new asset type
     * Validates required fields and ensures uniqueness
     */
    async createAssetType(reqModel: CreateAssetTypeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.name) {
                throw new ErrorResponse(0, "Asset Type name is required");
            }

            const existingName = await this.assetTypeRepo.findOne({ where: { name: reqModel.name } });
            if (existingName) {
                throw new ErrorResponse(0, "Asset Type with this name already exists");
            }

            if (reqModel.code) {
                const existingCode = await this.assetTypeRepo.findOne({ where: { code: reqModel.code } });
                if (existingCode) {
                    throw new ErrorResponse(0, "Asset Type code already in use");
                }
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeMasterEntity);
            const { id, companyId, ...createData } = reqModel;
            const newItem = repo.create({ ...createData });
            await repo.save(newItem);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Asset Type created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update an existing asset type
     * Modifies asset type information for an existing record
     */
    async updateAssetType(reqModel: UpdateAssetTypeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, 'Asset Type ID is required');
            }

            const existing = await this.assetTypeRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Asset Type not found');
            }

            if (reqModel.name !== undefined && reqModel.name.trim() === '') {
                throw new ErrorResponse(0, 'Asset Type name cannot be empty');
            }

            if (reqModel.code) {
                const codeExists = await this.assetTypeRepo.findOne({ where: { code: reqModel.code, id: Not(reqModel.id) } });
                if (codeExists) {
                    throw new ErrorResponse(0, 'Asset Type code already in use');
                }
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeMasterEntity);
            await repo.update(reqModel.id, {
                name: reqModel.name,
                description: reqModel.description,
                code: reqModel.code,
                isActive: reqModel.isActive
            });
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Asset Type updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Get a specific asset type by ID
     */
    async getAssetType(reqModel: IdRequestModel): Promise<CreateAssetTypeResponseModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Asset Type ID is required");
            }

            const assetType = await this.assetTypeRepo.findOne({ where: { id: reqModel.id } });
            if (!assetType) {
                throw new ErrorResponse(0, "Asset Type not found");
            }

            return new CreateAssetTypeResponseModel(true, 200, "Asset Type retrieved successfully", assetType);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all asset types in the system
     */
    async getAllAssetTypes(): Promise<GetAllAssetTypesResponseModel> {
        try {
            const assetTypes = await this.assetTypeRepo.find();
            // Assuming no specific company filter for now since request arg is removed from signature basically
            const assetTypesWithCompanyName = assetTypes.map(asset => ({
                id: asset.id,
                userId: asset.userId,
                createdAt: asset.createdAt,
                updatedAt: asset.updatedAt,
                name: asset.name,
                description: asset.description,
                isActive: asset.isActive,
                code: asset.code,
                companyName: '' // Simplified for now
            }));
            return new GetAllAssetTypesResponseModel(true, 200, 'Asset Types retrieved successfully', assetTypesWithCompanyName);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all asset types for dropdown (lightweight)
     */
    async getAllAssetTypesDropdown(): Promise<AssetTypeDropdownResponse> {
        try {
            const assetTypes = await this.assetTypeRepo.find({ select: ['id', 'name'] });
            const dropdownData = assetTypes.map(asset => new AssetTypeDropdownModel(asset.id, asset.name));
            return new AssetTypeDropdownResponse(true, 200, "Asset Types retrieved successfully", dropdownData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete an asset type (hard delete)
     */
    async deleteAssetType(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Asset Type ID is required");
            }

            const existing = await this.assetTypeRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, 'Asset Type not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeMasterEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Asset Type deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
