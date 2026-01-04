import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsRepository } from './repositories/tickets.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { TicketsEntity } from './entities/tickets.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel, TicketResponseModel } from '@adminvault/shared-models';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class TicketsService {
    constructor(
        private dataSource: DataSource,
        private ticketsRepo: TicketsRepository,
        private employeesRepo: EmployeesRepository,
        private auditLogsService: AuditLogsService
    ) { }

    /**
     * Create a new support ticket
     * Generates unique ticket code, validates required fields, and links ticket to employee profile
     * 
     * @param reqModel - Ticket creation data including category, priority, and subject
     * @param userEmail - Email of the logged-in user creating the ticket
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if required fields are missing, employee profile not found, or ticket code already exists
     */
    async createTicket(reqModel: CreateTicketModel, userEmail: string, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {

            if (!reqModel.categoryEnum) {
                throw new ErrorResponse(0, "Category is required");
            }
            if (!reqModel.priorityEnum) {
                throw new ErrorResponse(0, "Priority is required");
            }
            if (!reqModel.subject) {
                throw new ErrorResponse(0, "Subject is required");
            }

            // Look up the employee associated with the logged-in user's email
            // Assuming AuthUser email matches Employee email
            const employee = await this.employeesRepo.findOne({ where: { email: userEmail } });

            if (!employee) {
                throw new ErrorResponse(0, `No Employee profile found for ${userEmail}. Tickets must be linked to an employee. Please contact your Admin.`);
            }

            if (!reqModel.ticketCode) {
                reqModel.ticketCode = await this.generateTicketCode();
            } else {
                // If provided, check for duplicates
                const existing = await this.ticketsRepo.findOne({ where: { ticketCode: reqModel.ticketCode } });
                if (existing) {
                    throw new ErrorResponse(0, "Ticket code already exists");
                }
            }

            await transManager.startTransaction();

            const entity = this.ticketsRepo.create({
                ...reqModel,
                employeeId: employee.id, // Use the resolved employee ID
                // userId will be set by CommonBaseEntity from request context if middleware sets it
            });

            await transManager.getRepository(TicketsEntity).save(entity);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'CREATE_TICKET',
                resource: 'Ticket',
                details: `Ticket ${entity.ticketCode} created by ${userEmail}`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: employee.companyId,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Ticket created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Generate unique ticket code with date-based format
     * Format: TKT-YYYYMMDD-XXXX where XXXX is auto-incremented sequence number
     * 
     * @returns Unique ticket code string
     */
    private async generateTicketCode(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

        // Find the latest ticket code for today
        const latestTicket = await this.ticketsRepo
            .createQueryBuilder('ticket')
            .where('ticket.ticketCode LIKE :prefix', { prefix: `TKT-${dateStr}-%` })
            .orderBy('ticket.ticketCode', 'DESC')
            .getOne();

        let sequence = 1;
        if (latestTicket) {
            // Extract sequence number from last ticket code
            const parts = latestTicket.ticketCode.split('-');
            if (parts.length === 3) {
                sequence = parseInt(parts[2]) + 1;
            }
        }

        // Format: TKT-YYYYMMDD-XXXX
        return `TKT-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    }

    /**
     * Update existing ticket information
     * Modifies ticket details such as status, priority, or assignment
     * 
     * @param reqModel - Ticket update data with ticket ID and fields to update
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if ticket ID is missing or ticket not found
     */
    async updateTicket(reqModel: UpdateTicketModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'UPDATE_TICKET',
                resource: 'Ticket',
                details: `Ticket ${existing.ticketCode} updated`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existing.companyId,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Ticket updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Retrieve a specific ticket by ID
     * Fetches detailed information for a single ticket
     * 
     * @param reqModel - Request containing ticket ID
     * @returns GetTicketByIdModel with ticket details
     * @throws ErrorResponse if ticket ID is missing or ticket not found
     */
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

    /**
     * Retrieve all tickets in the system
     * Fetches complete list of all support tickets with employee details
     * 
     * @param companyId - Optional company ID to filter tickets
     * @returns GetAllTicketsModel with list of all tickets
     * @throws Error if database query fails
     */
    async getAllTickets(companyId?: number): Promise<GetAllTicketsModel> {
        try {
            const query = this.ticketsRepo
                .createQueryBuilder('ticket')
                .orderBy('ticket.createdAt', 'DESC');

            if (companyId) {
                query.where('ticket.companyId = :companyId', { companyId });
            }

            const tickets = await query.getMany();

            const responses = tickets.map(t => new TicketResponseModel(
                t.id,
                t.ticketCode,
                t.employeeId,
                t.categoryEnum,
                t.priorityEnum,
                t.subject,
                t.ticketStatus,
                t.assignAdminId,
                t.resolvedAt,
                `User ID: ${t.employeeId}`, // Placeholder name
                `User ID: ${t.employeeId}`, // Placeholder email
                t.createdAt,
                t.updatedAt
            ));
            return new GetAllTicketsModel(true, 0, "Tickets retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a ticket (soft delete)
     * Marks ticket as deleted without removing from database
     * 
     * @param reqModel - Request containing ticket ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if ticket ID is missing or ticket not found
     */
    async deleteTicket(reqModel: DeleteTicketModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'DELETE_TICKET',
                resource: 'Ticket',
                details: `Ticket ${existing.ticketCode} deleted`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existing.companyId,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Ticket deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Retrieve tickets for a specific user
     * Fetches all tickets raised by the user with the given email
     * 
     * @param userEmail - Email of the user whose tickets to retrieve
     * @returns GetAllTicketsModel with list of user's tickets
     * @throws ErrorResponse if user email is missing or employee not found
     */
    async getTicketsByUser(userEmail: string): Promise<GetAllTicketsModel> {
        try {
            if (!userEmail) {
                throw new ErrorResponse(0, "User email is required");
            }

            const employee = await this.employeesRepo.findOne({ where: { email: userEmail } });
            if (!employee) {
                throw new ErrorResponse(0, `No Employee profile found for ${userEmail}`);
            }

            const tickets = await this.ticketsRepo
                .createQueryBuilder('ticket')
                .where('ticket.employeeId = :employeeId', { employeeId: employee.id })
                .orderBy('ticket.createdAt', 'DESC')
                .getMany();

            const responses = tickets.map(t => new TicketResponseModel(t.id, t.ticketCode, t.employeeId, t.categoryEnum, t.priorityEnum, t.subject, t.ticketStatus, t.assignAdminId, t.resolvedAt, `User ID: ${t.employeeId}`, `User ID: ${t.employeeId}`, t.createdAt, t.updatedAt));
            return new GetAllTicketsModel(true, 0, "User tickets retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }
}
