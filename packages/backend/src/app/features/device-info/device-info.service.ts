import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeviceInfoRepository } from '../../repository/device-info.repository';
import { DeviceInfoEntity } from '../../entities/device-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class DeviceInfoService {
    constructor(
        private dataSource: DataSource,
        private deviceInfoRepo: DeviceInfoRepository
    ) { }

    async findAll(): Promise<DeviceInfoEntity[]> {
        try {
            return await this.deviceInfoRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<DeviceInfoEntity> {
        try {
            const device = await this.deviceInfoRepo.findOne({ where: { id } });
            if (!device) {
                throw new ErrorResponse(0, 'Device not found');
            }
            return device;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<DeviceInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.deviceInfoRepo.create(dto);
            const savedEntity = await transManager.getRepository(DeviceInfoEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<DeviceInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Device not found');
            }

            await transManager.getRepository(DeviceInfoEntity).update(id, dto);
            const updated = await transManager.getRepository(DeviceInfoEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Device not found');
            }

            await transManager.getRepository(DeviceInfoEntity).delete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
