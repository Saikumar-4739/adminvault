import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketStatusLogsRepository } from '../../repository/ticket-status-logs.repository';
import { TicketStatusLogsEntity } from '../../entities/ticket-status-logs.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class TicketStatusLogsService {
    constructor(
        private dataSource: DataSource,
        private ticketStatusLogsRepo: TicketStatusLogsRepository
    ) { }

    async findAll(): Promise<TicketStatusLogsEntity[]> {
        try {
            return await this.ticketStatusLogsRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<TicketStatusLogsEntity> {
        try {
            const log = await this.ticketStatusLogsRepo.findOne({ where: { id } });
            if (!log) {
                throw new ErrorResponse(0, 'Status log not found');
            }
            return log;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<TicketStatusLogsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.ticketStatusLogsRepo.create(dto);
            const savedEntity = await transManager.getRepository(TicketStatusLogsEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<TicketStatusLogsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Status log not found');
            }

            await transManager.getRepository(TicketStatusLogsEntity).update(id, dto);
            const updated = await transManager.getRepository(TicketStatusLogsEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Status log not found');
            }

            await transManager.getRepository(TicketStatusLogsEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
