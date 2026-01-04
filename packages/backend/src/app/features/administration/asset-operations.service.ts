import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import {
    AssetStatusEnum,
    CompanyIdRequestModel,
    GetAllAssetsModel,
    AssetResponseModel,
    CreateAssetModel,
    UpdateAssetModel,
    GlobalResponse
} from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

@Injectable()
export class AssetOperationsService {
    constructor(
        @InjectRepository(AssetInfoEntity)
        private readonly assetRepo: Repository<AssetInfoEntity>,
        @InjectRepository(AssetAssignEntity)
        private readonly assignRepo: Repository<AssetAssignEntity>,
        private readonly dataSource: DataSource
    ) { }

    async findAllAssets(reqModel: CompanyIdRequestModel): Promise<GetAllAssetsModel> {
        const assets = await this.assetRepo.find({
            where: { companyId: reqModel.id },
            order: { createdAt: 'DESC' },
            relations: ['assignedToEmployee']
        });
        const responses = assets.map(a => this.mapAssetToResponse(a));
        return new GetAllAssetsModel(true, 200, 'Assets retrieved successfully', responses);
    }

    async findOneAsset(id: number): Promise<AssetResponseModel | null> {
        const asset = await this.assetRepo.findOne({ where: { id }, relations: ['assignedToEmployee'] });
        return asset ? this.mapAssetToResponse(asset) : null;
    }

    async createAsset(model: CreateAssetModel): Promise<GlobalResponse> {
        const asset = new AssetInfoEntity();
        Object.assign(asset, {
            ...model,
            purchaseDate: model.purchaseDate ? new Date(model.purchaseDate) : undefined,
            warrantyExpiry: model.warrantyExpiry ? new Date(model.warrantyExpiry) : undefined,
            userAssignedDate: model.userAssignedDate ? new Date(model.userAssignedDate) : undefined,
            lastReturnDate: model.lastReturnDate ? new Date(model.lastReturnDate) : undefined,
            assetStatusEnum: model.assetStatusEnum
        });
        await this.assetRepo.save(asset);
        return new GlobalResponse(true, 201, 'Asset created successfully');
    }

    async updateAsset(model: UpdateAssetModel): Promise<GlobalResponse> {
        const asset = await this.assetRepo.findOne({ where: { id: model.id } });
        if (!asset) throw new NotFoundException('Asset not found');

        Object.assign(asset, {
            ...model,
            purchaseDate: model.purchaseDate ? new Date(model.purchaseDate) : asset.purchaseDate,
            warrantyExpiry: model.warrantyExpiry ? new Date(model.warrantyExpiry) : asset.warrantyExpiry,
            userAssignedDate: model.userAssignedDate ? new Date(model.userAssignedDate) : asset.userAssignedDate,
            lastReturnDate: model.lastReturnDate ? new Date(model.lastReturnDate) : asset.lastReturnDate,
            assetStatusEnum: model.assetStatusEnum
        });

        await this.assetRepo.save(asset);
        return new GlobalResponse(true, 200, 'Asset updated successfully');
    }

    async deleteAsset(id: number): Promise<GlobalResponse> {
        const asset = await this.assetRepo.findOne({ where: { id } });
        if (!asset) throw new NotFoundException('Asset not found');
        await this.assetRepo.remove(asset);
        return new GlobalResponse(true, 200, 'Asset deleted successfully');
    }

    async assignAssetOp(assetId: number, employeeId: number, userId: number, remarks?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const assetRepo = transManager.getRepository(AssetInfoEntity);

            const asset = await assetRepo.findOne({ where: { id: assetId } });
            if (!asset) throw new NotFoundException('Asset not found');
            if (asset.assetStatusEnum !== AssetStatusEnum.AVAILABLE) throw new BadRequestException('Asset is not available for assignment');

            asset.assetStatusEnum = AssetStatusEnum.IN_USE;
            asset.assignedToEmployeeId = employeeId;
            asset.userAssignedDate = new Date();
            await assetRepo.save(asset);

            const assignment = new AssetAssignEntity();
            assignment.assetId = assetId;
            assignment.employeeId = employeeId;
            assignment.assignedDate = new Date();
            assignment.assignedByUserId = userId;
            assignment.isCurrent = true;
            assignment.remarks = remarks || '';
            await transManager.getRepository(AssetAssignEntity).save(assignment);

            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Asset assigned successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async returnAssetOp(assetId: number, userId: number, remarks?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const assetRepo = transManager.getRepository(AssetInfoEntity);

            const asset = await assetRepo.findOne({ where: { id: assetId } });
            if (!asset) throw new NotFoundException('Asset not found');

            asset.assetStatusEnum = AssetStatusEnum.AVAILABLE;
            asset.previousUserEmployeeId = asset.assignedToEmployeeId;
            asset.assignedToEmployeeId = null as any;
            asset.lastReturnDate = new Date();
            await assetRepo.save(asset);

            await transManager.getRepository(AssetAssignEntity).update({ assetId, isCurrent: true }, {
                isCurrent: false,
                returnDate: new Date(),
                returnRemarks: remarks || ''
            });

            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Asset returned successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getExpiringWarranty(companyId: number, months: number = 3): Promise<GetAllAssetsModel> {
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() + months);

        const assets = await this.assetRepo.find({
            where: { companyId, warrantyExpiry: LessThan(dateLimit) },
            relations: ['assignedToEmployee']
        });
        const responses = assets.map(a => this.mapAssetToResponse(a));
        return new GetAllAssetsModel(true, 200, 'Expiring assets retrieved', responses);
    }

    private mapAssetToResponse(entity: AssetInfoEntity): AssetResponseModel {
        return new AssetResponseModel(
            Number(entity.id),
            entity.companyId,
            entity.deviceId,
            entity.serialNumber,
            entity.assetStatusEnum as AssetStatusEnum,
            entity.createdAt,
            entity.updatedAt,
            entity.purchaseDate,
            entity.warrantyExpiry,
            entity.brandId,
            entity.model,
            entity.configuration,
            entity.assignedToEmployeeId,
            entity.previousUserEmployeeId,
            entity.userAssignedDate,
            entity.lastReturnDate,
            entity.expressCode,
            entity.boxNo
        );
    }
}
