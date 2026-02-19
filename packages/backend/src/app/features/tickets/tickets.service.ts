import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketsRepository } from './repositories/tickets.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { TicketsEntity } from './entities/tickets.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel, TicketResponseModel, TicketStatusEnum, TicketPriorityEnum, TicketCategoryEnum, UserRoleEnum, SendTicketCreatedEmailModel, GetTicketStatisticsRequestModel, UpdateTicketStatusRequestModel, AssignTicketRequestModel, AddTicketResponseRequestModel, SendTicketStatusUpdateEmailModel } from '@adminvault/shared-models';
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

    async createTicket(reqModel: CreateTicketModel, userEmail: string, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {

            if (!reqModel.categoryEnum) {
                throw new ErrorResponse(400, 'Category is required');
            }
            if (!reqModel.priorityEnum) {
                throw new ErrorResponse(400, 'Priority is required');
            }
            if (!reqModel.subject) {
                throw new ErrorResponse(400, 'Subject is required');
            }

            const employee = await this.employeesRepo.findOne({ where: { email: userEmail } });

            if (!employee) {
                throw new ErrorResponse(404, `No Employee profile found for ${userEmail}. Tickets must be linked to an employee. Please contact your Admin.`);
            }

            if (!reqModel.ticketCode) {
                reqModel.ticketCode = await this.generateTicketCode();
            } else {
                // If provided, check for duplicates
                const existing = await this.ticketsRepo.findOne({ where: { ticketCode: reqModel.ticketCode } });
                if (existing) {
                    throw new ErrorResponse(400, 'Ticket code already exists');
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
                slaDeadline: slaDeadline,
                assignAdminId: reqModel.assignAdminId,
                expectedCompletionDate: reqModel.expectedCompletionDate
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
            await this.emailInfoService.sendTicketCreatedEmail(new SendTicketCreatedEmailModel(savedTicket, userEmail, 'User'));

            // 2. To Admins & Managers


            // 2. To Specific Manager (if exists)
            if (employee.managerId) {
                const manager = await this.employeesRepo.findOne({ where: { id: employee.managerId } });
                if (manager && manager.email && manager.email !== userEmail) {
                    await this.emailInfoService.sendTicketCreatedEmail(new SendTicketCreatedEmailModel(savedTicket, manager.email, 'Manager'));
                }
            }

            // 3. To IT Admins (UserRoleEnum.ADMIN)
            const authRepo = this.dataSource.getRepository(AuthUsersEntity);
            const admins = await authRepo.find({
                where: { companyId: employee.companyId, userRole: UserRoleEnum.ADMIN }
            });

            for (const admin of admins) {
                if (admin.email !== userEmail) {
                    await this.emailInfoService.sendTicketCreatedEmail(new SendTicketCreatedEmailModel(savedTicket, admin.email, admin.userRole));
                }
            }

            return new GlobalResponse(true, 201, 'Ticket created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to create ticket');
        }
    }

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

    async updateTicket(reqModel: UpdateTicketModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(400, 'Ticket ID is required');
            }
            const existing = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Ticket not found');
            }

            const oldStatus = existing.ticketStatus;

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

            // Send Email Notification if status logic is handled here (usually updateStatus is preferred, but updateTicket might change it too)
            // Determine new status from reqModel or updated entity
            if (updated.ticketStatus !== oldStatus) {
                await this.sendStatusChangeEmails(updated, oldStatus, updated.ticketStatus);
            }

            return new GlobalResponse(true, 200, 'Ticket updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update ticket');
        }
    }

    async getTicket(reqModel: GetTicketModel): Promise<GetTicketByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(400, 'Ticket ID is required');
            }
            const ticket = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            if (!ticket) {
                throw new ErrorResponse(404, 'Ticket not found');
            }

            const response = new TicketResponseModel(
                ticket.id, ticket.ticketCode, ticket.employeeId, ticket.categoryEnum, ticket.priorityEnum, ticket.subject, ticket.ticketStatus, ticket.assignAdminId, ticket.expectedCompletionDate, ticket.resolvedAt,
                undefined, undefined,
                ticket.createdAt, ticket.updatedAt, ticket.slaDeadline,
                ticket.timeSpentMinutes
            );
            return new GetTicketByIdModel(true, 200, 'Ticket retrieved successfully', response);
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to fetch ticket');
        }
    }

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
                t.expectedCompletionDate,
                t.resolvedAt,
                t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : `User ID: ${t.employeeId}`,
                t.employee ? t.employee.email : `User ID: ${t.employeeId}`,
                t.createdAt,
                t.updatedAt,
                t.slaDeadline,
                t.timeSpentMinutes
            ));
            return new GetAllTicketsModel(true, 200, 'Tickets retrieved successfully', responses);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch tickets');
        }
    }

    async deleteTicket(reqModel: DeleteTicketModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(400, 'Ticket ID is required');
            }
            const existing = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Ticket not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(TicketsEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();


            return new GlobalResponse(true, 200, 'Ticket deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to delete ticket');
        }
    }

    async getTicketsByUser(userEmail: string): Promise<GetAllTicketsModel> {
        try {
            if (!userEmail) {
                throw new ErrorResponse(400, 'User email is required');
            }

            const employee = await this.employeesRepo.findOne({ where: { email: userEmail } });
            if (!employee) {
                throw new ErrorResponse(404, `No Employee profile found for ${userEmail}`);
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
                t.expectedCompletionDate,
                t.resolvedAt,
                t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : `User ID: ${t.employeeId}`,
                t.employee ? t.employee.email : `User ID: ${t.employeeId}`,
                t.createdAt,
                t.updatedAt,
                t.slaDeadline,
                t.timeSpentMinutes
            ));
            return new GetAllTicketsModel(true, 200, 'User tickets retrieved successfully', responses);
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to fetch user tickets');
        }
    }

    async getStatisticsByCompany(companyId: number): Promise<any> {
        const total = await this.ticketsRepo.count({ where: { companyId } });
        const open = await this.ticketsRepo.count({ where: { companyId, ticketStatus: TicketStatusEnum.OPEN } });
        const inProgress = await this.ticketsRepo.count({ where: { companyId, ticketStatus: TicketStatusEnum.IN_PROGRESS } });
        const resolved = await this.ticketsRepo.count({ where: { companyId, ticketStatus: TicketStatusEnum.RESOLVED } });

        return { total, open, inProgress, resolved };
    }

    async getStatistics(reqModel: GetTicketStatisticsRequestModel): Promise<any> {
        const tickets = await this.ticketsRepo.find({ where: { companyId: reqModel.companyId } });

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

    async assignTicket(reqModel: AssignTicketRequestModel): Promise<GlobalResponse> {
        const ticket = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
        if (!ticket) throw new ErrorResponse(404, 'Ticket not found');

        const oldStatus = ticket.ticketStatus;
        ticket.assignAdminId = reqModel.assignAdminId;
        ticket.ticketStatus = TicketStatusEnum.IN_PROGRESS;
        const saved = await this.ticketsRepo.save(ticket);

        // Notify via WebSocket
        this.gateway.emitTicketUpdated(saved);

        // Send Email Notification
        if (oldStatus !== TicketStatusEnum.IN_PROGRESS) {
            await this.sendStatusChangeEmails(saved, oldStatus, TicketStatusEnum.IN_PROGRESS);
        }

        return new GlobalResponse(true, 200, 'Ticket assigned successfully');
    }

    async addResponse(reqModel: AddTicketResponseRequestModel): Promise<GlobalResponse> {
        const ticket = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
        if (!ticket) throw new ErrorResponse(404, 'Ticket not found');

        ticket.response = reqModel.response;
        const saved = await this.ticketsRepo.save(ticket);

        // Notify via WebSocket
        this.gateway.emitTicketUpdated(saved);

        return new GlobalResponse(true, 200, 'Response added successfully');
    }

    async updateStatus(reqModel: UpdateTicketStatusRequestModel): Promise<GlobalResponse> {
        const ticket = await this.ticketsRepo.findOne({ where: { id: reqModel.id } });
        if (!ticket) throw new ErrorResponse(404, 'Ticket not found');

        const oldStatus = ticket.ticketStatus;
        ticket.ticketStatus = reqModel.status;
        if (reqModel.status === TicketStatusEnum.RESOLVED || reqModel.status === TicketStatusEnum.CLOSED) {
            ticket.resolvedAt = new Date();
        }
        const saved = await this.ticketsRepo.save(ticket);

        // Notify via WebSocket
        this.gateway.emitTicketUpdated(saved);

        // Send Email Notification
        if (oldStatus !== reqModel.status) {
            await this.sendStatusChangeEmails(saved, oldStatus, reqModel.status);
        }

        return new GlobalResponse(true, 200, 'Status updated successfully');
    }

    private async sendStatusChangeEmails(ticket: TicketsEntity, oldStatus: TicketStatusEnum, newStatus: TicketStatusEnum) {
        try {
            // Ensure we have employee details
            let employee = (ticket as any).employee;
            if (!employee) {
                employee = await this.employeesRepo.findOne({ where: { id: ticket.employeeId } });
            }

            if (!employee) {
                console.warn(`Ticket ${ticket.id} has no associated employee, skipping status emails.`);
                return;
            }

            const recipients: { email: string; role: string }[] = [];

            // 1. Ticket Creator (User)
            if (employee.email) {
                recipients.push({ email: employee.email, role: 'User' });
            }

            // 2. Manager
            if (employee.managerId) {
                const manager = await this.employeesRepo.findOne({ where: { id: employee.managerId } });
                if (manager && manager.email) {
                    recipients.push({ email: manager.email, role: 'Manager' });
                }
            }

            // 3. IT Admins
            const authRepo = this.dataSource.getRepository(AuthUsersEntity);
            const admins = await authRepo.find({
                where: { companyId: employee.companyId, userRole: UserRoleEnum.ADMIN }
            });
            for (const admin of admins) {
                if (admin.email) {
                    recipients.push({ email: admin.email, role: 'Admin' });
                }
            }

            // Deduplicate by email
            const uniqueRecipients = new Map<string, string>();
            recipients.forEach(r => uniqueRecipients.set(r.email, r.role));

            for (const [email, role] of uniqueRecipients.entries()) {
                await this.emailInfoService.sendTicketStatusUpdateEmail(
                    new SendTicketStatusUpdateEmailModel(ticket, email, role, oldStatus, newStatus)
                );
            }

        } catch (error) {
            console.error('Failed to send status change emails', error);
        }
    }
}
