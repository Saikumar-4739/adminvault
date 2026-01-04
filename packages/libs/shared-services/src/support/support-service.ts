import { CommonAxiosService } from '../common-axios-service';

export enum SupportTicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum SupportCategory {
    TECHNICAL = 'TECHNICAL',
    BILLING = 'BILLING',
    FEATURE_REQUEST = 'FEATURE_REQUEST',
    BUG_REPORT = 'BUG_REPORT',
    GENERAL = 'GENERAL',
}

export interface SupportTicket {
    id: number;
    subject: string;
    description: string;
    category: SupportCategory;
    priority: SupportTicketPriority;
    status: SupportTicketStatus;
    companyId: number;
    createdBy: number;
    assignedTo?: number;
    response?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    creator?: any;
    assignee?: any;
}

export interface CreateSupportTicketDto {
    subject: string;
    description: string;
    category: SupportCategory;
    priority: SupportTicketPriority;
}

export interface UpdateSupportTicketDto {
    subject?: string;
    description?: string;
    category?: SupportCategory;
    priority?: SupportTicketPriority;
    status?: SupportTicketStatus;
}

export class SupportService extends CommonAxiosService {
    async getAll(): Promise<{ status: boolean; message: string; data: SupportTicket[] }> {
        return this.get('/support');
    }

    async getMyTickets(): Promise<{ status: boolean; message: string; data: SupportTicket[] }> {
        return this.get('/support/my-tickets');
    }

    async getStatistics(): Promise<{ status: boolean; message: string; data: any }> {
        return this.get('/support/statistics');
    }

    async getById(id: number): Promise<{ status: boolean; message: string; data: SupportTicket }> {
        return this.get(`/support/${id}`);
    }

    async create(data: CreateSupportTicketDto): Promise<{ status: boolean; message: string; data: SupportTicket }> {
        return this.post('/support', data);
    }

    async update(id: number, data: UpdateSupportTicketDto): Promise<{ status: boolean; message: string; data: SupportTicket }> {
        return this.put(`/support/${id}`, data);
    }

    async delete(id: number): Promise<{ status: boolean; message: string }> {
        return this.delete(`/support/${id}`);
    }

    async updateStatus(id: number, status: SupportTicketStatus): Promise<{ status: boolean; message: string; data: SupportTicket }> {
        return this.post(`/support/${id}/status`, { status });
    }

    async assignTicket(id: number, assignedTo: number): Promise<{ status: boolean; message: string; data: SupportTicket }> {
        return this.post(`/support/${id}/assign`, { assignedTo });
    }

    async addResponse(id: number, response: string): Promise<{ status: boolean; message: string; data: SupportTicket }> {
        return this.post(`/support/${id}/response`, { response });
    }
}
