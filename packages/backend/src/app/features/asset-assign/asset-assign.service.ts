import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetAssignRepository } from '../../repository/asset-assign.repository';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class AssetAssignService {
    constructor(
        private dataSource: DataSource,
        private assetAssignRepo: AssetAssignRepository
    ) { }

    async findAll(): Promise<AssetAssignEntity[]> {
        try {
            return await this.assetAssignRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<AssetAssignEntity> {
        try {
            const assignment = await this.assetAssignRepo.findOne({ where: { id } });
            if (!assignment) {
                throw new ErrorResponse(0, 'Asset assignment not found');
            }
            return assignment;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<AssetAssignEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.assetAssignRepo.create(dto);
            const savedEntity = await transManager.getRepository(AssetAssignEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<AssetAssignEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Asset assignment not found');
            }

            await transManager.getRepository(AssetAssignEntity).update(id, dto);
            const updated = await transManager.getRepository(AssetAssignEntity).findOne({ where: { id } });

            await transManager.completeTransaction();
            return updated;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Asset assignment not found');
            }

            await transManager.getRepository(AssetAssignEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
