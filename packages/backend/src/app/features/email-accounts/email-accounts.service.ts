import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailAccountsRepository } from '../../repository/email-accounts.repository';
import { EmailAccountsEntity } from '../../entities/email-accounts.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class EmailAccountsService {
    constructor(
        private dataSource: DataSource,
        private emailAccountsRepo: EmailAccountsRepository
    ) { }

    async findAll(): Promise<EmailAccountsEntity[]> {
        try {
            return await this.emailAccountsRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<EmailAccountsEntity> {
        try {
            const emailAccount = await this.emailAccountsRepo.findOne({ where: { id } });
            if (!emailAccount) {
                throw new ErrorResponse(0, 'Email account not found');
            }
            return emailAccount;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<EmailAccountsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.emailAccountsRepo.create(dto);
            const savedEntity = await transManager.getRepository(EmailAccountsEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<EmailAccountsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Email account not found');
            }

            await transManager.getRepository(EmailAccountsEntity).update(id, dto);
            const updated = await transManager.getRepository(EmailAccountsEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Email account not found');
            }

            await transManager.getRepository(EmailAccountsEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
