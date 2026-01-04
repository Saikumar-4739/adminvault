import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, LessThan, IsNull } from 'typeorm';
import { AssetInfoEntity } from '../../../entities/asset-info.entity';
import { AssetAssignEntity } from '../../../entities/asset-assign.entity';
import { AssetStatusEnum } from '@adminvault/shared-models';

@Injectable()
export class AssetsService {
    private readonly assetRepo: Repository<AssetInfoEntity>;
    private readonly assignRepo: Repository<AssetAssignEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.assetRepo = this.dataSource.getRepository(AssetInfoEntity);
        this.assignRepo = this.dataSource.getRepository(AssetAssignEntity);
    }

    async findAll(filters?: any) {
        return this.assetRepo.find({
            where: filters,
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number) {
        const asset = await this.assetRepo.findOne({ where: { id } });
        if (!asset) throw new NotFoundException('Asset not found');
        return asset;
    }

    async create(data: Partial<AssetInfoEntity>) {
        const asset = this.assetRepo.create(data);
        return this.assetRepo.save(asset);
    }

    async update(id: number, data: Partial<AssetInfoEntity>) {
        const asset = await this.findOne(id);
        Object.assign(asset, data);
        return this.assetRepo.save(asset);
    }

    async assignAsset(assetId: number, employeeId: number, adminId: number, remarks?: string) {
        const asset = await this.findOne(assetId);
        if (asset.assetStatusEnum !== AssetStatusEnum.AVAILABLE) {
            throw new BadRequestException('Asset is not available for assignment');
        }

        return this.dataSource.transaction(async (manager) => {
            // Update Asset Status
            asset.assetStatusEnum = AssetStatusEnum.IN_USE;
            asset.assignedToEmployeeId = employeeId;
            asset.userAssignedDate = new Date();
            await manager.save(asset);

            // Create Assignment Record
            const assignment = manager.create(AssetAssignEntity, {
                assetId,
                employeeId,
                assignedById: adminId,
                assignedDate: new Date(),
                remarks
            });
            await manager.save(assignment);

            return { success: true };
        });
    }

    async returnAsset(assetId: number, remarks?: string) {
        const asset = await this.findOne(assetId);
        if (asset.assetStatusEnum !== AssetStatusEnum.IN_USE) {
            throw new BadRequestException('Asset is not currently assigned');
        }

        return this.dataSource.transaction(async (manager) => {
            const lastAssignment = await manager.findOne(AssetAssignEntity, {
                where: { assetId, returnDate: IsNull() },
                order: { assignedDate: 'DESC' }
            });

            if (lastAssignment) {
                lastAssignment.returnDate = new Date();
                lastAssignment.remarks = (lastAssignment.remarks || '') + ' | Return Remarks: ' + (remarks || 'None');
                await manager.save(lastAssignment);
            }

            asset.assetStatusEnum = AssetStatusEnum.AVAILABLE;
            asset.previousUserEmployeeId = asset.assignedToEmployeeId;
            asset.assignedToEmployeeId = null;
            asset.lastReturnDate = new Date();
            await manager.save(asset);

            return { success: true };
        });
    }

    async getExpiringWarranty(days: number = 30) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() + days);

        return this.assetRepo.find({
            where: {
                warrantyExpiry: LessThan(dateLimit),
                assetStatusEnum: AssetStatusEnum.IN_USE // Focus on active assets
            }
        });
    }

    async getDetailsWithHistory(id: number) {
        const asset = await this.findOne(id);
        const history = await this.assignRepo.find({
            where: { assetId: id },
            order: { assignedDate: 'DESC' }
        });
        return { asset, history };
    }
}
