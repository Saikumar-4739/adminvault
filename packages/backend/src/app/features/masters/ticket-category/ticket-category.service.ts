import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketCategoryRepository } from './repositories/ticket-category.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateTicketCategoryModel, UpdateTicketCategoryModel, GetAllTicketCategoriesResponseModel, CreateTicketCategoryResponseModel, UpdateTicketCategoryResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { TicketCategoriesMasterEntity } from './entities/ticket-category.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class TicketCategoryService {
    constructor(
        private dataSource: DataSource,
        private ticketCatRepo: TicketCategoryRepository
    ) { }

    async getAllTicketCategories(reqModel: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            const ticketCategories = await this.ticketCatRepo.find();
            return new GetAllTicketCategoriesResponseModel(true, 200, 'Ticket Categories retrieved successfully', ticketCategories);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Ticket Categories');
        }
    }

    async createTicketCategory(data: CreateTicketCategoryModel, userId?: number, ipAddress?: string): Promise<CreateTicketCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(TicketCategoriesMasterEntity);
            const newCategory = repo.create({
                userId: data.userId,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                defaultPriority: data.defaultPriority
            });
            const saved = await repo.save(newCategory);
            await transManager.completeTransaction();

            return new CreateTicketCategoryResponseModel(true, 201, 'Ticket Category created successfully', saved);
        } catch (error) {
            await transManager.releaseTransaction();
            console.error('Error creating ticket category:', error);
            throw new ErrorResponse(500, 'Failed to create Ticket Category');
        }
    }

    async updateTicketCategory(data: UpdateTicketCategoryModel, userId?: number, ipAddress?: string): Promise<UpdateTicketCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.ticketCatRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Ticket Category not found');
            }

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(TicketCategoriesMasterEntity);
            await transRepo.update(data.id, {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                defaultPriority: data.defaultPriority
            });
            const updated = await transRepo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated ticket category');
            }
            await transManager.completeTransaction();

            return new UpdateTicketCategoryResponseModel(true, 200, 'Ticket Category updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Ticket Category');
        }
    }

    async deleteTicketCategory(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(TicketCategoriesMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Ticket Category deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Ticket Category');
        }
    }
}
