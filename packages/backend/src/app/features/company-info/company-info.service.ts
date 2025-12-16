import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyInfoRepository } from '../../repository/company-info.repository';
import { CompanyInfoEntity } from '../../entities/company-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class CompanyInfoService {
    constructor(
        private dataSource: DataSource,
        private companyInfoRepo: CompanyInfoRepository
    ) { }

    async findAll(): Promise<CompanyInfoEntity[]> {
        try {
            return await this.companyInfoRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<CompanyInfoEntity> {
        try {
            const company = await this.companyInfoRepo.findOne({ where: { id } });
            if (!company) {
                throw new ErrorResponse(0, 'Company not found');
            }
            return company;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<CompanyInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.companyInfoRepo.create(dto);
            const savedEntity = await transManager.getRepository(CompanyInfoEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<CompanyInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Company not found');
            }

            await transManager.getRepository(CompanyInfoEntity).update(id, dto);
            const updated = await transManager.getRepository(CompanyInfoEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Company not found');
            }

            await transManager.getRepository(CompanyInfoEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
