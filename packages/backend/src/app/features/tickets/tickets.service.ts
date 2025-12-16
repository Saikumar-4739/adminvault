import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsRepository } from '../../repository/tickets.repository';
import { TicketsEntity } from '../../entities/tickets.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class TicketsService {
    constructor(
        private dataSource: DataSource,
        private ticketsRepo: TicketsRepository
    ) { }

    async findAll(): Promise<TicketsEntity[]> {
        try {
            return await this.ticketsRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<TicketsEntity> {
        try {
            const ticket = await this.ticketsRepo.findOne({ where: { id } });
            if (!ticket) {
                throw new ErrorResponse(0, 'Ticket not found');
            }
            return ticket;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<TicketsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.ticketsRepo.create(dto);
            const savedEntity = await transManager.getRepository(TicketsEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<TicketsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Ticket not found');
            }

            await transManager.getRepository(TicketsEntity).update(id, dto);
            const updated = await transManager.getRepository(TicketsEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Ticket not found');
            }

            await transManager.getRepository(TicketsEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
