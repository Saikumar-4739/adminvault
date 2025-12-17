import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsRepository } from '../../repository/tickets.repository';
import { TicketsEntity } from '../../entities/tickets.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel, TicketResponseModel } from '@adminvault/shared-models';

@Injectable()
export class TicketsService {
    constructor(
        private dataSource: DataSource,
        private ticketsRepo: TicketsRepository
    ) { }

    async createTicket(reqModel: CreateTicketModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.ticketCode) {
                throw new ErrorResponse(0, "Ticket code is required");
            }
            if (!reqModel.employeeId) {
                throw new ErrorResponse(0, "Employee ID is required");
            }
            if (!reqModel.categoryEnum) {
                throw new ErrorResponse(0, "Category is required");
            }
            if (!reqModel.priorityEnum) {
                throw new ErrorResponse(0, "Priority is required");
            }
            if (!reqModel.subject) {
                throw new ErrorResponse(0, "Subject is required");
            }

            const existing = await this.ticketsRepo.findOne({ where: { ticketCode: reqModel.ticketCode } });
            if (existing) {
                throw new ErrorResponse(0, "Ticket code already exists");
            }

            await transManager.startTransaction();
            const entity = this.ticketsRepo.create(reqModel);
            await transManager.getRepository(TicketsEntity).save(entity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Ticket created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateTicket(reqModel: UpdateTicketModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Ticket ID is required");
            }
            const existing = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Ticket not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(TicketsEntity).update(reqModel.id, reqModel);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Ticket updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getTicket(reqModel: GetTicketModel): Promise<GetTicketByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Ticket ID is required");
            }
            const ticket = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            if (!ticket) {
                throw new ErrorResponse(0, "Ticket not found");
            }

            const response = new TicketResponseModel(ticket.id, ticket.ticketCode, ticket.employeeId, ticket.categoryEnum, ticket.priorityEnum, ticket.subject, ticket.ticketStatus, ticket.assignAdminId, ticket.resolvedAt);
            return new GetTicketByIdModel(true, 0, "Ticket retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    async getAllTickets(): Promise<GetAllTicketsModel> {
        try {
            const tickets = await this.ticketsRepo.find();
            const responses = tickets.map(t => new TicketResponseModel(t.id, t.ticketCode, t.employeeId, t.categoryEnum, t.priorityEnum, t.subject, t.ticketStatus, t.assignAdminId, t.resolvedAt));
            return new GetAllTicketsModel(true, 0, "Tickets retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    async deleteTicket(reqModel: DeleteTicketModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Ticket ID is required");
            }
            const existing = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Ticket not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(TicketsEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Ticket deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
