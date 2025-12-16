import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailInfoRepository } from '../../repository/email-info.repository';
import { EmailInfoEntity } from '../../entities/email-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class EmailInfoService {
    constructor(
        private dataSource: DataSource,
        private emailInfoRepo: EmailInfoRepository
    ) { }

    async findAll(): Promise<EmailInfoEntity[]> {
        try {
            return await this.emailInfoRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<EmailInfoEntity> {
        try {
            const emailInfo = await this.emailInfoRepo.findOne({ where: { id } });
            if (!emailInfo) {
                throw new ErrorResponse(0, 'Email info not found');
            }
            return emailInfo;
        } catch (error) {
            throw error;
        }
    }

    async findByCompany(companyId: number): Promise<EmailInfoEntity[]> {
        try {
            return await this.emailInfoRepo.find({ where: { companyId } });
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<EmailInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.emailInfoRepo.create(dto);
            const savedEntity = await transManager.getRepository(EmailInfoEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<EmailInfoEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Email info not found');
            }

            await transManager.getRepository(EmailInfoEntity).update(id, dto);
            const updated = await transManager.getRepository(EmailInfoEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Email info not found');
            }

            await transManager.getRepository(EmailInfoEntity).delete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
