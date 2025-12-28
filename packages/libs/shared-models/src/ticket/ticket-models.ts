import { GlobalResponse } from '../common/global-response';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '../enums';

export class CreateTicketModel {
    ticketCode: string;
    employeeId?: number; // Optional - will be set from authenticated user
    assignAdminId?: number;
    categoryEnum: TicketCategoryEnum;
    priorityEnum: TicketPriorityEnum;
    subject: string;
    ticketStatus: TicketStatusEnum;
    resolvedAt?: Date;

    constructor(
        ticketCode: string,
        categoryEnum: TicketCategoryEnum,
        priorityEnum: TicketPriorityEnum,
        subject: string,
        ticketStatus: TicketStatusEnum = TicketStatusEnum.OPEN,
        employeeId?: number,
        assignAdminId?: number,
        resolvedAt?: Date
    ) {
        this.ticketCode = ticketCode;
        this.employeeId = employeeId;
        this.categoryEnum = categoryEnum;
        this.priorityEnum = priorityEnum;
        this.subject = subject;
        this.ticketStatus = ticketStatus;
        this.assignAdminId = assignAdminId;
        this.resolvedAt = resolvedAt;
    }
}

export class UpdateTicketModel extends CreateTicketModel {
    id: number;

    constructor(
        id: number,
        ticketCode: string,
        categoryEnum: TicketCategoryEnum,
        priorityEnum: TicketPriorityEnum,
        subject: string,
        ticketStatus: TicketStatusEnum = TicketStatusEnum.OPEN,
        employeeId?: number,
        assignAdminId?: number,
        resolvedAt?: Date
    ) {
        super(ticketCode, categoryEnum, priorityEnum, subject, ticketStatus, employeeId, assignAdminId, resolvedAt);
        this.id = id;
    }
}

export class DeleteTicketModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class GetTicketModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class TicketResponseModel {
    id: number;
    ticketCode: string;
    employeeId: number;
    employeeName?: string;
    employeeEmail?: string;
    assignAdminId?: number;
    categoryEnum: TicketCategoryEnum;
    priorityEnum: TicketPriorityEnum;
    subject: string;
    ticketStatus: TicketStatusEnum;
    resolvedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(
        id: number,
        ticketCode: string,
        employeeId: number,
        categoryEnum: TicketCategoryEnum,
        priorityEnum: TicketPriorityEnum,
        subject: string,
        ticketStatus: TicketStatusEnum,
        assignAdminId?: number,
        resolvedAt?: Date,
        employeeName?: string,
        employeeEmail?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.id = id;
        this.ticketCode = ticketCode;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeEmail = employeeEmail;
        this.categoryEnum = categoryEnum;
        this.priorityEnum = priorityEnum;
        this.subject = subject;
        this.ticketStatus = ticketStatus;
        this.assignAdminId = assignAdminId;
        this.resolvedAt = resolvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class GetAllTicketsModel extends GlobalResponse {
    override tickets: TicketResponseModel[];
    constructor(status: boolean, code: number, message: string, tickets: TicketResponseModel[]) {
        super(status, code, message);
        this.tickets = tickets;
    }
}

export class GetTicketByIdModel extends GlobalResponse {
    override ticket: TicketResponseModel;
    constructor(status: boolean, code: number, message: string, ticket: TicketResponseModel) {
        super(status, code, message);
        this.ticket = ticket;
    }
}

export class GetTicketsByUserModel {
    userEmail: string;
    constructor(userEmail: string) {
        this.userEmail = userEmail;
    }
}
