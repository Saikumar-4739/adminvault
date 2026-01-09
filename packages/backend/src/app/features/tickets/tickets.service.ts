import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsRepository } from './repositories/tickets.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { TicketsEntity } from './entities/tickets.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel, TicketResponseModel, TicketStatusEnum, TicketPriorityEnum, TicketCategoryEnum, UserRoleEnum } from '@adminvault/shared-models';
import { TicketsGateway } from './tickets.gateway';
import { EmailInfoService } from '../administration/email-info.service';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { WorkflowService } from '../workflow/workflow.service';
import { CreateApprovalRequestModel, ApprovalTypeEnum } from '@adminvault/shared-models';

import { TicketWorkLogEntity } from './entities/ticket-work-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsService {
    constructor(
        private dataSource: DataSource,
        private ticketsRepo: TicketsRepository,
        private employeesRepo: EmployeesRepository,
        @InjectRepository(TicketWorkLogEntity)
        private workLogRepo: Repository<TicketWorkLogEntity>,
        private gateway: TicketsGateway,
        private emailInfoService: EmailInfoService,
        private workflowService: WorkflowService
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

            // Calculate SLA Deadline
            let slaHours = 24;
            if (reqModel.priorityEnum === TicketPriorityEnum.HIGH) slaHours = 4;
            else if (reqModel.priorityEnum === TicketPriorityEnum.LOW) slaHours = 72;

            const now = new Date();
            const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);

            const entity = this.ticketsRepo.create({
                ...reqModel,
                employeeId: employee.id, // Use the resolved employee ID
                userId: userId,
                companyId: employee.companyId,
                slaDeadline: slaDeadline
            });

            const savedTicket = await transManager.getRepository(TicketsEntity).save(entity);
            await transManager.completeTransaction();

            // Notify admins via WebSocket
            this.gateway.emitTicketCreated(savedTicket);

            // Trigger Workflow for High Priority Tickets OR if status is PENDING
            if (savedTicket.priorityEnum === TicketPriorityEnum.HIGH || savedTicket.ticketStatus === TicketStatusEnum.PENDING) {
                const approvalReq = new CreateApprovalRequestModel(
                    ApprovalTypeEnum.TICKET,
                    Number(savedTicket.id),
                    Number(employee.id), // requester
                    Number(employee.companyId),
                    `Ticket Approval Request: ${savedTicket.subject} (${savedTicket.priorityEnum})`
                );
                await this.workflowService.initiateApproval(approvalReq);
            }

            // Send Emails
            // 1. To User
            await this.emailInfoService.sendTicketCreatedEmail(savedTicket, userEmail, 'User');

            // 2. To Admins & Managers
            const authRepo = this.dataSource.getRepository(AuthUsersEntity);
            const recipients = await authRepo.find({
                where: [
                    { companyId: employee.companyId, userRole: UserRoleEnum.ADMIN },
                    { companyId: employee.companyId, userRole: UserRoleEnum.MANAGER }
                ]
            });

            for (const recipient of recipients) {
                if (recipient.email !== userEmail) { // Avoid sending duplicate if user is also admin/manager
                    await this.emailInfoService.sendTicketCreatedEmail(savedTicket, recipient.email, recipient.userRole);
                }
            }

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
            
            // If time spent is provided, optionally create a work log
            if (reqModel.timeSpentMinutes && reqModel.timeSpentMinutes > 0) {
                const workLog = new TicketWorkLogEntity();
                workLog.ticketId = reqModel.id;
                workLog.timeSpentMinutes = reqModel.timeSpentMinutes;
                workLog.description = `Work logged during ticket update. Total time spent updated to ${reqModel.timeSpentMinutes}m.`;
                workLog.startTime = new Date();
                // If we had a technicianId, we'd use it here. Defaulting for now or using userId.
                workLog.technicianId = userId; 
                await transManager.getRepository(TicketWorkLogEntity).save(workLog);
            }

            await transManager.completeTransaction();

            // Notify via WebSocket
            const updated = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            this.gateway.emitTicketUpdated(updated);

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

            const response = new TicketResponseModel(
                ticket.id, ticket.ticketCode, ticket.employeeId, ticket.categoryEnum, ticket.priorityEnum, ticket.subject, ticket.ticketStatus, ticket.assignAdminId, ticket.resolvedAt,
                undefined, undefined,
                ticket.createdAt, ticket.updatedAt, ticket.slaDeadline,
                ticket.timeSpentMinutes
            );
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
                .leftJoinAndMapOne('ticket.employee', 'employees', 'emp', 'emp.id = ticket.employeeId')
                .orderBy('ticket.createdAt', 'DESC');

            if (companyId) {
                query.where('ticket.companyId = :companyId', { companyId });
            }

            const tickets: any[] = await query.getMany();

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
                t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : `User ID: ${t.employeeId}`,
                t.employee ? t.employee.email : `User ID: ${t.employeeId}`,
                t.createdAt,
                t.updatedAt,
                t.slaDeadline,
                t.timeSpentMinutes
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

            const tickets: any[] = await this.ticketsRepo
                .createQueryBuilder('ticket')
                .leftJoinAndMapOne('ticket.employee', 'employees', 'emp', 'emp.id = ticket.employeeId')
                .where('ticket.employeeId = :employeeId', { employeeId: employee.id })
                .orderBy('ticket.createdAt', 'DESC')
                .getMany();

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
                t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : `User ID: ${t.employeeId}`,
                t.employee ? t.employee.email : `User ID: ${t.employeeId}`,
                t.createdAt,
                t.updatedAt,
                t.slaDeadline,
                t.timeSpentMinutes
            ));
            return new GetAllTicketsModel(true, 0, "User tickets retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    async getStatisticsByCompany(companyId: number): Promise<any> {
        const total = await this.ticketsRepo.count({ where: { companyId } });
        const open = await this.ticketsRepo.count({ where: { companyId, ticketStatus: TicketStatusEnum.OPEN } });
        const inProgress = await this.ticketsRepo.count({ where: { companyId, ticketStatus: TicketStatusEnum.IN_PROGRESS } });
        const resolved = await this.ticketsRepo.count({ where: { companyId, ticketStatus: TicketStatusEnum.RESOLVED } });

        return { total, open, inProgress, resolved };
    }

    async getStatistics(companyId: number): Promise<any> {
        const tickets = await this.ticketsRepo.find({ where: { companyId } });

        return {
            total: tickets.length,
            open: tickets.filter(t => t.ticketStatus === TicketStatusEnum.OPEN).length,
            inProgress: tickets.filter(t => t.ticketStatus === TicketStatusEnum.IN_PROGRESS).length,
            resolved: tickets.filter(t => t.ticketStatus === TicketStatusEnum.RESOLVED).length,
            closed: tickets.filter(t => t.ticketStatus === TicketStatusEnum.CLOSED).length,
            byPriority: {
                high: tickets.filter(t => t.priorityEnum === TicketPriorityEnum.HIGH).length,
                medium: tickets.filter(t => t.priorityEnum === TicketPriorityEnum.MEDIUM).length,
                low: tickets.filter(t => t.priorityEnum === TicketPriorityEnum.LOW).length,
            },
            byCategory: {
                hardware: tickets.filter(t => t.categoryEnum === TicketCategoryEnum.HARDWARE).length,
                software: tickets.filter(t => t.categoryEnum === TicketCategoryEnum.SOFTWARE).length,
                network: tickets.filter(t => t.categoryEnum === TicketCategoryEnum.NETWORK).length,
                email: tickets.filter(t => t.categoryEnum === TicketCategoryEnum.EMAIL).length,
                access: tickets.filter(t => t.categoryEnum === TicketCategoryEnum.ACCESS).length,
                other: tickets.filter(t => t.categoryEnum === TicketCategoryEnum.OTHER).length,
            },
        };
    }

    async assignTicket(id: number, assignAdminId: number): Promise<GlobalResponse> {
        const ticket = await this.ticketsRepo.findOne({ where: { id } });
        if (!ticket) throw new ErrorResponse(404, "Ticket not found");

        ticket.assignAdminId = assignAdminId;
        ticket.ticketStatus = TicketStatusEnum.IN_PROGRESS;
        const saved = await this.ticketsRepo.save(ticket);

        // Notify via WebSocket
        this.gateway.emitTicketUpdated(saved);

        return new GlobalResponse(true, 200, "Ticket assigned successfully");
    }

    async addResponse(id: number, response: string): Promise<GlobalResponse> {
        const ticket = await this.ticketsRepo.findOne({ where: { id } });
        if (!ticket) throw new ErrorResponse(404, "Ticket not found");

        ticket.response = response;
        const saved = await this.ticketsRepo.save(ticket);

        // Notify via WebSocket
        this.gateway.emitTicketUpdated(saved);

        return new GlobalResponse(true, 200, "Response added successfully");
    }

    async updateStatus(id: number, status: TicketStatusEnum): Promise<GlobalResponse> {
        const ticket = await this.ticketsRepo.findOne({ where: { id } });
        if (!ticket) throw new ErrorResponse(404, "Ticket not found");

        ticket.ticketStatus = status;
        if (status === TicketStatusEnum.RESOLVED || status === TicketStatusEnum.CLOSED) {
            ticket.resolvedAt = new Date();
        }
        const saved = await this.ticketsRepo.save(ticket);

        // Notify via WebSocket
        this.gateway.emitTicketUpdated(saved);

        return new GlobalResponse(true, 200, "Status updated successfully");
    }
}
