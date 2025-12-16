import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ItAdminRepository } from '../../repository/it-admin.repository';
import { ItAdminEntity } from '../../entities/it-admin.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class ItAdminService {
    constructor(
        private dataSource: DataSource,
        private itAdminRepo: ItAdminRepository
    ) { }

    async findAll(): Promise<ItAdminEntity[]> {
        try {
            return await this.itAdminRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<ItAdminEntity> {
        try {
            const admin = await this.itAdminRepo.findOne({ where: { id } });
            if (!admin) {
                throw new ErrorResponse(0, 'IT Admin not found');
            }
            return admin;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<ItAdminEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.itAdminRepo.create(dto);
            const savedEntity = await transManager.getRepository(ItAdminEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<ItAdminEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'IT Admin not found');
            }

            await transManager.getRepository(ItAdminEntity).update(id, dto);
            const updated = await transManager.getRepository(ItAdminEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'IT Admin not found');
            }

            await transManager.getRepository(ItAdminEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
