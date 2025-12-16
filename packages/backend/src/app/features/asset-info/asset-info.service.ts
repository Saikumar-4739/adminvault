import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetInfoRepository } from '../../repository/asset-info.repository';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class AssetInfoService {
    constructor(
        private dataSource: DataSource,
        private assetInfoRepo: AssetInfoRepository
    ) { }

    async findAll(): Promise<AssetInfoEntity[]> {
        try {
            return await this.assetInfoRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<AssetInfoEntity> {
        try {
            const asset = await this.assetInfoRepo.findOne({ where: { id } });
            if (!asset) {
                throw new ErrorResponse(0, 'Asset not found');
            }
            return asset;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<AssetInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.assetInfoRepo.create(dto);
            const savedEntity = await transManager.getRepository(AssetInfoEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<AssetInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Asset not found');
            }

            await transManager.getRepository(AssetInfoEntity).update(id, dto);
            const updated = await transManager.getRepository(AssetInfoEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Asset not found');
            }

            await transManager.getRepository(AssetInfoEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
