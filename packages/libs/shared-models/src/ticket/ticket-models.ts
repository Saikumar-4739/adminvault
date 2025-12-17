import { GlobalResponse } from '@adminvault/backend-utils';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '../enums';

export class CreateTicketModel {
    ticketCode: string;
    employeeId: number;
    assignAdminId?: number;
    categoryEnum: TicketCategoryEnum;
    priorityEnum: TicketPriorityEnum;
    subject: string;
    ticketStatus: TicketStatusEnum;
    resolvedAt?: Date;

    constructor(
        ticketCode: string,
        employeeId: number,
        categoryEnum: TicketCategoryEnum,
        priorityEnum: TicketPriorityEnum,
        subject: string,
        ticketStatus: TicketStatusEnum = TicketStatusEnum.OPEN,
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
        employeeId: number,
        categoryEnum: TicketCategoryEnum,
        priorityEnum: TicketPriorityEnum,
        subject: string,
        ticketStatus: TicketStatusEnum = TicketStatusEnum.OPEN,
        assignAdminId?: number,
        resolvedAt?: Date
    ) {
        super(ticketCode, employeeId, categoryEnum, priorityEnum, subject, ticketStatus, assignAdminId, resolvedAt);
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
    assignAdminId?: number;
    categoryEnum: TicketCategoryEnum;
    priorityEnum: TicketPriorityEnum;
    subject: string;
    ticketStatus: TicketStatusEnum;
    resolvedAt?: Date;

    constructor(
        id: number,
        ticketCode: string,
        employeeId: number,
        categoryEnum: TicketCategoryEnum,
        priorityEnum: TicketPriorityEnum,
        subject: string,
        ticketStatus: TicketStatusEnum,
        assignAdminId?: number,
        resolvedAt?: Date
    ) {
        this.id = id;
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

export class GetAllTicketsModel extends GlobalResponse {
    tickets: TicketResponseModel[];
    constructor(status: boolean, code: number, message: string, tickets: TicketResponseModel[]) {
        super(status, code, message);
        this.tickets = tickets;
    }
}

export class GetTicketByIdModel extends GlobalResponse {
    ticket: TicketResponseModel;
    constructor(status: boolean, code: number, message: string, ticket: TicketResponseModel) {
        super(status, code, message);
        this.ticket = ticket;
    }
}
