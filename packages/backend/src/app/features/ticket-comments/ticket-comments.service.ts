import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketCommentsRepository } from '../../repository/ticket-comments.repository';
import { TicketCommentsEntity } from '../../entities/ticket-comments.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class TicketCommentsService {
    constructor(
        private dataSource: DataSource,
        private ticketCommentsRepo: TicketCommentsRepository
    ) { }

    async findAll(): Promise<TicketCommentsEntity[]> {
        try {
            return await this.ticketCommentsRepo.find();
        } catch (error) {
            throw error;
        }
    }

    async findOne(id: number): Promise<TicketCommentsEntity> {
        try {
            const comment = await this.ticketCommentsRepo.findOne({ where: { id } });
            if (!comment) {
                throw new ErrorResponse(0, 'Comment not found');
            }
            return comment;
        } catch (error) {
            throw error;
        }
    }

    async create(dto: any): Promise<TicketCommentsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const entity = this.ticketCommentsRepo.create(dto);
            const savedEntity = await transManager.getRepository(TicketCommentsEntity).save(entity);

            await transManager.completeTransaction();
            return savedEntity;
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async update(id: number, dto: any): Promise<TicketCommentsEntity> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const existing = await this.findOne(id);
            if (!existing) {
                throw new ErrorResponse(0, 'Comment not found');
            }

            await transManager.getRepository(TicketCommentsEntity).update(id, dto);
            const updated = await transManager.getRepository(TicketCommentsEntity).findOne({ where: { id } });

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
                throw new ErrorResponse(0, 'Comment not found');
            }

            await transManager.getRepository(TicketCommentsEntity).softDelete(id);

            await transManager.completeTransaction();
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
